"use client";

import { useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface Props {
  sessionId: string;
  initialMessages: Message[];
  isComplete: boolean;
}

export default function NexaChat({ sessionId, initialMessages, isComplete }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(isComplete);
  const [submitting, setSubmitting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      void sendMessage("Hello");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    setInput("");
    setLoading(true);

    const userMsg: Message = {
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("/api/nexa/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: text }),
      });
      const data = (await res.json()) as { response?: string; messages?: Message[] };
      if (!res.ok || !data.messages) throw new Error("Chat failed");
      setMessages(data.messages);

      if (data.response?.toLowerCase().includes("ready to submit")) {
        setDone(true);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleFinalize() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/nexa/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      if (res.ok) {
        window.location.href = "/bdm/onboarding";
        return;
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", background: "#070709", fontFamily: "Inter, sans-serif" }}>
      <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 10, background: "#0e0e13" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #7C3AED, #06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 14 }}>N</div>
        <div>
          <div style={{ color: "#F0EEF8", fontWeight: 700, fontSize: 14 }}>NEXA</div>
          <div style={{ color: "#22D9A0", fontSize: 11 }}>{loading ? "typing..." : "online"}</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.map((msg, index) => (
          <div key={`${msg.timestamp}-${index}`} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "80%", padding: "10px 14px", borderRadius: msg.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px", background: msg.role === "user" ? "rgba(124,58,237,0.25)" : "rgba(255,255,255,0.06)", border: msg.role === "user" ? "1px solid rgba(124,58,237,0.4)" : "1px solid rgba(255,255,255,0.08)", color: "#F0EEF8", fontSize: 14, lineHeight: 1.6 }}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading ? (
          <div style={{ display: "flex", gap: 4, padding: "8px 14px" }}>
            {[0, 1, 2].map((item) => (
              <div key={item} style={{ width: 8, height: 8, borderRadius: "50%", background: "#7C3AED", animation: `bounce 1s ${item * 0.2}s infinite` }} />
            ))}
          </div>
        ) : null}

        {done && !isComplete ? (
          <div style={{ background: "rgba(34,217,160,0.08)", border: "1px solid rgba(34,217,160,0.3)", borderRadius: 12, padding: 16, textAlign: "center" }}>
            <div style={{ color: "#22D9A0", fontWeight: 700, marginBottom: 8 }}>Ready to submit</div>
            <div style={{ color: "#6B6878", fontSize: 12, marginBottom: 12 }}>NEXA will generate the summary and send to SDE</div>
            <button onClick={handleFinalize} disabled={submitting} style={{ background: "#22D9A0", color: "#070709", border: "none", borderRadius: 8, padding: "12px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer", width: "100%" }}>
              {submitting ? "Submitting..." : "Submit to SDE ->"}
            </button>
          </div>
        ) : null}

        <div ref={bottomRef} />
      </div>

      {!done ? (
        <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.07)", background: "#0e0e13", display: "flex", gap: 10, alignItems: "center" }}>
          <input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && void sendMessage(input)} placeholder="Type your reply..." style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 14px", color: "#F0EEF8", fontSize: 14, outline: "none" }} />
          <button onClick={() => void sendMessage(input)} disabled={loading || !input.trim()} style={{ background: "#7C3AED", border: "none", borderRadius: 10, width: 44, height: 44, color: "white", fontSize: 18, cursor: "pointer" }}>-&gt;</button>
        </div>
      ) : null}

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
