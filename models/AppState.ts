import mongoose, { Model, Schema } from "mongoose";

interface AppStateDocument {
  key: string;
  value: string;
}

const appStateSchema = new Schema<AppStateDocument>(
  {
    key: { type: String, required: true, unique: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

export const AppStateModel =
  (mongoose.models.AppState as Model<AppStateDocument>) ||
  mongoose.model<AppStateDocument>("AppState", appStateSchema);
