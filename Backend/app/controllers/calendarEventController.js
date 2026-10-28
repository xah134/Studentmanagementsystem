import { CalendarEventService } from "../services/calendarEventService.js";

function sendResult(res, result, successStatus, message) {
  if (result.error) {
    return res.status(result.status || 400).json({ message: result.error });
  }
  return res.status(successStatus).json({ message, data: result.data });
}

export class CalendarEventController {
  static async list(req, res) {
    try {
      const result = await CalendarEventService.list(req.actor, {
        institutionId: req.query.institutionId,
        academicYearId: req.query.academicYearId,
        siteId: req.query.siteId,
      });
      return sendResult(res, result, 200, "Calendar events");
    } catch (error) {
      return res.status(500).json({ message: error.message || "Internal server error" });
    }
  }

  static async create(req, res) {
    try {
      const result = await CalendarEventService.create(req.actor, req.body);
      return sendResult(res, result, 201, "Event created");
    } catch (error) {
      return res.status(500).json({ message: error.message || "Internal server error" });
    }
  }

  static async update(req, res) {
    try {
      const result = await CalendarEventService.update(
        req.actor,
        req.params.id,
        req.body
      );
      return sendResult(res, result, 200, "Event updated");
    } catch (error) {
      return res.status(500).json({ message: error.message || "Internal server error" });
    }
  }

  static async remove(req, res) {
    try {
      const result = await CalendarEventService.remove(req.actor, req.params.id);
      return sendResult(res, result, 200, "Event deleted");
    } catch (error) {
      return res.status(500).json({ message: error.message || "Internal server error" });
    }
  }
}
