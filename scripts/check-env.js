// Runs automatically before `npm run dev` and `npm run build` (via npm's
// pre-script hooks in package.json).
//
// IMPORTANT: this checks process.env FIRST, before ever looking for a
// .env.local file. That matters because hosting platforms (Vercel, Render,
// etc.) inject environment variables directly into process.env — they don't
// use a .env.local file at all. An earlier version of this script checked
// for the file unconditionally, which meant it failed on Vercel even when
// the project's environment variables were configured correctly on their
// dashboard. Lesson: a check written and tested only against local dev
// will happily break production if it assumes local dev's file layout is
// the only valid setup.

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const isDeployPlatform = Boolean(
  process.env.VERCEL || process.env.RENDER || process.env.CI || process.env.NODE_ENV === "production"
);

function fail(message) {
  console.error("\n\x1b[31m✖ " + message + "\x1b[0m\n");
  process.exit(1);
}

// 1. Are dependencies actually installed? (Applies everywhere — if this
// fails on a deploy platform, the platform's own install step failed,
// which is worth surfacing clearly too.)
const requiredPackages = ["mongoose", "next-auth", "leaflet", "react-leaflet", "bcryptjs", "lucide-react"];
const missingPackages = requiredPackages.filter(
  (pkg) => !fs.existsSync(path.join(root, "node_modules", pkg))
);
if (missingPackages.length > 0) {
  fail(
    `Dependencies not installed: ${missingPackages.join(", ")}\n\n` +
      (isDeployPlatform
        ? "The platform's install step didn't complete successfully — check its build logs above this one."
        : "  Run:  npm install\n\n" +
          "If you've already run npm install and still see this, delete node_modules\n" +
          "and package-lock.json and reinstall from scratch.")
  );
}

// 2. Do we already have everything we need from process.env? This is the
// path that covers Vercel/Render/any platform where env vars are injected
// directly — if this passes, we're done, no file needed.
const required = ["MONGODB_URI", "NEXTAUTH_SECRET", "NEXTAUTH_URL"];
const placeholderMarkers = ["your_", "replace_with", "here"];

function isPlaceholder(value) {
  return !value || placeholderMarkers.some((marker) => value.toLowerCase().includes(marker));
}

const missingFromProcessEnv = required.filter((key) => isPlaceholder(process.env[key] || ""));

if (missingFromProcessEnv.length === 0) {
  console.log("\x1b[32m✓ Setup looks good — starting WAY...\x1b[0m\n");
  process.exit(0);
}

// 3. process.env didn't have everything — fall back to checking for a
// local .env.local file, which is how local development provides these.
const envPath = path.join(root, ".env.local");

if (isDeployPlatform) {
  // On a deploy platform, there's no .env.local to fall back to — the
  // right fix is to set these in the platform's dashboard, not a file.
  fail(
    `These environment variables are missing or still placeholders: ${missingFromProcessEnv.join(", ")}\n\n` +
      `Set them in your hosting platform's dashboard (e.g. Vercel → Project → Settings → Environment\n` +
      `Variables), not in a .env.local file — that file doesn't exist in this environment.\n` +
      `See .env.example for what each variable needs.`
  );
}

if (!fs.existsSync(envPath)) {
  fail(
    ".env.local not found, and these required variables aren't set: " +
      missingFromProcessEnv.join(", ") +
      "\n\n" +
      "  Run:  cp .env.example .env.local\n\n" +
      "Then open .env.local and fill in MONGODB_URI (from MongoDB Atlas) and\n" +
      "NEXTAUTH_SECRET (generate one with: openssl rand -base64 32)."
  );
}

const envContent = fs.readFileSync(envPath, "utf-8");
const envVars = {};
envContent.split("\n").forEach((line) => {
  const match = line.match(/^([A-Z_]+)=(.*)$/);
  if (match) envVars[match[1]] = match[2].trim();
});

const stillMissing = required.filter((key) => isPlaceholder(envVars[key] || ""));

if (stillMissing.length > 0) {
  fail(
    `These required values in .env.local are missing or still placeholders: ${stillMissing.join(", ")}\n\n` +
      `See .env.example for what each one needs and where to get it.`
  );
}

console.log("\x1b[32m✓ Setup looks good — starting WAY...\x1b[0m\n");
