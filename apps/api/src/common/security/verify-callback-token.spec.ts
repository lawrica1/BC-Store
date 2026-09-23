import { verifyCallbackToken } from "./verify-callback-token";

describe("verifyCallbackToken", () => {
  it("accepts a matching token", () => {
    expect(verifyCallbackToken("TEST_TOKEN", "secret-123", "secret-123")).toBe(true);
  });

  it("rejects a mismatched token", () => {
    expect(verifyCallbackToken("TEST_TOKEN", "secret-123", "wrong")).toBe(false);
  });

  it("fails closed when no expected token is configured", () => {
    expect(verifyCallbackToken("TEST_TOKEN", undefined, "anything")).toBe(false);
  });

  it("rejects when no token is provided", () => {
    expect(verifyCallbackToken("TEST_TOKEN", "secret-123", undefined)).toBe(false);
  });
});
