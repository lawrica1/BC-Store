import { Injectable, Logger } from "@nestjs/common";
import { verifyCallbackToken as verifySharedSecretToken } from "../../common/security/verify-callback-token";

interface CreateOrangeMoneyPaymentInput {
  orderId: string;
  orderNumber: string;
  amount: number;
  returnUrl?: string;
}

@Injectable()
export class OrangeMoneyService {
  private readonly logger = new Logger(OrangeMoneyService.name);
  private cachedToken: { value: string; expiresAt: number } | null = null;

  private isConfigured() {
    return Boolean(process.env.ORANGE_MONEY_CLIENT_ID && process.env.ORANGE_MONEY_CLIENT_SECRET && process.env.ORANGE_MONEY_MERCHANT_KEY);
  }

  private buildNotifUrl() {
    const baseCallbackUrl = `${process.env.API_PUBLIC_URL ?? "http://localhost:4000"}/api/payments/orange/callback`;
    const callbackToken = process.env.ORANGE_MONEY_CALLBACK_TOKEN;
    return callbackToken ? `${baseCallbackUrl}?token=${encodeURIComponent(callbackToken)}` : baseCallbackUrl;
  }

  // Orange Money's web payment API does not sign callbacks, so we authenticate them with a
  // shared-secret token embedded in the notif_url query string instead of trusting the POST body.
  verifyCallbackToken(providedToken: string | undefined): boolean {
    return verifySharedSecretToken("ORANGE_MONEY_CALLBACK_TOKEN", process.env.ORANGE_MONEY_CALLBACK_TOKEN, providedToken);
  }

  private async getAccessToken(): Promise<string> {
    if (this.cachedToken && Date.now() < this.cachedToken.expiresAt) {
      return this.cachedToken.value;
    }

    const baseUrl = process.env.ORANGE_MONEY_BASE_URL ?? "https://api.orange.com";
    const credentials = Buffer.from(`${process.env.ORANGE_MONEY_CLIENT_ID}:${process.env.ORANGE_MONEY_CLIENT_SECRET}`).toString("base64");

    const response = await fetch(`${baseUrl}/oauth/v3/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "grant_type=client_credentials"
    });

    if (!response.ok) {
      throw new Error(`Orange Money OAuth failed: ${response.status}`);
    }

    const data = (await response.json()) as { access_token: string; expires_in?: number };
    const expiresInMs = ((data.expires_in ?? 3600) - 60) * 1000;
    this.cachedToken = { value: data.access_token, expiresAt: Date.now() + expiresInMs };
    return data.access_token;
  }

  async createPayment(input: CreateOrangeMoneyPaymentInput) {
    if (!this.isConfigured()) {
      this.logger.warn("Orange Money credentials are not set. Returning a stub payment URL.");
      return {
        payToken: `stub_pay_token_${Date.now()}`,
        paymentUrl: `${input.returnUrl ?? "http://localhost:3000/checkout"}?stubOrangeMoney=1&order=${input.orderNumber}`
      };
    }

    const baseUrl = process.env.ORANGE_MONEY_BASE_URL ?? "https://api.orange.com";
    const accessToken = await this.getAccessToken();

    const response = await fetch(`${baseUrl}/orange-money-webpay/cm/v1/webpayment`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        merchant_key: process.env.ORANGE_MONEY_MERCHANT_KEY,
        currency: "XAF",
        order_id: input.orderNumber,
        amount: Math.round(input.amount),
        return_url: process.env.ORANGE_MONEY_RETURN_URL ?? input.returnUrl,
        cancel_url: process.env.ORANGE_MONEY_RETURN_URL ?? input.returnUrl,
        notif_url: this.buildNotifUrl(),
        lang: "fr",
        reference: input.orderId
      })
    });

    if (!response.ok) {
      throw new Error(`Orange Money payment creation failed: ${response.status}`);
    }

    const data = (await response.json()) as { pay_token: string; payment_url: string };
    return { payToken: data.pay_token, paymentUrl: data.payment_url };
  }
}
