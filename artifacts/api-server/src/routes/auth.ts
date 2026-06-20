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

router.post("/admin/logout", async (req, res): Promise<void> => {
  req.session.destroy(() => {
    res.json(AdminLogoutResponse.parse({ success: true }));
  });
});

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

export default router;
