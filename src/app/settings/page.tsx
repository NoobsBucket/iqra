"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL, DEFAULT_SETTINGS, type SettingsRecord } from "@/lib/api";

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsRecord>({ ...DEFAULT_SETTINGS });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/v1/settings`);
        if (!response.ok) throw new Error("Failed to load settings");
        const data = (await response.json()) as SettingsRecord;

        setSettings({ ...DEFAULT_SETTINGS, ...data });
      } catch {
        setError("Settings API not reachable right now. Showing default values.");
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...DEFAULT_SETTINGS, ...settings }),
      });

      if (!response.ok) throw new Error("Save failed");
    } catch {
      setError("Unable to save settings to the live API.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Settings</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900">Platform settings</h1>

        {loading ? <p className="mt-6 text-slate-600">Loading live settings…</p> : null}
        {error ? <p className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

        <div className="mt-8 space-y-4">
          <label className="block text-sm font-semibold text-slate-700">
            Site name
            <input value={settings.site_name} onChange={(event) => setSettings((current) => ({ ...current, site_name: event.target.value }))} className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-teal-500" />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Site email
            <input value={settings.site_email} onChange={(event) => setSettings((current) => ({ ...current, site_email: event.target.value }))} className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-teal-500" />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Site phone
            <input value={settings.site_phone} onChange={(event) => setSettings((current) => ({ ...current, site_phone: event.target.value }))} className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 outline-none focus:border-teal-500" />
          </label>
        </div>

        <button onClick={handleSave} className="mt-8 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700">
          Save settings
        </button>
      </div>
    </main>
  );
}
