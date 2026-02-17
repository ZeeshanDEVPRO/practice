import redis from "../redis/redis";

interface QuizResults {
  quizId: string;
  data: any;
  cached?: boolean;
  computedAt: string;
}

const quizServices = {
  // Cache-aside: check Redis first, otherwise compute and cache for 60s
  async getQuizResults(quizId: string): Promise<QuizResults> {
    const key = `quiz:results:${quizId}`;
    const cached = await redis.get(key);
    if (cached) {
      const parsed = JSON.parse(cached) as QuizResults;
      parsed.cached = true;
      return parsed;
    }

    // Simulate expensive computation
    const results: QuizResults = {
      quizId,
      data: { scoreDistribution: { A: 10, B: 5, C: 2 }, summary: `Results for ${quizId}` },
      computedAt: new Date().toISOString(),
    };

    await redis.set(key, JSON.stringify(results), "EX", 60);
    return results;
  },

  // Invalidate cache when quiz is updated
  async updateQuiz(quizId: string, payload: any) {
    // Simulate updating persistent storage (omitted)
    const key = `quiz:results:${quizId}`;
    await redis.del(key);
    return { ok: true };
  },
};

export default quizServices;
