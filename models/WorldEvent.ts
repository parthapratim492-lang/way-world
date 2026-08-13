import { Schema, models, model } from "mongoose";

const WorldEventSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["DISCOVERY"], // more types (TRENDING, EXPLORER, EVENT) get added once we have real signals to back them
      required: true,
    },
    placeId: { type: Schema.Types.ObjectId, ref: "Place", required: true },
    placeName: { type: String, required: true },
    category: { type: String },
    userName: { type: String, required: true },
  },
  { timestamps: true }
);

export default models.WorldEvent || model("WorldEvent", WorldEventSchema);
