import { Router, type IRouter, type Request, type Response } from "express";
import { rateLimit } from "express-rate-limit";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, adminUsersTable } from "@workspace/db";
import {
  AdminLoginBody,
  AdminLoginResponse,
  AdminLogoutResponse,
  GetAdminMeResponse,
  ChangeAdminPasswordBody,
} from "@workspace/api-zod";

declare module "express-session" {
  interface SessionData {
    adminUserId?: number;
  }
}

const router: IRouter = Router();

// ─── Seed default admin on startup ───────────────────────────────────────────
export async function seedAdminUser(): Promise<void> {
  const existing = await db.select({ id: adminUsersTable.id }).from(adminUsersTable).limit(1);
  if (existing.length > 0) return;

  const username = process.env["ADMIN_USERNAME"] ?? "admin";
  const password = process.env["ADMIN_PASSWORD"] ?? "admin123";
  const hash = await bcrypt.hash(password, 12);

  await db.insert(adminUsersTable).values({ username, passwordHash: hash });
}

// ─── In-memory failed-attempt tracker ────────────────────────────────────────
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

interface AttemptRecord {
  count: number;
  firstFailAt: number;
  lockedUntil: number | null;
}

const failedAttempts = new Map<string, AttemptRecord>();

function getAttemptKey(req: Request): string {
  const ip = (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim()
    ?? req.socket.remoteAddress
    ?? "unknown";
  return ip;
}

function checkLockout(req: Request): { locked: boolean; secondsLeft: number } {
  const key = getAttemptKey(req);
  const record = failedAttempts.get(key);
  if (!record) return { locked: false, secondsLeft: 0 };

  if (record.lockedUntil && Date.now() < record.lockedUntil) {
    return { locked: true, secondsLeft: Math.ceil((record.lockedUntil - Date.now()) / 1000) };
  }

  // Lockout expired — clear it
  if (record.lockedUntil && Date.now() >= record.lockedUntil) {
    failedAttempts.delete(key);
  }

  return { locked: false, secondsLeft: 0 };
}

function recordFailure(req: Request): { locked: boolean; attemptsLeft: number } {
  const key = getAttemptKey(req);
  const now = Date.now();
  const existing = failedAttempts.get(key);

  // Reset window if first failure was > 15 min ago
  if (existing && (now - existing.firstFailAt) > LOCKOUT_WINDOW_MS && !existing.lockedUntil) {
    failedAttempts.delete(key);
  }

  const record = failedAttempts.get(key) ?? { count: 0, firstFailAt: now, lockedUntil: null };
  record.count += 1;

  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_WINDOW_MS;
    failedAttempts.set(key, record);
    return { locked: true, attemptsLeft: 0 };
  }

  failedAttempts.set(key, record);
  return { locked: false, attemptsLeft: MAX_ATTEMPTS - record.count };
}

function clearFailures(req: Request): void {
  failedAttempts.delete(getAttemptKey(req));
}

// ─── IP rate limiters ─────────────────────────────────────────────────────────

// Broad IP cap: 30 login requests per 15 min (catches bots before lockout kicks in)
const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many requests from this IP. Please try again in 15 minutes." },
  skipSuccessfulRequests: true,
});

// Tight cap on reset: 5 attempts per hour
const resetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many reset attempts from this IP. Please try again in 1 hour." },
});

// ─── Login ────────────────────────────────────────────────────────────────────
router.post("/admin/login", loginRateLimit, async (req: Request, res: Response): Promise<void> => {
  // Check if this IP is locked out
  const lockout = checkLockout(req);
  if (lockout.locked) {
    res.status(429).json({
      error: `Account locked due to too many failed attempts. Try again in ${Math.ceil(lockout.secondsLeft / 60)} minute(s).`,
      locked: true,
      secondsLeft: lockout.secondsLeft,
    });
    return;
  }

  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Username and password are required." });
    return;
  }

  const [user] = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.username, parsed.data.username));

  if (!user) {
    const result = recordFailure(req);
    if (result.locked) {
      res.status(429).json({ error: "Account locked after too many failed attempts. Try again in 15 minutes.", locked: true });
    } else {
      res.status(401).json({ error: "Invalid credentials.", attemptsLeft: result.attemptsLeft });
    }
    return;
  }

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) {
    const result = recordFailure(req);
    if (result.locked) {
      res.status(429).json({ error: "Account locked after too many failed attempts. Try again in 15 minutes.", locked: true });
    } else {
      res.status(401).json({ error: "Invalid credentials.", attemptsLeft: result.attemptsLeft });
    }
    return;
  }

  // Successful login — clear failure record
  clearFailures(req);
  req.session.adminUserId = user.id;
  res.json(AdminLoginResponse.parse({ id: user.id, username: user.username }));
});

// ─── Logout ───────────────────────────────────────────────────────────────────
router.post("/admin/logout", async (req: Request, res: Response): Promise<void> => {
  req.session.destroy(() => {
    res.json(AdminLogoutResponse.parse({ success: true }));
  });
});

// ─── Me ───────────────────────────────────────────────────────────────────────
router.get("/admin/me", async (req: Request, res: Response): Promise<void> => {
  if (!req.session.adminUserId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [user] = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.id, req.session.adminUserId));

  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  res.json(GetAdminMeResponse.parse({ id: user.id, username: user.username }));
});

// ─── Change password (requires active session) ────────────────────────────────
router.post("/admin/change-password", async (req: Request, res: Response): Promise<void> => {
  if (!req.session.adminUserId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const parsed = ChangeAdminPasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [user] = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.id, req.session.adminUserId));

  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Current password is incorrect." });
    return;
  }

  const newHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await db
    .update(adminUsersTable)
    .set({ passwordHash: newHash })
    .where(eq(adminUsersTable.id, user.id));

  res.json({ success: true });
});

// ─── Reset password via secret phrase (no session required) ───────────────────
router.post("/admin/reset-password", resetRateLimit, async (req: Request, res: Response): Promise<void> => {
  const { secretPhrase, newPassword } = req.body as { secretPhrase?: unknown; newPassword?: unknown };

  if (typeof secretPhrase !== "string" || !secretPhrase) {
    res.status(400).json({ error: "secretPhrase is required." });
    return;
  }
  if (typeof newPassword !== "string" || newPassword.length < 6) {
    res.status(400).json({ error: "newPassword must be at least 6 characters." });
    return;
  }

  const resetPhrase = process.env["ADMIN_RESET_PHRASE"] ?? "nike";
  if (secretPhrase !== resetPhrase) {
    res.status(401).json({ error: "Invalid secret phrase." });
    return;
  }

  const [user] = await db.select({ id: adminUsersTable.id }).from(adminUsersTable).limit(1);
  if (!user) {
    res.status(404).json({ error: "No admin account found." });
    return;
  }

  const newHash = await bcrypt.hash(newPassword, 12);
  await db
    .update(adminUsersTable)
    .set({ passwordHash: newHash })
    .where(eq(adminUsersTable.id, user.id));

  // Clear any login lockouts after a successful reset
  clearFailures(req);

  res.json({ success: true });
});

export default router;
