import type { NextFunction, Request, Response } from "express";

export function rateLimit(windowMs: number, max: number) {
  const hits = new Map<string, number[]>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip ?? "unknown";
    const now = Date.now();
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

    if (recent.length >= max) {
      res.status(429).json({ error: "Too many requests, slow down" });
      return;
    }

    recent.push(now);
    hits.set(key, recent);
    next();
  };
}
