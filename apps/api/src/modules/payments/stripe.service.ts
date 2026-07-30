import { Injectable, Logger } from "@nestjs/common";
import Stripe from "stripe";

const ZERO_DECIMAL_CURRENCIES = new Set(["xaf", "xof", "jpy", "krw"]);

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private readonly client: Stripe | null;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    this.client = secretKey ? new Stripe(secretKey) : null;
    if (!this.client) {
      this.logger.warn("STRIPE_SECRET_KEY is not set. Card payments will return a stub client secret.");
    }
  }

  private toStripeAmount(amount: number, currency: string) {
    return ZERO_DECIMAL_CURRENCIES.has(currency.toLowerCase()) ? Math.round(amount) : Math.round(amount * 100);
  }

  async createPaymentIntent(amount: number, currency: string, metadata: Record<string, string>) {
    if (!this.client) {
      return { id: `stub_pi_${Date.now()}`, clientSecret: `stub_secret_${Date.now()}` };
    }

    const intent = await this.client.paymentIntents.create({
      amount: this.toStripeAmount(amount, currency),
      currency,
      metadata,
      automatic_payment_methods: { enabled: true }
    });

    return { id: intent.id, clientSecret: intent.client_secret ?? "" };
  }

  constructEvent(payload: Buffer, signature: string) {
    if (!this.client) {
      throw new Error("Stripe is not configured.");
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not set.");
    }

    return this.client.webhooks.constructEvent(payload, signature, webhookSecret);
  }
}
