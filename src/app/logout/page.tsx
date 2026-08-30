"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";

export default function LogoutPage() {
  const [message, setMessage] = useState("Logging out...");

  useEffect(() => {
    const logout = async () => {
      localStorage.removeItem("iqra-user");
      window.dispatchEvent(new Event("iqra-user-changed"));

      try {
        const response = await fetch(`${API_BASE_URL}/v1/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error("Logout failed");
        window.location.assign("/login");
      } catch {
        window.location.assign("/login");
      }
    };

    logout();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold text-slate-700">{message}</p>
      </div>
    </main>
  );
}
