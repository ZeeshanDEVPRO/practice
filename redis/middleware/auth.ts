import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export default function auth(req: Request, res: Response, next: NextFunction) {
	const authHeader = req.headers.authorization;
	if (!authHeader) return res.status(401).json({ message: "No token provided" });
	const parts = authHeader.split(" ");
	if (parts.length !== 2) return res.status(401).json({ message: "Token error" });
	const token = parts[1];
	try {
		const decoded = jwt.verify(token, JWT_SECRET) as any;
		(req as any).user = decoded;
		next();
	} catch (err) {
		return res.status(401).json({ message: "Invalid token" });
	}
}