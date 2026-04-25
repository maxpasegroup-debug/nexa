import nodemailer from "nodemailer";

export async function sendEmail(to: string, subject: string, html: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST,
    port: Number(process.env.BREVO_SMTP_PORT ?? 587),
    secure: Number(process.env.BREVO_SMTP_PORT ?? 587) === 465,
    auth: {
      user: process.env.BREVO_SMTP_USER,
      pass: process.env.BREVO_SMTP_PASS,
    },
  });

  return transporter.sendMail({
    from: process.env.BREVO_FROM_EMAIL ?? "",
    to,
    subject,
    html,
  });
}
