import type { Request, Response, NextFunction } from "express";

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.session.adminUserId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
