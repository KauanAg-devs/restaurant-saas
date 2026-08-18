import { passwordResetDevMode } from "./auth.module";

describe("password reset environment", () => {
  it("allows reset URLs only in explicit non-production dev mode", () => {
    expect(
      passwordResetDevMode({ PASSWORD_RESET_DEV_MODE: "true", VERCEL_ENV: "preview" }),
    ).toBe(true);
    expect(
      passwordResetDevMode({ PASSWORD_RESET_DEV_MODE: "true", VERCEL_ENV: "production" }),
    ).toBe(false);
    expect(passwordResetDevMode({ PASSWORD_RESET_DEV_MODE: "false" })).toBe(false);
  });
});
