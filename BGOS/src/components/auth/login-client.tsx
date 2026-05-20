"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";

import { getAuthRedirect, type AuthBusinessModel } from "@/lib/auth-business-model";
import { getRoleRedirect } from "@/lib/role-redirect";

type Props = {
  businessModel: AuthBusinessModel;
  callbackUrl?: string;
};

export function LoginClient({ businessModel, callbackUrl }: Props) {
  const router = useRouter();
  const isCareer7 = businessModel === "career7";
  const isNiceJobs = businessModel === "nicejobs";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const registerHref = isCareer7
    ? "/register?businessModel=career7"
    : isNiceJobs
      ? "/register?businessModel=nicejobs"
      : "/register";
  const forgotHref = isNiceJobs ? "/forgot-password?businessModel=nicejobs" : "/forgot-password";
  const bgColor = isNiceJobs ? "#f7f7f2" : isCareer7 ? "#f8f9fd" : "#070709";
  const cardBg = isNiceJobs ? "#ffffff" : isCareer7 ? "#ffffff" : "#13131c";
  const textColor = isNiceJobs ? "#151515" : isCareer7 ? "#101633" : "#F0EEF8";
  const mutedColor = isNiceJobs ? "#555555" : isCareer7 ? "#64748b" : "#6B6878";
  const accentColor = isNiceJobs ? "#1c7c54" : isCareer7 ? "#4f46e5" : "#7C6FFF";

  async function handleEmailLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Incorrect email or password. Please try again.");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/auth/session");
      const session = (await response.json()) as {
        user?: { role?: string };
      };
      const role = session?.user?.role || "EMPLOYEE";
      const destination = getAuthRedirect({
        businessModel,
        callbackUrl,
        roleRedirect: getRoleRedirect(role),
      });

      router.push(destination);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: bgColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "28px",
              fontWeight: 800,
              marginBottom: "6px",
            }}
          >
            <span style={{ color: textColor }}>Welcome to </span>
            <span style={{ color: accentColor }}>
              {isNiceJobs ? "NICEJOBS" : isCareer7 ? "Blizzway" : "BGOS"}
            </span>
          </div>
          <div style={{ fontSize: "13px", color: mutedColor, fontWeight: 500 }}>
            {isNiceJobs
              ? "Sign in to your micro-franchise workspace"
              : isCareer7
                ? "Sign in to your career growth workspace"
                : "Sign in to your workspace"}
          </div>
        </div>

        <div
          style={{
            background: cardBg,
            border: `1px solid ${isNiceJobs ? "rgba(21,21,21,0.10)" : isCareer7 ? "rgba(79,70,229,0.12)" : "rgba(255,255,255,0.07)"}`,
            borderRadius: "8px",
            padding: "32px",
            boxShadow: isNiceJobs || isCareer7 ? "0 18px 45px rgba(15,23,42,0.08)" : undefined,
          }}
        >
          {error ? (
            <div
              style={{
                background: "rgba(255,107,107,0.1)",
                border: "1px solid rgba(255,107,107,0.3)",
                borderRadius: "8px",
                padding: "12px",
                marginBottom: "20px",
                fontSize: "13px",
                color: "#FF6B6B",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          ) : null}

          <form onSubmit={handleEmailLogin}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "12px", color: mutedColor, marginBottom: "6px", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0 }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                style={{ width: "100%", background: isNiceJobs ? "#f7f7f2" : isCareer7 ? "#f8fafc" : "#0e0e13", border: "1px solid rgba(148,163,184,0.35)", borderRadius: "8px", padding: "12px 14px", fontSize: "14px", color: textColor, outline: "none", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ fontSize: "12px", color: mutedColor, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0 }}>
                  Password
                </label>
                <Link href={forgotHref} style={{ fontSize: "12px", color: accentColor, textDecoration: "none", fontWeight: 700 }}>
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                style={{ width: "100%", background: isNiceJobs ? "#f7f7f2" : isCareer7 ? "#f8fafc" : "#0e0e13", border: "1px solid rgba(148,163,184,0.35)", borderRadius: "8px", padding: "12px 14px", fontSize: "14px", color: textColor, outline: "none", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box" }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", background: loading ? accentColor : isNiceJobs ? "#1c7c54" : isCareer7 ? "linear-gradient(90deg,#4f46e5,#7c3aed)" : "#7C6FFF", color: "white", border: "none", borderRadius: "8px", padding: "13px", fontSize: "14px", fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif" }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p style={{ marginTop: "14px", textAlign: "center", fontSize: "12px", lineHeight: 1.6, color: isNiceJobs ? "#555555" : isCareer7 ? "#64748b" : "#8B8798" }}>
            {isNiceJobs
              ? "NICEJOBS accounts run securely on the BGOS platform engine."
              : isCareer7
                ? "Your session is powered by BGOS authentication."
                : "New employee? Use the login credentials sent to your email."}
          </p>

          <div style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: mutedColor }}>
            No account yet?{" "}
            <Link href={registerHref} style={{ color: accentColor, textDecoration: "none", fontWeight: 700 }}>
              Create one free
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
