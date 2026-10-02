"use client";

import axios from "axios";
import { useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { notifyAdminToast } from "@/app/components/admin/admin-toast";

type MediaType = "image" | "video";
type UploadStatus = "idle" | "cropping" | "signing" | "uploading" | "success" | "error";
type CropArea = { x: number; y: number; width: number; height: number };

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
  cropAspect,
}: {
  label: string;
  mediaType: MediaType;
  value: string;
  onChange: (url: string) => void;
  cropAspect?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [cropSource, setCropSource] = useState("");
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropArea, setCropArea] = useState<CropArea | null>(null);

  const handleSelect = async (file?: File) => {
    if (!file) return;
    setProgress(0);

    if (!acceptedTypes[mediaType].includes(file.type)) {
      setStatus("error");
      notifyAdminToast({ message: `Choose a supported ${mediaType} file.`, tone: "error" });
      return;
    }

    if (file.size > maxSizes[mediaType]) {
      setStatus("error");
      notifyAdminToast({ message: `${mediaType === "image" ? "Images" : "Videos"} must be smaller than ${mediaType === "image" ? "20 MB" : "5 GB"}.`, tone: "error" });
      return;
    }

    if (mediaType === "image" && cropAspect) {
      setCropFile(file);
      setCropSource(URL.createObjectURL(file));
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCropArea(null);
      return;
    }

    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    const toastId = crypto.randomUUID();
    try {
      setStatus("signing");
      notifyAdminToast({ id: toastId, message: "Preparing upload...", tone: "info", progress: 0 });
      const { data } = await axios.post<{ uploadUrl: string; publicUrl: string }>("/api/media/upload-url", {
        fileName: file.name,
        contentType: file.type,
        size: file.size,
        mediaType,
      });

      setStatus("uploading");
      let lastToastProgress = -10;
      await axios.put(data.uploadUrl, file, {
        headers: { "Content-Type": file.type },
        onUploadProgress: (event) => {
          if (!event.total) return;
          const percent = Math.round((event.loaded / event.total) * 100);
          setProgress(percent);
          if (percent === 100 || percent - lastToastProgress >= 10) {
            lastToastProgress = percent;
            notifyAdminToast({ id: toastId, message: "Uploading...", tone: "info", progress: percent });
          }
        },
      });

      onChange(data.publicUrl);
      setProgress(100);
      setStatus("success");
      notifyAdminToast({ id: toastId, message: "Uploaded", tone: "success", progress: 100 });
    } catch (uploadError) {
      const responseError = axios.isAxiosError<{ error?: string; message?: string }>(uploadError)
        ? uploadError.response?.data?.error ?? uploadError.response?.data?.message
        : undefined;
      const message = responseError ?? (uploadError instanceof Error ? uploadError.message : "Upload failed. Try again.");
      setStatus("error");
      notifyAdminToast({ id: toastId, message: `Upload failed: ${message}`, tone: "error" });
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const closeCrop = (cancelled = false) => {
    if (cropSource) URL.revokeObjectURL(cropSource);
    setCropSource("");
    setCropFile(null);
    setCropArea(null);
    if (cancelled) {
      setStatus("idle");
      notifyAdminToast({ message: "Crop cancelled", tone: "info" });
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const applyCrop = async () => {
    if (!cropFile || !cropArea) return;
    setStatus("cropping");
    notifyAdminToast({ message: "Preparing image...", tone: "info", progress: 0 });

    try {
      const image = await createImageBitmap(cropFile);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(cropArea.width);
      canvas.height = Math.round(cropArea.height);
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Image cropping is unavailable in this browser.");
      context.drawImage(image, cropArea.x, cropArea.y, cropArea.width, cropArea.height, 0, 0, canvas.width, canvas.height);
      image.close();

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((result) => result ? resolve(result) : reject(new Error("Could not crop this image.")), "image/webp", 0.92);
      });
      const name = cropFile.name.replace(/\.[^.]+$/, "") || "thumbnail";
      const croppedFile = new File([blob], `${name}.webp`, { type: "image/webp" });
      closeCrop();
      await uploadFile(croppedFile);
    } catch (cropError) {
      setStatus("error");
      notifyAdminToast({ message: cropError instanceof Error ? cropError.message : "Could not crop this image.", tone: "error" });
    }
  };

  const clearFile = () => {
    onChange("");
    setStatus("idle");
    setProgress(0);
  };

  const busy = status === "cropping" || status === "signing" || status === "uploading";

  return (
    <div className="space-y-2">
      <span className="block text-sm font-semibold text-slate-700">{label}</span>
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept={mediaType === "image" ? "image/jpeg,image/png,image/webp,image/avif,image/gif" : "video/mp4,video/webm,video/quicktime,video/mpeg"}
          disabled={busy}
          onChange={(event) => void handleSelect(event.target.files?.[0])}
          className="sr-only"
        />
        <button type="button" aria-label={`${value ? "Replace" : "Upload"} ${label.toLowerCase()}`} onClick={() => inputRef.current?.click()} disabled={busy} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50">
          {value ? "Replace" : "Upload"}
        </button>
        {value ? <span className="min-w-0 flex-1 truncate text-xs text-slate-500">{status === "success" ? "Uploaded" : "Current file"}</span> : null}
        {value ? (
          <button type="button" onClick={clearFile} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Remove
          </button>
        ) : null}
      </div>
      {busy ? (
        <div aria-live="polite" className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-600">
            <span>{status === "cropping" ? "Preparing image..." : status === "signing" ? "Preparing upload..." : "Uploading..."}</span>
            <span>{status === "uploading" ? `${progress}%` : ""}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-teal-600 transition-[width]" style={{ width: `${status === "uploading" ? progress : 4}%` }} />
          </div>
        </div>
      ) : null}
      {value ? (
        mediaType === "image" ? (
          <div className="max-w-xl overflow-hidden rounded-lg border border-slate-200 bg-slate-100" style={cropAspect ? { aspectRatio: String(cropAspect) } : undefined}>
            <img src={value} alt={`${label} preview`} className={`h-full w-full ${cropAspect ? "object-cover" : "max-h-40 object-contain"}`} />
          </div>
        ) : (
          <video controls preload="metadata" src={value} className="aspect-video w-full max-w-xl rounded-lg bg-slate-950" />
        )
      ) : null}
      {cropSource && cropAspect ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/70 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeCrop(true); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="thumbnail-crop-title" className="w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <h2 id="thumbnail-crop-title" className="text-lg font-bold text-slate-900">Adjust thumbnail</h2>
                <p className="mt-1 text-sm text-slate-500">Frame matches the lesson card.</p>
              </div>
              <button type="button" onClick={() => closeCrop(true)} aria-label="Close crop editor" className="rounded-md p-2 text-slate-500 hover:bg-slate-100">×</button>
            </div>
            <div className="relative h-[min(58vh,440px)] bg-slate-950">
              <Cropper image={cropSource} crop={crop} zoom={zoom} aspect={cropAspect} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={(_, pixels) => setCropArea(pixels)} />
            </div>
            <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center">
              <label className="flex min-w-0 flex-1 items-center gap-3 text-sm text-slate-700">
                <span>Zoom</span>
                <input aria-label="Thumbnail zoom" type="range" min="1" max="3" step="0.01" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} className="min-w-0 flex-1 accent-teal-700" />
              </label>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => closeCrop(true)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>
                <button type="button" onClick={() => void applyCrop()} disabled={!cropArea || busy} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Crop & upload</button>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}