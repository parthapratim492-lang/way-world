import { Schema, models, model } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    xp: { type: Number, default: 0 },
    discoveriesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default models.User || model("User", UserSchema);
