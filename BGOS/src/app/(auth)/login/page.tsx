"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    setError("");
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch {
      setError("Google login failed. Please try again.");
      setGoogleLoading(false);
    }
  }

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
      const role = session?.user?.role;

      if (role === "OWNER") router.push("/internal");
      else if (role === "BOSS") router.push("/boss");
      else if (role === "BDM") router.push("/bdm");
      else if (role === "SDE") router.push("/sde");
      else router.push("/onboarding");
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
            <span style={{ color: "#F0EEF8" }}>BG</span>
            <span style={{ color: "#7C6FFF" }}>OS</span>
          </div>
          <div style={{ fontSize: "13px", color: "#6B6878", fontWeight: 300 }}>
            Sign in to your account
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

          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              background: "white",
              color: "#1a1a1a",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "8px",
              padding: "12px 20px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: googleLoading ? "not-allowed" : "pointer",
              fontFamily: "'DM Sans', sans-serif",
              opacity: googleLoading ? 0.7 : 1,
              marginBottom: "20px",
            }}
            type="button"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z" />
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z" />
              <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z" />
              <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.3z" />
            </svg>
            {googleLoading ? "Connecting..." : "Continue with Google"}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }} />
            <span style={{ fontSize: "12px", color: "#6B6878" }}>or sign in with email</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }} />
          </div>

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
              {loading ? "Signing in..." : "Sign in →"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "#6B6878" }}>
            No account yet?{" "}
            <Link href="/register" style={{ color: "#7C6FFF", textDecoration: "none" }}>
              Create one free
            </Link>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "11px", color: "#6B6878" }}>
          By signing in you agree to our Terms of Service
        </div>
      </div>
    </main>
  );
}
