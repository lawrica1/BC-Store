import { createHash, timingSafeEqual } from "node:crypto";
import { Logger } from "@nestjs/common";

const logger = new Logger("CallbackAuth");

/**
 * Compares a webhook/callback token against an expected shared secret.
 * Fails closed: an unset expected token rejects every callback rather than accepting them.
 * Hashes both sides to a fixed-length digest first so the comparison is always constant-time,
 * without needing a random-buffer branch for mismatched lengths.
 */
export function verifyCallbackToken(envVarName: string, expectedToken: string | undefined, providedToken: string | undefined): boolean {
  if (!expectedToken) {
    logger.error(`${envVarName} is not set; rejecting callback. Configure it before enabling this payment provider.`);
    return false;
  }

  if (!providedToken) {
    return false;
  }

  const expectedHash = createHash("sha256").update(expectedToken).digest();
  const providedHash = createHash("sha256").update(providedToken).digest();
  return timingSafeEqual(expectedHash, providedHash);
}
