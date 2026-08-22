import { ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MailService } from "./mail.service";

describe("MailService", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("sends a password reset through Resend", async () => {
    const config = {
      get: jest.fn((key: string) =>
        key === "RESTAURANT_SAAS_MAILER_API_KEY"
          ? "re_test"
          : key === "MAIL_FROM"
            ? "MesaFlow <no-reply@example.com>"
            : undefined,
      ),
    } as unknown as ConfigService;
    const fetchMock = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchMock as any;

    await new MailService(config).sendPasswordReset(
      "owner@example.com",
      "https://example.com/recuperar-senha#token=secret",
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer re_test" }),
      }),
    );
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.to).toEqual(["owner@example.com"]);
    expect(body.from).toBe("MesaFlow <no-reply@example.com>");
    expect(body.text).toContain("https://example.com/recuperar-senha#token=secret");
  });

  it("fails clearly when production mail is not configured", async () => {
    const config = { get: jest.fn(() => undefined) } as unknown as ConfigService;
    await expect(
      new MailService(config).sendPasswordReset("owner@example.com", "https://example.com"),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it("fails when the provider rejects the request", async () => {
    const config = {
      get: jest.fn((key: string) =>
        key === "RESTAURANT_SAAS_MAILER_API_KEY"
          ? "re_test"
          : "MesaFlow <no-reply@example.com>",
      ),
    } as unknown as ConfigService;
    global.fetch = jest.fn().mockResolvedValue({ ok: false }) as any;
    await expect(
      new MailService(config).sendPasswordReset("owner@example.com", "https://example.com"),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
