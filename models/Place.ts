import mongoose, { Schema, models, model } from "mongoose";

// GeoJSON point — MongoDB's native way of storing coordinates so we can
// run real "find things near me" queries with a 2dsphere index.
const PointSchema = new Schema(
  {
    type: { type: String, enum: ["Point"], default: "Point" },
    // IMPORTANT: GeoJSON order is [longitude, latitude] — opposite of how
    // most people say coordinates out loud. Easy bug to hit later.
    coordinates: { type: [Number], required: true },
  },
  { _id: false }
);

const PlaceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: {
      type: String,
      enum: ["cafe", "food", "viewpoint", "hidden-spot", "event", "service", "other"],
      default: "other",
    },
    photoUrl: { type: String, default: "" },
    location: { type: PointSchema, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdByName: { type: String, default: "Anonymous Explorer" },
    tags: { type: [String], default: [] },
    isFirstDiscovery: { type: Boolean, default: true },
  },
  { timestamps: true }
);

PlaceSchema.index({ location: "2dsphere" });

export default models.Place || model("Place", PlaceSchema);
