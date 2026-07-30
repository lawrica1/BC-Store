import { randomUUID } from "node:crypto";
import { Injectable, Logger } from "@nestjs/common";

interface RequestToPayInput {
  orderNumber: string;
  amount: number;
  payerPhone: string;
}

@Injectable()
export class MomoService {
  private readonly logger = new Logger(MomoService.name);

  private isConfigured() {
    return Boolean(process.env.MTN_MOMO_SUBSCRIPTION_KEY && process.env.MTN_MOMO_API_USER && process.env.MTN_MOMO_API_KEY);
  }

  private async getAccessToken(): Promise<string> {
    const baseUrl = process.env.MTN_MOMO_BASE_URL ?? "https://sandbox.momodeveloper.mtn.com";
    const credentials = Buffer.from(`${process.env.MTN_MOMO_API_USER}:${process.env.MTN_MOMO_API_KEY}`).toString("base64");

    const response = await fetch(`${baseUrl}/collection/token/`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Ocp-Apim-Subscription-Key": process.env.MTN_MOMO_SUBSCRIPTION_KEY ?? ""
      }
    });

    if (!response.ok) {
      throw new Error(`MTN MoMo token request failed: ${response.status}`);
    }

    const data = (await response.json()) as { access_token: string };
    return data.access_token;
  }

  async requestToPay(input: RequestToPayInput) {
    const referenceId = randomUUID();

    if (!this.isConfigured()) {
      this.logger.warn("MTN MoMo credentials are not set. Returning a stub reference id.");
      return { referenceId };
    }

    const baseUrl = process.env.MTN_MOMO_BASE_URL ?? "https://sandbox.momodeveloper.mtn.com";
    const accessToken = await this.getAccessToken();

    const response = await fetch(`${baseUrl}/collection/v1_0/requesttopay`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Reference-Id": referenceId,
        "X-Target-Environment": process.env.MTN_MOMO_TARGET_ENVIRONMENT ?? "sandbox",
        "Ocp-Apim-Subscription-Key": process.env.MTN_MOMO_SUBSCRIPTION_KEY ?? "",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: String(Math.round(input.amount)),
        currency: "EUR",
        externalId: input.orderNumber,
        payer: { partyIdType: "MSISDN", partyId: input.payerPhone.replace(/\D/g, "") },
        payerMessage: `BC Store order ${input.orderNumber}`,
        payeeNote: `Paiement commande ${input.orderNumber}`
      })
    });

    if (response.status !== 202) {
      throw new Error(`MTN MoMo request-to-pay failed: ${response.status}`);
    }

    return { referenceId };
  }

  async getStatus(referenceId: string) {
    const baseUrl = process.env.MTN_MOMO_BASE_URL ?? "https://sandbox.momodeveloper.mtn.com";
    const accessToken = await this.getAccessToken();

    const response = await fetch(`${baseUrl}/collection/v1_0/requesttopay/${referenceId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Target-Environment": process.env.MTN_MOMO_TARGET_ENVIRONMENT ?? "sandbox",
        "Ocp-Apim-Subscription-Key": process.env.MTN_MOMO_SUBSCRIPTION_KEY ?? ""
      }
    });

    if (!response.ok) {
      throw new Error(`MTN MoMo status check failed: ${response.status}`);
    }

    return (await response.json()) as { status: "PENDING" | "SUCCESSFUL" | "FAILED" };
  }
}
