import { requireEnv } from "./require-env";

describe("requireEnv", () => {
  const KEY = "REQUIRE_ENV_SPEC_VAR";

  afterEach(() => {
    delete process.env[KEY];
  });

  it("returns the value when set", () => {
    process.env[KEY] = "value";
    expect(requireEnv(KEY)).toBe("value");
  });

  it("throws when unset", () => {
    expect(() => requireEnv(KEY)).toThrow(`Missing required environment variable: ${KEY}`);
  });
});
