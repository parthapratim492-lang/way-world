"use client";

import { useState } from "react";

// NOTE: This stores a resized image directly as a data URL string.
// It works today with zero external accounts, which matters for getting the
// full loop running fast — but it's not how a production app should store
// images long-term (database bloat, slower queries). Swap this for
// Cloudinary or S3 uploads once you're ready to add a storage account.
export default function PhotoUpload({ onChange }: { onChange: (dataUrl: string) => void }) {
  const [preview, setPreview] = useState<string>("");
  const [busy, setBusy] = useState(false);

  function handleFile(file: File) {
    setBusy(true);
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1000;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
        setPreview(dataUrl);
        onChange(dataUrl);
        setBusy(false);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {busy && <p className="status">Processing photo…</p>}
      {preview && (
        <img
          src={preview}
          alt="preview"
          style={{ width: "100%", borderRadius: 10, marginTop: 8, maxHeight: 220, objectFit: "cover" }}
        />
      )}
    </div>
  );
}
