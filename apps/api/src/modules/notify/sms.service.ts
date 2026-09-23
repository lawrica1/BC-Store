import { Injectable, Logger } from "@nestjs/common";
import Twilio from "twilio";

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly client: ReturnType<typeof Twilio> | null;
  private readonly fromNumber?: string;

  constructor() {
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER } = process.env;

    // Stub when unconfigured — same graceful-degrade pattern as MailService and the payment providers.
    this.client = TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN ? Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) : null;
    this.fromNumber = TWILIO_FROM_NUMBER;
  }

  async send(to: string, body: string): Promise<void> {
    if (!this.client || !this.fromNumber) {
      this.logger.log(`[stub] SMS to ${to}: ${body}`);
      return;
    }

    try {
      await this.client.messages.create({ to, from: this.fromNumber, body });
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${to}: ${(error as Error).message}`);
    }
  }
}
