// Runs automatically before `npm run dev` and `npm run build` (via npm's
// pre-script hooks in package.json — no extra command needed).
//
// This exists because of two real problems that came up while setting up
// WAY: dependencies not actually installed (causing a cryptic "Module not
// found: mongoose" error deep in a route file), and a placeholder/missing
// .env.local (causing a confusing DNS error from MongoDB). Both are easy
// to fix once you know what's wrong — the point of this script is just to
// say what's wrong, plainly, before Next.js gets a chance to fail weirdly.

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

function fail(message) {
  console.error("\n\x1b[31m✖ " + message + "\x1b[0m\n");
  process.exit(1);
}

// 1. Are dependencies actually installed?
const requiredPackages = ["mongoose", "next-auth", "leaflet", "react-leaflet", "bcryptjs", "lucide-react"];
const missingPackages = requiredPackages.filter(
  (pkg) => !fs.existsSync(path.join(root, "node_modules", pkg))
);
if (missingPackages.length > 0) {
  fail(
    `Dependencies not installed: ${missingPackages.join(", ")}\n\n` +
      `  Run:  npm install\n\n` +
      `If you've already run npm install and still see this, delete node_modules\n` +
      `and package-lock.json and reinstall from scratch.`
  );
}

// 2. Does .env.local exist?
const envPath = path.join(root, ".env.local");
if (!fs.existsSync(envPath)) {
  fail(
    ".env.local not found.\n\n" +
      "  Run:  cp .env.example .env.local\n\n" +
      "Then open .env.local and fill in MONGODB_URI (from MongoDB Atlas) and\n" +
      "NEXTAUTH_SECRET (generate one with: openssl rand -base64 32)."
  );
}

// 3. Are the required values actually filled in (not left as placeholders)?
const envContent = fs.readFileSync(envPath, "utf-8");
const envVars = {};
envContent.split("\n").forEach((line) => {
  const match = line.match(/^([A-Z_]+)=(.*)$/);
  if (match) envVars[match[1]] = match[2].trim();
});

const placeholderMarkers = ["your_", "replace_with", "here"];
const required = ["MONGODB_URI", "NEXTAUTH_SECRET", "NEXTAUTH_URL"];
const problems = required.filter((key) => {
  const value = envVars[key] || "";
  return !value || placeholderMarkers.some((marker) => value.toLowerCase().includes(marker));
});

if (problems.length > 0) {
  fail(
    `These required values in .env.local are missing or still placeholders: ${problems.join(", ")}\n\n` +
      `See .env.example for what each one needs and where to get it.`
  );
}

console.log("\x1b[32m✓ Setup looks good — starting WAY...\x1b[0m\n");
