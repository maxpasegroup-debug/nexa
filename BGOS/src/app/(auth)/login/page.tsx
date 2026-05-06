"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";

import { getRoleRedirect } from "@/lib/role-redirect";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

      router.push(getRoleRedirect(role));
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
        background: "#070709",
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
            <span style={{ color: "#F0EEF8" }}>Welcome to </span>
            <span style={{ color: "#7C6FFF" }}>BGOS</span>
          </div>
          <div style={{ fontSize: "13px", color: "#6B6878", fontWeight: 300 }}>
            Sign in to your workspace
          </div>
        </div>

        <div
          style={{
            background: "#13131c",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "16px",
            padding: "32px",
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
              <label style={{ display: "block", fontSize: "12px", color: "#6B6878", marginBottom: "6px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                style={{ width: "100%", background: "#0e0e13", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "12px 14px", fontSize: "14px", color: "#F0EEF8", outline: "none", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box" }}
                onFocus={(event) => {
                  event.target.style.borderColor = "#7C6FFF";
                }}
                onBlur={(event) => {
                  event.target.style.borderColor = "rgba(255,255,255,0.1)";
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ fontSize: "12px", color: "#6B6878", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Password
                </label>
                <Link href="/forgot-password" style={{ fontSize: "12px", color: "#7C6FFF", textDecoration: "none" }}>
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                style={{ width: "100%", background: "#0e0e13", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "12px 14px", fontSize: "14px", color: "#F0EEF8", outline: "none", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box" }}
                onFocus={(event) => {
                  event.target.style.borderColor = "#7C6FFF";
                }}
                onBlur={(event) => {
                  event.target.style.borderColor = "rgba(255,255,255,0.1)";
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", background: loading ? "#534AB7" : "#7C6FFF", color: "white", border: "none", borderRadius: "8px", padding: "13px", fontSize: "14px", fontWeight: 500, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif" }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p style={{ marginTop: "14px", textAlign: "center", fontSize: "12px", lineHeight: 1.6, color: "#8B8798" }}>
            New employee? Use the login credentials sent to your email.
          </p>

          <div style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "#6B6878" }}>
            No account yet?{" "}
            <Link href="/register" style={{ color: "#7C6FFF", textDecoration: "none" }}>
              Create one free
            </Link>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "11px", color: "#6B6878" }}>
          By signing in you agree to our{" "}
          <Link href="/terms" style={{ color: "#7C6FFF", textDecoration: "none" }}>
            Terms and Conditions
          </Link>
        </div>
      </div>
    </main>
  );
}
