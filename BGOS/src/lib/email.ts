const BREVO_API_KEY = process.env.BREVO_API_KEY;
const FROM_EMAIL =
  process.env.FROM_EMAIL ?? process.env.BREVO_FROM_EMAIL ?? "noreply@bgos.online";
const FROM_NAME = process.env.FROM_NAME ?? "BGOS";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendEmail({
  to,
  toName,
  subject,
  html,
}: {
  to: string;
  toName: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  if (!BREVO_API_KEY) {
    console.warn("[email] BREVO_API_KEY not set. Skipping email.");
    return false;
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: FROM_NAME,
          email: FROM_EMAIL,
        },
        to: [{ email: to, name: toName }],
        subject,
        htmlContent: html,
      }),
    });

    const data = (await res.json().catch(() => ({}))) as {
      messageId?: string;
    };

    if (!res.ok) {
      console.error("[email] Send failed:", data);
      return false;
    }

    console.log("[email] Sent:", data.messageId, "to:", to);
    return true;
  } catch (error) {
    console.error("[email] Fatal:", errorMessage(error));
    return false;
  }
}

export async function sendWelcomeEmail({
  name,
  email,
  role,
  companyName,
  password = "123456789",
}: {
  name: string;
  email: string;
  role: string;
  companyName: string;
  password?: string;
}): Promise<boolean> {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeRole = escapeHtml(role);
  const safeCompany = escapeHtml(companyName);
  const safePassword = escapeHtml(password);

  return sendEmail({
    to: email,
    toName: name,
    subject: `Welcome to ${companyName} on BGOS`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:20px;">
        <div style="max-width:600px;margin:0 auto;background:white;border-radius:12px;padding:32px;">
          <h1 style="color:#06b6d4;">Welcome to BGOS</h1>
          <p>Hi <strong>${safeName}</strong>,</p>
          <p>Your account has been created at <strong>${safeCompany}</strong>.</p>
          <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:16px;margin:24px 0;">
            <h3 style="margin:0 0 8px 0;color:#166534;">Your Login Details</h3>
            <p style="margin:4px 0;"><strong>Login URL:</strong> iceconnect.in</p>
            <p style="margin:4px 0;"><strong>Email:</strong> ${safeEmail}</p>
            <p style="margin:4px 0;"><strong>Password:</strong> ${safePassword}</p>
            <p style="margin:4px 0;"><strong>Role:</strong> ${safeRole}</p>
          </div>
          <p style="color:#dc2626;">Please change your password after first login.</p>
          <a href="https://iceconnect.in/login" style="display:inline-block;background:#06b6d4;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px;">Login to BGOS</a>
          <p style="color:#6b7280;font-size:12px;margin-top:32px;">This email was sent by BGOS. If you have questions, contact your company administrator.</p>
        </div>
      </body>
      </html>
    `,
  });
}

export async function sendPasswordResetEmail({
  name,
  email,
  newPassword = "123456789",
}: {
  name: string;
  email: string;
  newPassword?: string;
}): Promise<boolean> {
  const safeName = escapeHtml(name);
  const safePassword = escapeHtml(newPassword);

  return sendEmail({
    to: email,
    toName: name,
    subject: "Your BGOS password has been reset",
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family:Arial,sans-serif;padding:20px;">
        <div style="max-width:600px;margin:0 auto;background:white;border-radius:12px;padding:32px;">
          <h2 style="color:#06b6d4;">Password Reset</h2>
          <p>Hi <strong>${safeName}</strong>,</p>
          <p>Your BGOS password has been reset by your administrator.</p>
          <div style="background:#fef3c7;border:1px solid #fbbf24;border-radius:8px;padding:16px;margin:24px 0;">
            <p style="margin:4px 0;"><strong>New Password:</strong> ${safePassword}</p>
          </div>
          <p style="color:#dc2626;">Please change this password immediately after login.</p>
          <a href="https://iceconnect.in/login" style="display:inline-block;background:#06b6d4;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Login Now</a>
        </div>
      </body>
      </html>
    `,
  });
}
