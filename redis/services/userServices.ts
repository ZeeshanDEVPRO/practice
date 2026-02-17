import redis from "../redis/redis";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret";
const LEADERBOARD_KEY = "leaderboard:global";

interface UserProfile {
	userId: string;
	username: string;
	totalScore: number;
	quizzesSolved: number;
}

const userServices = {
	async signup(user: string, password: string, username?: string) {
		if (!user || !password) throw new Error("user and password required");
		const key = `auth:${user}`;
		const exists = await redis.get(key);
		if (exists) throw new Error("User already exists");
		const hash = await bcrypt.hash(password, 10);
		await redis.set(key, hash);
		
		// Create user profile using Redis Hash (Task 2)
		const profileKey = `user:profile:${user}`;
		await redis.hset(profileKey, {
			userId: user,
			username: username || user,
			totalScore: "0",
			quizzesSolved: "0",
		});

		// Add user to leaderboard with initial score 0
		await redis.zadd(LEADERBOARD_KEY, 0, user);
		return { user, username: username || user };
	},

	async login(user: string, password: string) {
		if (!user || !password) throw new Error("user and password required");
		const key = `auth:${user}`;
		const hash = await redis.get(key);
		if (!hash) throw new Error("Invalid credentials");
		const match = await bcrypt.compare(password, hash);
		if (!match) throw new Error("Invalid credentials");
		const token = jwt.sign({ user }, JWT_SECRET, { expiresIn: "1h" });
		await redis.set(`session:${token}`, user, "EX", 60 * 60);
		return token;
	},

	// Task 2: Retrieve full profile efficiently using HGETALL
	async getUserProfile(userId: string): Promise<UserProfile> {
		const profileKey = `user:profile:${userId}`;
		const profile = await redis.hgetall(profileKey);
		
		if (!profile || Object.keys(profile).length === 0) {
			throw new Error("User profile not found");
		}
		
		return {
			userId: profile.userId,
			username: profile.username,
			totalScore: parseInt(profile.totalScore, 10),
			quizzesSolved: parseInt(profile.quizzesSolved, 10),
		};
	},

	// Task 2: Increment score atomically using HINCRBY
	async incrementScore(userId: string, points: number): Promise<number> {
		const profileKey = `user:profile:${userId}`;
		// Determine previous rank to detect entering top 10
		const prevRank = await redis.zrevrank(LEADERBOARD_KEY, userId);
		// Use a transaction to update both the hash and sorted set
		const pipeline = redis.multi();
		pipeline.hincrby(profileKey, "totalScore", points);
		pipeline.zincrby(LEADERBOARD_KEY, points, userId);
		await pipeline.exec();
		// Read new score and rank
		const newScoreStr = await redis.hget(profileKey, "totalScore");
		const newScore = Number(newScoreStr || 0);
		const newRank0 = await redis.zrevrank(LEADERBOARD_KEY, userId);
		const newRank = newRank0 === null ? null : newRank0 + 1; // 1-based
		// If user entered top 10 (was outside or null before, now within 1..10), publish event
		if ((prevRank === null || prevRank >= 10) && newRank !== null && newRank <= 10) {
			await redis.publish(
				"leaderboard:events",
				JSON.stringify({ userId, newScore, rank: newRank, event: "entered_top_10" })
			);
		}
		return newScore;
	},

	// Task 2: Increment quizzes solved atomically
	async incrementQuizzesSolved(userId: string): Promise<number> {
		const profileKey = `user:profile:${userId}`;
		const newCount = await redis.hincrby(profileKey, "quizzesSolved", 1);
		return newCount;
	},

	// Task 2: Update profile fields using HSET
	async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
		const profileKey = `user:profile:${userId}`;
		const updateObj: Record<string, string> = {};
		
		if (updates.username) updateObj.username = updates.username;
		if (updates.totalScore !== undefined) updateObj.totalScore = updates.totalScore.toString();
		if (updates.quizzesSolved !== undefined) updateObj.quizzesSolved = updates.quizzesSolved.toString();
		
		if (Object.keys(updateObj).length > 0) {
			await redis.hset(profileKey, updateObj);
		}
		
		return this.getUserProfile(userId);
	}
};

export default userServices;