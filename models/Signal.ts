import { Schema, models, model } from "mongoose";
import { SIGNALS } from "@/lib/signals";

const SignalSchema = new Schema(
  {
    place: { type: Schema.Types.ObjectId, ref: "Place", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    signalId: { type: String, enum: SIGNALS.map((s) => s.id), required: true },
  },
  { timestamps: true }
);

// A user can apply a given signal to a given place only once (toggle to remove).
SignalSchema.index({ place: 1, user: 1, signalId: 1 }, { unique: true });

export default models.Signal || model("Signal", SignalSchema);
