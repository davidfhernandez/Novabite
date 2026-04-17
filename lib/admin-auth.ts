import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

import { connectToDatabase } from "@/lib/mongodb";
import { AdminUserModel } from "@/models/AdminUser";

const ADMIN_SEED_EMAIL = process.env.ADMIN_SEED_EMAIL;
const ADMIN_SEED_PASSWORD = process.env.ADMIN_SEED_PASSWORD;
const ADMIN_SEED_ROLE = process.env.ADMIN_SEED_ROLE ?? "admin";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, storedHash: string) {
  const [salt, originalHash] = storedHash.split(":");
  if (!salt || !originalHash) {
    return false;
  }

  const derived = scryptSync(password, salt, 64);
  const original = Buffer.from(originalHash, "hex");

  if (derived.length !== original.length) {
    return false;
  }

  return timingSafeEqual(derived, original);
}

export async function ensureAdminSeed() {
  await connectToDatabase();

  if (!ADMIN_SEED_EMAIL || !ADMIN_SEED_PASSWORD) {
    throw new Error(
      "Faltan ADMIN_SEED_EMAIL o ADMIN_SEED_PASSWORD. Configúralos en .env.local para crear el admin inicial.",
    );
  }

  const email = normalizeEmail(ADMIN_SEED_EMAIL);
  const existing = await AdminUserModel.findOne({ email });

  if (existing) {
    return existing;
  }

  return AdminUserModel.create({
    email,
    passwordHash: hashPassword(ADMIN_SEED_PASSWORD),
    role: ADMIN_SEED_ROLE,
    activo: true,
  });
}

export async function validateAdminCredentials(email: string, password: string) {
  await ensureAdminSeed();

  const admin = await AdminUserModel.findOne({ email: normalizeEmail(email), activo: true });

  if (!admin) {
    return null;
  }

  const valid = verifyPassword(password, admin.passwordHash);

  if (!valid) {
    return null;
  }

  admin.lastLoginAt = new Date();
  await admin.save();

  return {
    id: String(admin._id),
    email: admin.email,
    role: admin.role,
  };
}
