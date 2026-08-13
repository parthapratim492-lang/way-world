import { Schema, models, model } from "mongoose";

const FollowSchema = new Schema(
  {
    follower: { type: Schema.Types.ObjectId, ref: "User", required: true },
    following: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// A user can only follow another user once.
FollowSchema.index({ follower: 1, following: 1 }, { unique: true });

export default models.Follow || model("Follow", FollowSchema);
