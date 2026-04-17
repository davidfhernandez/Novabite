import mongoose, { Model, Schema } from "mongoose";

interface AdminUserDocument {
  email: string;
  passwordHash: string;
  role: string;
  activo: boolean;
  lastLoginAt?: Date;
}

const adminUserSchema = new Schema<AdminUserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, default: "admin" },
    activo: { type: Boolean, required: true, default: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true },
);

export const AdminUserModel =
  (mongoose.models.AdminUser as Model<AdminUserDocument>) ||
  mongoose.model<AdminUserDocument>("AdminUser", adminUserSchema);
