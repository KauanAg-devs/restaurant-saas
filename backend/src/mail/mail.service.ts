import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class MailService {
  constructor(private config: ConfigService) {}

  isConfigured() {
    return Boolean(
      this.config.get<string>("RESTAURANT_SAAS_MAILER_API_KEY") &&
        this.config.get<string>("MAIL_FROM"),
    );
  }

  async sendPasswordReset(to: string, resetUrl: string) {
    const apiKey = this.config.get<string>("RESTAURANT_SAAS_MAILER_API_KEY");
    const from = this.config.get<string>("MAIL_FROM");
    if (!apiKey || !from) {
      throw new ServiceUnavailableException(
        "Recuperação por e-mail ainda não está disponível.",
      );
    }

    let response: Response;
    try {
      response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [to],
          subject: "Redefina sua senha do MesaFlow",
          html: passwordResetHtml(resetUrl),
          text: passwordResetText(resetUrl),
          tags: [{ name: "category", value: "password_reset" }],
        }),
      });
    } catch {
      throw new ServiceUnavailableException(
        "Não foi possível enviar o e-mail de recuperação. Tente novamente em instantes.",
      );
    }

    if (!response.ok) {
      throw new ServiceUnavailableException(
        "Não foi possível enviar o e-mail de recuperação. Tente novamente em instantes.",
      );
    }
  }
}

function passwordResetText(resetUrl: string) {
  return [
    "Você solicitou a redefinição da senha da sua conta MesaFlow.",
    "",
    `Redefina sua senha: ${resetUrl}`,
    "",
    "Este link expira em 30 minutos e só pode ser usado uma vez.",
    "Se você não solicitou a alteração, ignore este e-mail.",
  ].join("\n");
}

function passwordResetHtml(resetUrl: string) {
  const safeUrl = escapeHtml(resetUrl);
  return `<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;background:#f6f7f9;font-family:Arial,sans-serif;color:#18181b">
    <div style="max-width:560px;margin:0 auto;padding:40px 20px">
      <div style="background:#ffffff;border:1px solid #e4e4e7;border-radius:16px;padding:32px">
        <h1 style="font-size:24px;margin:0 0 16px">Redefina sua senha</h1>
        <p style="font-size:16px;line-height:1.6;margin:0 0 24px">Recebemos uma solicitação para redefinir a senha da sua conta MesaFlow.</p>
        <a href="${safeUrl}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;font-weight:700;padding:13px 20px;border-radius:10px">Criar nova senha</a>
        <p style="font-size:14px;line-height:1.6;color:#52525b;margin:24px 0 0">O link expira em 30 minutos e só pode ser usado uma vez. Se você não solicitou a alteração, ignore este e-mail.</p>
      </div>
    </div>
  </body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
