function baseUrl() {
  return (process.env.WAHA_BASE_URL || "").replace(/\/$/, "");
}

function apiKey() {
  return process.env.WAHA_API_KEY || "";
}

const READY_STATUSES = new Set([
  "STARTING",
  "SCAN_QR_CODE",
  "WORKING",
  "FAILED",
]);

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

function webhookConfig() {
  const publicApiUrl = (process.env.PUBLIC_API_URL || "").replace(/\/$/, "");
  const webhookSecret = process.env.WAHA_WEBHOOK_SECRET || "";
  if (!publicApiUrl || !webhookSecret) {
    return { error: "WAHA webhook is not configured", status: 500 };
  }
  return {
    data: {
      webhooks: [
        {
          url: `${publicApiUrl}/api/support/whatsapp/webhook`,
          events: ["message"],
          customHeaders: [{ name: "X-Webhook-Secret", value: webhookSecret }],
        },
      ],
    },
  };
}

export class WahaService {
  static sessionName(siteId) {
    return `site_${siteId}`;
  }

  static async getSession(sessionName) {
    return waha(`/api/sessions/${encodeURIComponent(sessionName)}`);
  }

  static async createOrStartSession(sessionName) {
    const configResult = webhookConfig();
    if (configResult.error) {
      return configResult;
    }
    const config = configResult.data;

    const existing = await this.getSession(sessionName);
    if (!existing.error && existing.data) {
      const status = existing.data.status;

      if (
        status === "STARTING" ||
        status === "SCAN_QR_CODE" ||
        status === "WORKING"
      ) {
        return { data: existing.data };
      }

      await waha(`/api/sessions/${encodeURIComponent(sessionName)}`, {
        method: "PUT",
        body: JSON.stringify({ name: sessionName, config }),
      });

      const started = await waha(
        `/api/sessions/${encodeURIComponent(sessionName)}/start`,
        { method: "POST" }
      );
      if (started.error) {
        return {
          error: started.error || "Could not start the WhatsApp session",
          status: 502,
        };
      }
      return { data: started.data };
    }

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
      return {
        error: updated.error || "Could not start the WhatsApp session",
        status: 502,
      };
    }

    const started = await waha(
      `/api/sessions/${encodeURIComponent(sessionName)}/start`,
      { method: "POST" }
    );
    if (started.error) {
      const again = await this.getSession(sessionName);
      if (!again.error && READY_STATUSES.has(again.data?.status)) {
        return { data: again.data };
      }
      return {
        error: started.error || "Could not start the WhatsApp session",
        status: 502,
      };
    }
    return { data: started.data };
  }

  static async getQr(sessionName) {
    const session = await this.getSession(sessionName);
    if (session.error) {
      return {
        error: session.error || "Could not load the QR code",
        status: session.status === 404 ? 404 : 502,
      };
    }

    const status = session.data?.status;
    if (status === "WORKING") {
      return { data: { status: "WORKING", connected: true } };
    }
    if (status === "STARTING") {
      return {
        error: "WhatsApp is still starting. Try Refresh QR in a few seconds.",
        status: 409,
      };
    }
    if (status !== "SCAN_QR_CODE") {
      return {
        error: `WhatsApp session is ${status || "unavailable"}. Start the session first.`,
        status: 409,
      };
    }

    const result = await waha(
      `/api/${encodeURIComponent(sessionName)}/auth/qr`
    );
    if (result.error) {
      return {
        error: result.error || "Could not load the QR code",
        status: 502,
      };
    }
    return { data: { ...result.data, status } };
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
