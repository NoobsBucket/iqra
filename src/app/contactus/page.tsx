"use client";

import { useRef, useState } from "react";
import { ArrowUpRight, BookOpen, CheckCircle2, Mail, MessageCircle, Phone } from "lucide-react";
import { HeaderNavigationBase } from "../components/application/app-navigation/header-navigation";
import { API_BASE_URL, getApiError } from "@/lib/api";

const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/aboutus" },
  { label: "Courses", href: "/courses" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contactus" },
];

export default function ContactUsPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showAyah, setShowAyah] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(false);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim(),
      subject: String(form.get("subject") ?? "").trim(),
      message: String(form.get("message") ?? "").trim(),
    };

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/v1/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw await getApiError(response, "Contact request failed");
      formRef.current?.reset();
      setSent(true);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Your message could not be sent. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <HeaderNavigationBase items={navItems} activeUrl="/contactus" />
      <main className="min-h-screen overflow-hidden bg-[#f5f7f2] font-medium text-[#102b2a] [font-family:var(--font-jost),sans-serif] [&_h1]:font-bold [&_h2]:font-bold [&_button]:font-bold">
        <section className="relative border-b border-[#dce5df] bg-[#102b2a] px-5 py-16 text-[#f5f7f2] md:px-10 md:py-24">
          <div className="absolute right-[-5rem] top-[-7rem] size-72 rounded-full border border-[#d9c989]/25" />
          <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#d9c989]"><MessageCircle className="size-4" /> Start a conversation</p>
              <h1 className="max-w-3xl text-5xl font-black leading-[0.98] tracking-tight md:text-7xl">Let&apos;s make your next step clearer.</h1>
              <p className="mt-7 max-w-xl text-base leading-8 text-white/70 md:text-lg">Ask about courses, private guidance, or a learning path that fits your season of life. Our team reads every message.</p>
            </div>
            <button type="button" onClick={() => setShowAyah((value) => !value)} className="group rounded-[2rem] border border-white/15 bg-white/10 p-6 text-left backdrop-blur-sm transition hover:border-[#d9c989]/60 hover:bg-white/15">
              <div className="flex items-center justify-between text-[#d9c989]"><BookOpen className="size-5" /><ArrowUpRight className="size-5 transition group-hover:translate-x-1 group-hover:-translate-y-1" /></div>
              <p className="mt-8 text-right text-2xl leading-loose text-white md:text-3xl" dir="rtl">فَإِنَّ مَعَ الْعُسْرِ يُسْرًا</p>
              <p className="mt-3 text-sm leading-6 text-white/65">Indeed, with hardship comes ease. <span className="text-[#d9c989]">{showAyah ? "94:6 · Keep going" : "Tap to reflect"}</span></p>
            </button>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 md:px-10 md:py-20 lg:grid-cols-[0.7fr_1.3fr]">
          <aside className="space-y-4">
            <div className="border-b border-[#dce5df] pb-6"><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#9b7d2c]">Reach out</p><h2 className="mt-3 text-3xl font-black tracking-tight">A thoughtful reply starts here.</h2></div>
            <a href="mailto:hello@iqrainternational.com" className="flex items-center gap-4 border-b border-[#dce5df] py-5 text-sm transition hover:text-[#9b7d2c]"><Mail className="size-5 text-[#9b7d2c]" /><span>hello@iqrainternational.com</span></a>
            <a href="tel:+10000000000" className="flex items-center gap-4 border-b border-[#dce5df] py-5 text-sm transition hover:text-[#9b7d2c]"><Phone className="size-5 text-[#9b7d2c]" /><span>+1 (000) 000-0000</span></a>
            <p className="pt-3 text-sm leading-7 text-[#536866]">Usually answered within one working day.</p>
          </aside>

          <div className="rounded-[2rem] border border-[#dce5df] bg-white p-6 shadow-[0_24px_70px_rgba(16,43,42,0.08)] md:p-10">
            {sent ? (
              <div className="flex min-h-[30rem] flex-col items-center justify-center py-16 text-center animate-in fade-in zoom-in-95 duration-500">
                <div className="flex size-20 items-center justify-center rounded-full bg-[#e1f1e9] text-[#197052]"><CheckCircle2 className="size-10" /></div>
                <p className="mt-7 text-xs font-bold uppercase tracking-[0.22em] text-[#9b7d2c]">Message received</p>
                <h2 className="mt-3 text-4xl font-black tracking-tight">Thank you for reaching out.</h2>
                <p className="mt-4 max-w-md leading-7 text-[#536866]">Your message is safely on its way to our team. We&apos;ll be in touch soon.</p>
                <button type="button" onClick={() => setSent(false)} className="mt-8 rounded-xl border border-[#cbd9d2] px-5 py-3 text-sm font-bold transition hover:border-[#102b2a]">Send another message</button>
              </div>
            ) : (
              <form ref={formRef} onSubmit={submit} className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2"><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#9b7d2c]">Contact form</p><h2 className="mt-2 text-3xl font-black tracking-tight">Tell us what you need.</h2></div>
                <input required name="name" placeholder="Your name" className="rounded-xl border border-[#dce5df] bg-[#f8faf8] px-4 py-3.5 outline-none transition focus:border-[#9b7d2c] focus:bg-white" />
                <input required name="email" type="email" placeholder="Email address" className="rounded-xl border border-[#dce5df] bg-[#f8faf8] px-4 py-3.5 outline-none transition focus:border-[#9b7d2c] focus:bg-white" />
                <input name="phone" placeholder="Phone / WhatsApp" className="rounded-xl border border-[#dce5df] bg-[#f8faf8] px-4 py-3.5 outline-none transition focus:border-[#9b7d2c] focus:bg-white" />
                <input required name="subject" placeholder="Subject" className="rounded-xl border border-[#dce5df] bg-[#f8faf8] px-4 py-3.5 outline-none transition focus:border-[#9b7d2c] focus:bg-white" />
                <textarea required name="message" placeholder="Write your message..." className="min-h-40 rounded-xl border border-[#dce5df] bg-[#f8faf8] px-4 py-3.5 outline-none transition focus:border-[#9b7d2c] focus:bg-white md:col-span-2" />
                <button type="submit" disabled={submitting} className="rounded-xl bg-[#102b2a] px-5 py-3.5 font-bold text-white transition hover:bg-[#197052] disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2">{submitting ? "Sending..." : "Send message"}</button>
                {error ? <p className="rounded-xl bg-[#fff1ef] px-4 py-3 text-sm text-[#a33a32] md:col-span-2">{error}</p> : null}
              </form>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
