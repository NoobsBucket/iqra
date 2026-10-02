"use client";

import axios from "axios";
import { useRef, useState } from "react";

type MediaType = "image" | "video";
type UploadStatus = "idle" | "signing" | "uploading" | "success" | "error";

const maxSizes: Record<MediaType, number> = {
  image: 20 * 1024 * 1024,
  video: 5 * 1024 * 1024 * 1024,
};

const acceptedTypes: Record<MediaType, string[]> = {
  image: ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"],
  video: ["video/mp4", "video/webm", "video/quicktime", "video/mpeg"],
};

export function MediaUpload({
  label,
  mediaType,
  value,
  onChange,
}: {
  label: string;
  mediaType: MediaType;
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const handleSelect = async (file?: File) => {
    if (!file) return;
    setError("");
    setProgress(0);

    if (!acceptedTypes[mediaType].includes(file.type)) {
      setStatus("error");
      setError(`Choose a supported ${mediaType} file.`);
      return;
    }

    if (file.size > maxSizes[mediaType]) {
      setStatus("error");
      setError(`${mediaType === "image" ? "Images" : "Videos"} must be smaller than ${mediaType === "image" ? "20 MB" : "5 GB"}.`);
      return;
    }

    try {
      setStatus("signing");
      const { data } = await axios.post<{ uploadUrl: string; publicUrl: string }>("/api/media/upload-url", {
        fileName: file.name,
        contentType: file.type,
        size: file.size,
        mediaType,
      });

      setStatus("uploading");
      await axios.put(data.uploadUrl, file, {
        headers: { "Content-Type": file.type },
        onUploadProgress: (event) => {
          if (event.total) setProgress(Math.round((event.loaded / event.total) * 100));
        },
      });

      onChange(data.publicUrl);
      setProgress(100);
      setStatus("success");
    } catch (uploadError) {
      const responseError = axios.isAxiosError<{ error?: string; message?: string }>(uploadError)
        ? uploadError.response?.data?.error ?? uploadError.response?.data?.message
        : undefined;
      setError(responseError ?? (uploadError instanceof Error ? uploadError.message : "Upload failed. Try again."));
      setStatus("error");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const clearFile = () => {
    onChange("");
    setStatus("idle");
    setProgress(0);
    setError("");
  };

  const busy = status === "signing" || status === "uploading";

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700">{label}</label>
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept={mediaType === "image" ? "image/jpeg,image/png,image/webp,image/avif,image/gif" : "video/mp4,video/webm,video/quicktime,video/mpeg"}
          disabled={busy}
          onChange={(event) => void handleSelect(event.target.files?.[0])}
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:font-semibold file:text-slate-700 disabled:opacity-60"
        />
        {value ? (
          <button type="button" onClick={clearFile} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Remove
          </button>
        ) : null}
      </div>
      {busy ? (
        <div aria-live="polite" className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-600">
            <span>{status === "signing" ? "Preparing secure upload..." : "Uploading to Cloudflare R2..."}</span>
            <span>{status === "signing" ? "" : `${progress}%`}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-teal-600 transition-[width]" style={{ width: `${status === "signing" ? 4 : progress}%` }} />
          </div>
        </div>
      ) : null}
      {status === "success" ? <p role="status" className="text-xs font-semibold text-teal-700">Upload complete. The R2 URL is ready to save.</p> : null}
      {error ? <p role="alert" className="text-xs font-semibold text-rose-700">{error}</p> : null}
      {value ? (
        mediaType === "image" ? (
          <img src={value} alt={`${label} preview`} className="max-h-40 max-w-full rounded-lg border border-slate-200 object-contain" />
        ) : (
          <video controls preload="metadata" src={value} className="aspect-video w-full max-w-xl rounded-lg bg-slate-950" />
        )
      ) : null}
    </div>
  );
}