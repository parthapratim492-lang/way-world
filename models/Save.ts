import { Schema, models, model } from "mongoose";

const SaveSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    place: { type: Schema.Types.ObjectId, ref: "Place", required: true },
  },
  { timestamps: true }
);

// A user can only save a place once.
SaveSchema.index({ user: 1, place: 1 }, { unique: true });

export default models.Save || model("Save", SaveSchema);
