import { Router, type IRouter } from "express";
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

// ─── Login ────────────────────────────────────────────────────────────────────
router.post("/admin/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [user] = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.username, parsed.data.username));

  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  req.session.adminUserId = user.id;
  res.json(AdminLoginResponse.parse({ id: user.id, username: user.username }));
});

// ─── Logout ───────────────────────────────────────────────────────────────────
router.post("/admin/logout", async (req, res): Promise<void> => {
  req.session.destroy(() => {
    res.json(AdminLogoutResponse.parse({ success: true }));
  });
});

// ─── Me ───────────────────────────────────────────────────────────────────────
router.get("/admin/me", async (req, res): Promise<void> => {
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

// ─── Change password (requires current password + active session) ─────────────
router.post("/admin/change-password", async (req, res): Promise<void> => {
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
    res.status(401).json({ error: "Current password is incorrect" });
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
router.post("/admin/reset-password", async (req, res): Promise<void> => {
  const { secretPhrase, newPassword } = req.body as { secretPhrase?: unknown; newPassword?: unknown };

  if (typeof secretPhrase !== "string" || !secretPhrase) {
    res.status(400).json({ error: "secretPhrase is required" });
    return;
  }
  if (typeof newPassword !== "string" || newPassword.length < 6) {
    res.status(400).json({ error: "newPassword must be at least 6 characters" });
    return;
  }

  const resetPhrase = process.env["ADMIN_RESET_PHRASE"] ?? "nike";
  if (secretPhrase !== resetPhrase) {
    res.status(401).json({ error: "Invalid secret phrase" });
    return;
  }

  // Reset the first admin user's password
  const [user] = await db.select({ id: adminUsersTable.id }).from(adminUsersTable).limit(1);
  if (!user) {
    res.status(404).json({ error: "No admin account found" });
    return;
  }

  const newHash = await bcrypt.hash(newPassword, 12);
  await db
    .update(adminUsersTable)
    .set({ passwordHash: newHash })
    .where(eq(adminUsersTable.id, user.id));

  res.json({ success: true });
});

export default router;
