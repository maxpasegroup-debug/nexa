"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, Menu, Send, X } from "lucide-react";

type ChatMessage = { id: string; role: "nexa" | "user"; content: string };

type Fields = {
  name: string;
  company: string;
  employeeCount: string;
  challenge: string;
  email: string;
  phone: string;
  bdmName: string;
};

type Industry = {
  id: string;
  icon: string;
  name: string;
  desc: string;
  stages: string[];
  color: string;
};

declare global {
  interface Window {
    openMobileNexaChat?: () => void;
  }
}

const industries: Industry[] = [
  { id: "solar", icon: "☀️", name: "Solar and Renewable", desc: "Channel partners, EPC companies, rooftop installers", stages: ["Enquiry", "Site Survey", "Quotation", "Approval", "Installation", "Payment"], color: "#F5A623" },
  { id: "clinic", icon: "🏥", name: "Clinics and Hospitals", desc: "Patient management, appointments, follow-up care", stages: ["New Patient", "Appointment", "Consultation", "Follow-up", "Regular"], color: "#00BCD4" },
  { id: "realestate", icon: "🏢", name: "Real Estate", desc: "Site visits, broker networks, deal tracking", stages: ["Enquiry", "Site Visit", "Negotiation", "Token", "Agreement", "Done"], color: "#009688" },
  { id: "coaching", icon: "📚", name: "Coaching and Academies", desc: "Batch management, fee collection, student tracking", stages: ["Enquiry", "Demo Class", "Enrolled", "Fee Pending", "Active"], color: "#FF9800" },
  { id: "builders", icon: "🏗️", name: "Builders and Construction", desc: "Project tracking, site coordination, milestones", stages: ["Enquiry", "Survey", "Quotation", "Contract", "Construction", "Handover"], color: "#4CAF50" },
  { id: "retail", icon: "🏪", name: "Retail and Distribution", desc: "Dealer networks, orders, payments, reorders", stages: ["Dealer Enquiry", "Demo", "Order", "Dispatch", "Delivery", "Payment"], color: "#FF5722" },
];

const agents = [
  { icon: "⚡", name: "Sales Booster", tag: "Omni-channel leads", price: "₹1,499/mo", color: "#7C6FFF", bg: "linear-gradient(135deg,#0d0820,#050d15)", slug: "sales-booster" },
  { icon: "💬", name: "Wazzup", tag: "NEXA on WhatsApp", price: "₹999/mo", color: "#25D366", bg: "linear-gradient(135deg,#0d1a0f,#050a08)", slug: "wazzup" },
  { icon: "🧾", name: "TaxMate", tag: "GST automated", price: "₹799/mo", color: "#F5A623", bg: "linear-gradient(135deg,#1a1205,#120f00)", slug: "taxmate" },
  { icon: "👥", name: "PeopleDesk", tag: "HR autopilot", price: "₹799/mo", color: "#7C6FFF", bg: "linear-gradient(135deg,#0a0a1a,#120a1a)", slug: "peopledesk" },
  { icon: "🏗️", name: "SiteSync", tag: "Project tracking", price: "₹1,499/mo", color: "#4CAF50", bg: "linear-gradient(135deg,#0f1a00,#1a1200)", slug: "sitesync" },
  { icon: "🏥", name: "CareLoop", tag: "Patient care", price: "₹1,299/mo", color: "#00BCD4", bg: "linear-gradient(135deg,#0a1520,#00101a)", slug: "careloop" },
  { icon: "🎓", name: "EduFlow", tag: "Student journeys", price: "₹999/mo", color: "#FF9800", bg: "linear-gradient(135deg,#1a0f00,#1a0a00)", slug: "eduflow" },
  { icon: "🏫", name: "ClassMate", tag: "School management", price: "₹1,299/mo", color: "#9C27B0", bg: "linear-gradient(135deg,#150a1a,#0f0a20)", slug: "classmate" },
  { icon: "🏢", name: "PropPilot", tag: "Real estate", price: "₹1,299/mo", color: "#009688", bg: "linear-gradient(135deg,#001a0f,#001510)", slug: "proppilot" },
  { icon: "🏪", name: "StockSense", tag: "Orders and dealers", price: "₹999/mo", color: "#FF5722", bg: "linear-gradient(135deg,#1a0a05,#1a0500)", slug: "stocksense" },
];

const nexaSets = [
  ["Focus Point's solar workspace is live. 3 pipelines, 6 team members active.", "Suresh has 4 site visits to follow up. I assigned them automatically."],
  ["Priya Clinic - 8 patient follow-ups due today. Reminders sent.", "Health score improved from 61 to 79 this month."],
  ["PropVision - 5 site visit leads going cold. I reassigned them now.", "Revenue up ₹62,000 this month vs last month."],
];

const id = () => Math.random().toString(36).slice(2);
const newToken = () => `mobile_nexa_${Date.now()}_${Math.random().toString(36).slice(2)}`;
const initialFields = (): Fields => ({ name: "", company: "", employeeCount: "", challenge: "", email: "", phone: "", bdmName: "" });

function nextPrompt(step: number, fields: Fields) {
  if (step === 1) return `Great ${fields.name}! What is your company name and what does your business do?`;
  if (step === 2) return "How many people are on your team?";
  if (step === 3) return "What is your biggest challenge right now - leads, team management, or operations?";
  if (step === 4) return `What is your email address? We will send you a summary of what BGOS can do for ${fields.company}.`;
  if (step === 5) return `Perfect. Last thing - what is your WhatsApp number? Our Business Manager will call you within 2 hours to show you how BGOS can help ${fields.company} specifically.`;
  return "";
}

function SectionHead({ label, title, subtitle }: { label: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#22D9A0]">{label}</p>
      <h2 className="mt-2 font-heading text-[28px] font-extrabold leading-tight tracking-[-1px] text-[#F0EEF8]">{title}</h2>
      {subtitle ? <p className="mt-2 text-[13px] font-light leading-6 text-[#6B6878]">{subtitle}</p> : null}
    </div>
  );
}

function NexaAvatar() {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#7C6FFF] to-[#22D9A0] font-heading text-sm font-extrabold text-black">
      N
    </div>
  );
}

function MobileNexaOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([{ id: id(), role: "nexa", content: "Hi! I am NEXA. What is your name?" }]);
  const [fields, setFields] = useState<Fields>(() => initialFields());
  const [step, setStep] = useState(0);
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);
  const [sessionToken] = useState(() => newToken());
  const bottomRef = useRef<HTMLDivElement>(null);
  const quickReplies = step === 2 ? ["Just me", "2-5", "6-15", "16-50", "50+"] : step === 3 ? ["Managing leads", "Team coordination", "Customer follow-up", "All of the above"] : [];

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function finish(nextFields: Fields, currentMessages: ChatMessage[]) {
    setSubmitting(true);
    const response = await fetch("/api/onboarding/landing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: nextFields.name,
        email: nextFields.email,
        phone: nextFields.phone,
        companyName: nextFields.company,
        employeeCount: nextFields.employeeCount,
        businessType: nextFields.company,
        challenge: nextFields.challenge,
        sessionToken,
      }),
    });
    const data = (await response.json().catch(() => ({}))) as { bdmName?: string };
    setSubmitting(false);
    if (!response.ok) {
      setMessages([...currentMessages, { id: id(), role: "nexa", content: "I could not notify the team right now. Please try again in a moment." }]);
      return;
    }
    setFields({ ...nextFields, bdmName: data.bdmName ?? "our Business Manager" });
    setComplete(true);
  }

  async function answer(value: string) {
    const text = value.trim();
    if (!text || submitting) return;
    const nextFields = { ...fields };
    const nextStep = step + 1;
    if (step === 0) nextFields.name = text;
    if (step === 1) nextFields.company = text;
    if (step === 2) nextFields.employeeCount = text;
    if (step === 3) nextFields.challenge = text;
    if (step === 4) nextFields.email = text.toLowerCase();
    if (step === 5) nextFields.phone = text;
    const nextMessages = [...messages, { id: id(), role: "user" as const, content: text }];
    setInput("");
    setFields(nextFields);
    if (step === 5) {
      setMessages(nextMessages);
      await finish(nextFields, nextMessages);
      return;
    }
    setStep(nextStep);
    setMessages([...nextMessages, { id: id(), role: "nexa", content: nextPrompt(nextStep, nextFields) }]);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void answer(input);
  }

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col bg-[#070709] text-[#F0EEF8] transition-transform duration-300 ${open ? "translate-y-0" : "translate-y-full"}`}>
      <header className="flex h-[58px] shrink-0 items-center gap-3 border-b border-white/[0.08] px-4">
        <button type="button" onClick={onClose} className="rounded-xl border border-white/[0.08] p-2 text-[#F0EEF8]" aria-label="Close NEXA chat"><ArrowLeft className="h-4 w-4" /></button>
        <NexaAvatar />
        <div>
          <p className="font-heading text-sm font-extrabold">NEXA</p>
          <p className="text-xs text-[#22D9A0]">online</p>
        </div>
      </header>
      {complete ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="mb-6 flex h-20 w-20 animate-bounce items-center justify-center rounded-full bg-[#22D9A0]/15 text-[#22D9A0]"><Check className="h-10 w-10" /></div>
          <h2 className="font-heading text-[22px] font-extrabold">Thank you {fields.name}!</h2>
          <p className="mt-3 text-sm text-[#6B6878]">Our team will contact you shortly.</p>
          <p className="mt-4 text-sm font-bold text-[#22D9A0]">{fields.bdmName} will call {fields.phone} within 2 hours.</p>
          <button type="button" onClick={onClose} className="mt-8 rounded-2xl bg-[#7C6FFF] px-8 py-3 font-heading text-sm font-extrabold text-white">Close</button>
        </div>
      ) : (
        <>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-5">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-6 ${message.role === "user" ? "rounded-tr-sm bg-[#22D9A0] text-black" : "rounded-tl-sm border border-white/[0.08] bg-[#13131c]"}`}>{message.content}</div>
              </div>
            ))}
            {submitting ? <p className="text-xs text-[#6B6878]">Notifying the team...</p> : null}
            <div ref={bottomRef} />
          </div>
          <div className="border-t border-white/[0.08] px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3">
            {quickReplies.length > 0 ? <div className="mb-3 flex gap-2 overflow-x-auto">{quickReplies.map((reply) => <button key={reply} type="button" onClick={() => void answer(reply)} className="shrink-0 rounded-full bg-[#7C6FFF]/15 px-4 py-2 text-xs font-bold text-[#a89fff]">{reply}</button>)}</div> : null}
            <form onSubmit={submit} className="flex gap-2">
              <input value={input} onChange={(event) => setInput(event.target.value)} placeholder={step === 4 ? "you@company.com" : step === 5 ? "WhatsApp number" : "Type your answer..."} className="min-w-0 flex-1 rounded-2xl border border-white/[0.08] bg-[#0f0f14] px-4 py-3 text-sm outline-none" />
              <button type="submit" disabled={!input.trim() || submitting} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7C6FFF] disabled:opacity-50"><Send className="h-4 w-4" /></button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

export default function MobileLandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [industryId, setIndustryId] = useState("solar");
  const [messageSet, setMessageSet] = useState(0);
  const activeIndustry = useMemo(() => industries.find((item) => item.id === industryId) ?? industries[0], [industryId]);

  useEffect(() => {
    window.openMobileNexaChat = () => setChatOpen(true);
    return () => {
      delete window.openMobileNexaChat;
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setMessageSet((current) => (current + 1) % nexaSets.length), 4000);
    return () => window.clearInterval(timer);
  }, []);

  const openChat = () => setChatOpen(true);
  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#070709] pb-[92px] pt-[52px] font-sans text-[#F0EEF8]">
      <header className="fixed inset-x-0 top-0 z-50 flex h-[52px] items-center justify-between border-b border-white/[0.08] bg-[#070709]/95 px-4 backdrop-blur-xl">
        <Link href="/" className="font-heading text-xl font-extrabold"><span>BG</span><span className="text-[#7C6FFF]">OS</span></Link>
        <button type="button" onClick={() => setMenuOpen(true)} className="rounded-xl border border-white/[0.08] p-2" aria-label="Open menu"><Menu className="h-5 w-5" /></button>
      </header>

      <div className={`fixed inset-0 z-[9998] bg-[#070709] px-6 pt-5 transition-transform duration-300 ${menuOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="mb-10 flex items-center justify-between"><span className="font-heading text-xl font-extrabold">BG<span className="text-[#7C6FFF]">OS</span></span><button type="button" onClick={closeMenu} className="p-2"><X className="h-5 w-5" /></button></div>
        {["How it works", "Industries", "Marketplace", "Pricing"].map((item) => <a key={item} href={`#${item.toLowerCase().replaceAll(" ", "-")}`} onClick={closeMenu} className="block h-14 border-b border-white/[0.08] py-4 font-heading text-base font-extrabold">{item}</a>)}
        <button type="button" onClick={() => { closeMenu(); openChat(); }} className="mt-8 h-14 w-full rounded-2xl bg-[#22D9A0] font-heading text-sm font-extrabold text-black">Get your workspace</button>
      </div>

      <section className="px-4 pb-12 pt-8" style={{ background: "radial-gradient(ellipse at top right, rgba(124,111,255,0.12), transparent 60%)" }}>
        <p className="text-xs font-bold text-[#7C6FFF]">🇮🇳 Built for Indian businesses</p>
        <h1 className="mt-4 font-heading text-[36px] font-extrabold leading-[1.1] tracking-[-1.5px]">Your business, running <span className="text-[#7C6FFF]">itself.</span></h1>
        <p className="mt-4 max-w-[340px] text-[15px] font-light leading-6 text-[#6B6878]">NEXA is your AI CEO. Custom workspace built in 24 hours.</p>
        <button type="button" onClick={openChat} className="mt-7 w-full rounded-[20px] border border-white/[0.08] bg-[#13131c] p-4 text-left">
          <div className="flex items-center justify-between"><div className="flex items-center gap-3"><NexaAvatar /><div><p className="font-heading text-sm font-extrabold">NEXA</p><p className="flex items-center gap-1 text-xs text-[#22D9A0]"><span className="h-2 w-2 rounded-full bg-[#22D9A0]" /> Online</p></div></div><span className="text-[10px] font-bold text-[#7C6FFF]">CEO · AI</span></div>
          <div className="mt-5 space-y-3">
            {nexaSets[messageSet].map((message) => <div key={message} className="rounded-2xl rounded-tl-sm border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm leading-6">{message}</div>)}
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-[#0f0f14] px-3 py-2 text-sm text-[#6B6878]"><span className="flex-1">Tell NEXA about your business...</span><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7C6FFF] text-white"><Send className="h-4 w-4" /></span></div>
        </button>
        <p className="mt-4 text-center text-[11px] text-[#6B6878]">✓ 7-day free trial · ✓ Setup in 24 hours · ✓ Cancel anytime</p>
      </section>

      <section id="how-it-works" className="px-4 py-10">
        <SectionHead label="HOW IT WORKS" title="Ready in 24 hours." subtitle="We do the setup. You run the business." />
        <div className="snap-x snap-mandatory overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none]"><div className="flex gap-3">
          {[["01", "💬", "Chat with NEXA", "Tell NEXA about your company. 5 minutes."], ["02", "🔧", "We build your workspace", "Our team configures everything in 24 hours."], ["03", "🚀", "Team goes live", "Everyone gets their dashboard. NEXA runs it."]].map(([num, icon, title, desc]) => <div key={num} className="relative min-w-[200px] snap-start overflow-hidden rounded-2xl border border-white/[0.08] bg-[#13131c] p-5"><span className="absolute right-3 top-1 font-heading text-5xl font-extrabold text-white/[0.04]">{num}</span><span className="text-2xl">{icon}</span><h3 className="mt-5 font-heading text-sm font-extrabold">{title}</h3><p className="mt-2 text-xs leading-5 text-[#6B6878]">{desc}</p></div>)}
        </div></div><div className="mt-4 flex justify-center gap-2">{[0, 1, 2].map((dot) => <span key={dot} className={`h-1.5 rounded-full ${dot === 0 ? "w-5 bg-[#7C6FFF]" : "w-1.5 bg-white/20"}`} />)}</div>
      </section>

      <section id="industries" className="px-4 py-10">
        <SectionHead label="INDUSTRIES" title="Built for your business." />
        <div className="mb-4 flex gap-2 overflow-x-auto">{industries.map((industry) => <button key={industry.id} onClick={() => setIndustryId(industry.id)} className={`shrink-0 rounded-full border px-4 py-2 text-[13px] ${industryId === industry.id ? "border-[#7C6FFF]/40 bg-[#7C6FFF]/15 text-[#a89fff]" : "border-white/[0.08] text-[#F0EEF8]"}`}>{industry.icon} {industry.name.split(" ")[0]}</button>)}</div>
        <div className="rounded-2xl border border-white/[0.08] bg-[#13131c] p-5 transition-opacity duration-200"><div className="text-3xl">{activeIndustry.icon}</div><h3 className="mt-3 font-heading text-base font-extrabold">{activeIndustry.name}</h3><p className="mt-1 text-xs text-[#6B6878]">{activeIndustry.desc}</p><div className="mt-4 flex flex-wrap gap-2">{activeIndustry.stages.map((stage) => <span key={stage} className="rounded-full px-2.5 py-1 text-[10px] font-bold text-black" style={{ backgroundColor: activeIndustry.color }}>{stage}</span>)}</div></div>
      </section>

      <section className="px-4 py-10"><SectionHead label="WHAT YOU GET" title="One platform. Every team." /><div className="snap-x snap-mandatory overflow-x-auto"><div className="flex gap-3">{[["⚡", "NEXA AI CEO", "Daily briefings, task assignment, health score, insights - all automatic.", "The core"], ["📊", "Custom Pipelines", "Your industry's stages, not generic ones.", "Industry specific"], ["👥", "Role Dashboards", "Each employee sees only their work.", "Custom per role"], ["🔔", "Smart Automations", "NEXA acts when you cannot.", "Always on"]].map(([icon, title, desc, badge]) => <div key={title} className="min-w-[220px] snap-start rounded-2xl border border-white/[0.08] bg-[#13131c] p-5"><span className="text-2xl">{icon}</span><h3 className="mt-4 font-heading text-sm font-extrabold">{title}</h3><p className="mt-2 text-xs leading-5 text-[#6B6878]">{desc}</p><span className="mt-4 inline-flex rounded-full bg-[#7C6FFF]/15 px-2.5 py-1 text-[10px] font-bold text-[#a89fff]">{badge}</span></div>)}</div></div></section>

      <section id="marketplace" className="px-4 py-10"><SectionHead label="MARKETPLACE" title="Extend with AI agents." subtitle="Plug-and-play agents. Set up by our team in 24 hours." /><div className="snap-x snap-mandatory overflow-x-auto"><div className="flex gap-3">{agents.map((agent) => <Link key={agent.slug} href={`/marketplace/${agent.slug}`} className="min-w-[160px] snap-start rounded-2xl border border-white/[0.08] p-4" style={{ background: agent.bg }}><span className="text-2xl">{agent.icon}</span><h3 className="mt-4 font-heading text-sm font-extrabold">{agent.name}</h3><p className="mt-1 text-[11px] text-[#6B6878]">{agent.tag}</p><p className="mt-4 font-heading text-[13px] font-extrabold" style={{ color: agent.color }}>{agent.price}</p><p className="mt-3 text-[11px] font-bold" style={{ color: agent.color }}>Learn more →</p></Link>)}</div></div><Link href="/marketplace" className="mt-5 block text-center text-sm font-bold text-[#7C6FFF]">View all agents →</Link></section>

      <section id="pricing" className="px-4 py-10"><SectionHead label="PRICING" title="Choose your plan." subtitle="+ 18% GST · autopay · 7-day free trial on all plans" /><div className="space-y-3">{[["Starter", "₹799/mo", ["CRM + tasks", "NEXA brief", "3 users"], false], ["Growth", "₹2,499/mo", ["Everything in Starter", "Custom pipelines", "Role dashboards", "Automations", "Marketplace access"], true], ["Scale", "₹6,999/mo", ["Advanced automation", "Priority setup", "Multiple teams", "Owner reporting"], false]].map(([tier, price, features, featured]) => <div key={String(tier)} className={`rounded-2xl border bg-[#13131c] p-5 ${featured ? "border-l-4 border-l-[#7C6FFF] border-white/[0.08]" : "border-white/[0.08]"}`}>{featured ? <span className="rounded-full bg-[#7C6FFF]/15 px-3 py-1 text-[10px] font-bold text-[#a89fff]">★ Most popular</span> : null}<p className="mt-3 text-xs text-[#6B6878]">{String(tier)}</p><h3 className={`mt-2 font-heading text-[28px] font-extrabold ${featured ? "text-[#7C6FFF]" : ""}`}>{String(price)}</h3><div className="mt-4 space-y-2">{(features as string[]).map((feature) => <p key={feature} className="text-sm text-[#F0EEF8]"><span className="text-[#22D9A0]">✓</span> {feature}</p>)}</div><button type="button" onClick={openChat} className={`mt-5 h-12 w-full rounded-2xl font-heading text-sm font-extrabold ${featured ? "bg-[#7C6FFF] text-white" : "border border-white/[0.08] text-white"}`}>{featured ? "Get your workspace →" : "Get started →"}</button></div>)}</div><p className="mt-5 text-center text-xs italic text-[#6B6878]">Every plan includes custom workspace setup by our team. Not self-serve.</p></section>

      <section className="px-4 py-10"><SectionHead label="REAL BUSINESSES" title="Workspaces we built." /><div className="space-y-3">{[["☀️", "Solar distribution, Kerala", "6 members", "3 pipelines", "18 hours", "Multi-product tracking", ["Lead", "Survey", "Quote", "Install"]], ["🏥", "Clinic, Tamil Nadu", "8 members", "1 pipeline", "12 hours", "Patient follow-up", ["Patient", "Visit", "Follow-up", "Regular"]], ["💼", "Digital agency, Gujarat", "5 members", "2 pipelines", "16 hours", "Project milestones", ["Brief", "Design", "Review", "Live"]]].map(([icon, name, team, pipes, time, feature, stages]) => <div key={String(name)} className="rounded-2xl border border-white/[0.08] bg-[#13131c] p-4"><h3 className="font-heading text-sm font-extrabold">{icon} {name}</h3><div className="mt-4 grid grid-cols-2 gap-2 text-xs"><span>Team size<br /><b>{team}</b></span><span>Pipelines<br /><b>{pipes}</b></span><span>Setup time<br /><b>{time}</b></span><span>Key feature<br /><b>{feature}</b></span></div><div className="mt-4 flex flex-wrap gap-2">{(stages as string[]).map((stage) => <span key={stage} className="rounded-full bg-white/[0.05] px-2 py-1 text-[10px] text-[#6B6878]">{stage}</span>)}</div></div>)}</div></section>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.08] bg-[#070709]/95 px-4 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl" style={{ willChange: "transform" }}>
        <button type="button" onClick={openChat} className="h-12 w-full rounded-[14px] bg-gradient-to-br from-[#7C6FFF] to-[#9186FF] font-heading text-[15px] font-extrabold text-white">Get your free workspace →</button>
      </div>

      <MobileNexaOverlay open={chatOpen} onClose={() => setChatOpen(false)} />
    </main>
  );
}
