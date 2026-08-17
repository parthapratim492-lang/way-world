import { Schema, models, model } from "mongoose";

const BlogPostSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, default: "" },
    content: { type: String, required: true },
    coverImage: { type: String, default: "" },
    tags: { type: [String], default: [] },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, required: true },
    // Set server-side by checking the author's email against ADMIN_EMAIL at
    // creation time — not a role a user can set on themselves. See
    // app/api/blog/route.ts for exactly how this is decided.
    isOfficial: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default models.BlogPost || model("BlogPost", BlogPostSchema);
