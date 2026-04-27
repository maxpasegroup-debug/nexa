import { sendEmail } from "@/lib/email";

type DevPriority = "urgent" | "high" | "normal";

const priorityStyles: Record<DevPriority, { label: string; color: string; bg: string }> = {
  urgent: { label: "URGENT", color: "#FF6B6B", bg: "rgba(255,107,107,0.14)" },
  high: { label: "HIGH", color: "#F97316", bg: "rgba(249,115,22,0.14)" },
  normal: { label: "NORMAL", color: "#7C6FFF", bg: "rgba(124,111,255,0.14)" },
};

export async function notifyDev(
  subject: string,
  body: string,
  priority: DevPriority,
) {
  const to = process.env.DEV_EMAIL;

  if (!to) {
    return null;
  }

  const style = priorityStyles[priority];
  const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const timestamp = new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date());

  return sendEmail({
    to,
    toName: "BGOS Dev",
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; background:#070709; color:#f5f5f7; padding:28px;">
        <div style="max-width:640px; margin:0 auto; background:#13131c; border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:24px;">
          <div style="font-size:22px; font-weight:800; letter-spacing:0.02em;">
            <span style="color:#ffffff;">BG</span><span style="color:#7C6FFF;">OS</span>
          </div>
          <div style="display:inline-block; margin-top:18px; padding:6px 10px; border-radius:999px; color:${style.color}; background:${style.bg}; font-size:12px; font-weight:800;">
            ${style.label}
          </div>
          <h2 style="margin:18px 0 10px; font-size:22px; color:#ffffff;">${subject}</h2>
          <p style="line-height:1.6; color:#c9c7d4; white-space:pre-line;">${body}</p>
          <p style="margin-top:22px; color:#777382; font-size:12px;">${timestamp}</p>
          <a href="${dashboardUrl}" style="display:inline-block; margin-top:18px; background:#7C6FFF; color:#ffffff; padding:10px 14px; border-radius:10px; text-decoration:none; font-weight:700;">
            Open BGOS dashboard
          </a>
        </div>
      </div>
    `,
  });
}
