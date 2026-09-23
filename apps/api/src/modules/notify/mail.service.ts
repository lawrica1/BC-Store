import { Injectable, Logger } from "@nestjs/common";
import { createTransport, Transporter } from "nodemailer";

interface SendMailInput {
  to: string;
  subject: string;
  text: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null;
  private readonly from: string;

  constructor() {
    const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
    this.from = process.env.ADMIN_EMAIL ?? "no-reply@bcstore.cm";

    // Stub when unconfigured, matching the Stripe/Orange Money/MTN MoMo services — local dev
    // and CI never need real SMTP credentials to exercise the rest of the flow.
    this.transporter =
      SMTP_HOST && SMTP_USER && SMTP_PASS
        ? createTransport({ host: SMTP_HOST, port: 587, secure: false, auth: { user: SMTP_USER, pass: SMTP_PASS } })
        : null;
  }

  async send({ to, subject, text }: SendMailInput): Promise<void> {
    if (!this.transporter) {
      this.logger.log(`[stub] Email to ${to}: ${subject} — ${text}`);
      return;
    }

    try {
      await this.transporter.sendMail({ from: this.from, to, subject, text });
    } catch (error) {
      // A notification failure must never fail the request that triggered it (ticket/order creation).
      this.logger.error(`Failed to send email to ${to}: ${(error as Error).message}`);
    }
  }
}
