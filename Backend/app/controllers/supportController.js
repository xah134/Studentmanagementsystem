import { SupportService } from "../services/supportService.js";

function sendResult(res, result, successStatus, message) {
  if (result.error) {
    return res.status(result.status || 400).json({ message: result.error });
  }
  return res.status(successStatus).json({ message, data: result.data });
}

export class SupportController {
  static async startSession(req, res) {
    try {
      const result = await SupportService.startSession(req.actor, req.body?.siteId);
      return sendResult(res, result, 200, "Session started");
    } catch (error) {
      return res.status(500).json({ message: error.message || "Internal server error" });
    }
  }

  static async qr(req, res) {
    try {
      const result = await SupportService.getQr(req.actor, req.params.siteId);
      return sendResult(res, result, 200, "QR code");
    } catch (error) {
      return res.status(500).json({ message: error.message || "Internal server error" });
    }
  }

  static async webhook(req, res) {
    const secret = process.env.WAHA_WEBHOOK_SECRET;
    if (!secret || req.get("X-Webhook-Secret") !== secret) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      await SupportService.receiveWebhook(req.body);
      return res.status(200).json({ message: "Received" });
    } catch (error) {
      return res.status(500).json({ message: error.message || "Internal server error" });
    }
  }

  static async list(req, res) {
    try {
      const result = await SupportService.list(req.actor, {
        siteId: req.query.siteId,
        status: req.query.status,
      });
      return sendResult(res, result, 200, "Tickets");
    } catch (error) {
      return res.status(500).json({ message: error.message || "Internal server error" });
    }
  }

  static async open(req, res) {
    try {
      const result = await SupportService.open(req.actor, req.params.id);
      return sendResult(res, result, 200, "Ticket");
    } catch (error) {
      return res.status(500).json({ message: error.message || "Internal server error" });
    }
  }

  static async updateStatus(req, res) {
    try {
      const result = await SupportService.updateStatus(
        req.actor,
        req.params.id,
        req.body?.status
      );
      return sendResult(res, result, 200, "Ticket updated");
    } catch (error) {
      return res.status(500).json({ message: error.message || "Internal server error" });
    }
  }

  static async reply(req, res) {
    try {
      const result = await SupportService.reply(req.actor, req.params.id, req.body?.text);
      return sendResult(res, result, 201, "Message sent");
    } catch (error) {
      return res.status(500).json({ message: error.message || "Internal server error" });
    }
  }
}
