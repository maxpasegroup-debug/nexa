import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadDotEnv() {
  for (const file of [".env.local", ".env"]) {
    const path = resolve(process.cwd(), file);
    if (!existsSync(path)) continue;

    const lines = readFileSync(path, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
        continue;
      }

      const index = trimmed.indexOf("=");
      const key = trimmed.slice(0, index).trim();
      let value = trimmed.slice(index + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      process.env[key] ??= value;
    }
  }
}

loadDotEnv();

const BREVO_API_KEY = process.env.BREVO_API_KEY;

if (!BREVO_API_KEY) {
  console.error("[FAIL] BREVO_API_KEY not set");
  process.exit(1);
}

console.log("[OK] BREVO_API_KEY is set");
console.log("Key starts with:", `${BREVO_API_KEY.substring(0, 8)}...`);

const accountRes = await fetch("https://api.brevo.com/v3/account", {
  headers: {
    "api-key": BREVO_API_KEY,
    Accept: "application/json",
  },
});

const accountData = await accountRes.json();

if (accountRes.ok) {
  console.log("[OK] Brevo connected!");
  console.log("Account:", accountData.email);
  console.log("Plan:", accountData.plan?.[0]?.type);
} else {
  console.error("[FAIL] Brevo connection failed:");
  console.error(accountData);
}

const emailRes = await fetch("https://api.brevo.com/v3/smtp/email", {
  method: "POST",
  headers: {
    "api-key": BREVO_API_KEY,
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  body: JSON.stringify({
    sender: {
      name: process.env.FROM_NAME ?? "BGOS",
      email: process.env.FROM_EMAIL ?? "noreply@bgos.online",
    },
    to: [
      {
        email: process.env.TEST_EMAIL_TO ?? "boss@bgos.online",
        name: "BGOS Boss",
      },
    ],
    subject: "BGOS Email Test",
    htmlContent: `
      <h1>Test Email</h1>
      <p>If you see this, Brevo is working.</p>
      <p>Sent at: ${new Date().toISOString()}</p>
    `,
  }),
});

const emailData = await emailRes.json();

if (emailRes.ok) {
  console.log("[OK] Test email sent!");
  console.log("Message ID:", emailData.messageId);
} else {
  console.error("[FAIL] Email send failed:");
  console.error(JSON.stringify(emailData, null, 2));
  process.exitCode = 1;
}
