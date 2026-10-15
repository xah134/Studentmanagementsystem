function baseUrl() {
  return (process.env.WAHA_BASE_URL || "").replace(/\/$/, "");
}

function apiKey() {
  return process.env.WAHA_API_KEY || "";
}

async function waha(path, options = {}) {
  const root = baseUrl();
  if (!root || !apiKey()) {
    return { error: "WAHA is not configured", status: 500 };
  }

  const response = await fetch(`${root}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "X-Api-Key": apiKey(),
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      payload.message || payload.error || `WAHA request failed (${response.status})`;
    return { error: message, status: response.status, payload };
  }
  return { data: payload };
}

export class WahaService {
  static sessionName(siteId) {
    return `site_${siteId}`;
  }

  static async createOrStartSession(sessionName) {
    const publicApiUrl = (process.env.PUBLIC_API_URL || "").replace(/\/$/, "");
    const webhookSecret = process.env.WAHA_WEBHOOK_SECRET || "";
    if (!publicApiUrl || !webhookSecret) {
      return { error: "WAHA webhook is not configured", status: 500 };
    }

    const config = {
      webhooks: [
        {
          url: `${publicApiUrl}/api/support/whatsapp/webhook`,
          events: ["message"],
          customHeaders: [{ name: "X-Webhook-Secret", value: webhookSecret }],
        },
      ],
    };

    const created = await waha("/api/sessions", {
      method: "POST",
      body: JSON.stringify({ name: sessionName, start: true, config }),
    });
    if (!created.error) {
      return { data: created.data };
    }

    const updated = await waha(`/api/sessions/${encodeURIComponent(sessionName)}`, {
      method: "PUT",
      body: JSON.stringify({ name: sessionName, config }),
    });
    if (updated.error && updated.status !== 404) {
      return { error: "Could not start the WhatsApp session", status: 502 };
    }

    const started = await waha(
      `/api/sessions/${encodeURIComponent(sessionName)}/start`,
      { method: "POST" }
    );
    if (started.error) {
      return { error: "Could not start the WhatsApp session", status: 502 };
    }
    return { data: started.data };
  }

  static async getQr(sessionName) {
    const result = await waha(
      `/api/${encodeURIComponent(sessionName)}/auth/qr`
    );
    if (result.error) {
      return { error: "Could not load the QR code", status: 502 };
    }
    return { data: result.data };
  }

  static async sendText({ sessionName, chatId, text }) {
    const result = await waha("/api/sendText", {
      method: "POST",
      body: JSON.stringify({
        session: sessionName,
        chatId,
        text,
      }),
    });
    if (result.error) {
      return { error: result.error, status: 502 };
    }
    return { data: result.data };
  }
}
