"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, LoaderCircle, X } from "lucide-react";

type ToastTone = "info" | "success" | "error";
export type AdminToastDetail = {
  id: string;
  message: string;
  tone: ToastTone;
  progress?: number;
};

const toastEventName = "iqra-admin-toast";

export function notifyAdminToast(detail: Omit<AdminToastDetail, "id"> & { id?: string }) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<AdminToastDetail>(toastEventName, {
    detail: { ...detail, id: detail.id ?? crypto.randomUUID() },
  }));
}

export function AdminToastViewport({ message }: { message?: string }) {
  const [toast, setToast] = useState<AdminToastDetail | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onToast = (event: Event) => {
      const detail = (event as CustomEvent<AdminToastDetail>).detail;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setToast(detail);
      if (detail.tone !== "info" || detail.progress === undefined) {
        timeoutRef.current = setTimeout(() => setToast(null), detail.tone === "error" ? 6500 : 4500);
      }
    };

    window.addEventListener(toastEventName, onToast);
    return () => {
      window.removeEventListener(toastEventName, onToast);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!message) return;
    const tone = /fail|error|unavailable|required|must be|unable/i.test(message) ? "error" : "success";
    notifyAdminToast({ message, tone });
  }, [message]);

  if (!toast) return null;

  const Icon = toast.tone === "success" ? CheckCircle2 : toast.tone === "error" ? AlertCircle : LoaderCircle;
  const toneClass = toast.tone === "success"
    ? "border-emerald-200 text-emerald-900"
    : toast.tone === "error"
      ? "border-rose-200 text-rose-900"
      : "border-slate-200 text-slate-900";

  return (
    <div className="fixed inset-x-4 bottom-4 z-[100] flex justify-center sm:inset-x-auto sm:right-6 sm:justify-end">
      <div role={toast.tone === "error" ? "alert" : "status"} aria-live={toast.tone === "error" ? "assertive" : "polite"} className={`w-full max-w-md rounded-xl border bg-white p-4 shadow-[0_16px_50px_rgba(15,23,42,0.18)] ${toneClass}`}>
        <div className="flex items-start gap-3">
          <Icon aria-hidden="true" className={`mt-0.5 size-5 shrink-0 ${toast.tone === "info" ? "animate-spin" : ""}`} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{toast.message}</p>
            {toast.progress !== undefined ? (
              <div className="mt-2 flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-teal-600 transition-[width]" style={{ width: `${toast.progress}%` }} />
                </div>
                <span className="text-xs tabular-nums text-slate-600">{toast.progress}%</span>
              </div>
            ) : null}
          </div>
          <button type="button" aria-label="Dismiss notification" onClick={() => setToast(null)} className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
