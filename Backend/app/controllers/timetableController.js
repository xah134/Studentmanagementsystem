import { TimetableService } from "../services/timetableService.js";

function sendResult(res, result, successStatus, message) {
  if (result.error) {
    return res.status(result.status || 400).json({ message: result.error });
  }
  return res.status(successStatus).json({ message, data: result.data });
}

export class TimetableController {
  static async listByCourse(req, res) {
    try {
      const result = await TimetableService.listByCourse(
        req.actor,
        req.params.courseId || req.params.id
      );
      return sendResult(res, result, 200, "Timetable");
    } catch (error) {
      return res.status(500).json({ message: error.message || "Internal server error" });
    }
  }

  static async create(req, res) {
    try {
      const result = await TimetableService.create(
        req.actor,
        req.params.courseId || req.params.id,
        req.body
      );
      return sendResult(res, result, 201, "Slot created");
    } catch (error) {
      return res.status(500).json({ message: error.message || "Internal server error" });
    }
  }

  static async update(req, res) {
    try {
      const result = await TimetableService.update(
        req.actor,
        req.params.id,
        req.body
      );
      return sendResult(res, result, 200, "Slot updated");
    } catch (error) {
      return res.status(500).json({ message: error.message || "Internal server error" });
    }
  }

  static async remove(req, res) {
    try {
      const result = await TimetableService.remove(req.actor, req.params.id);
      return sendResult(res, result, 200, "Slot deleted");
    } catch (error) {
      return res.status(500).json({ message: error.message || "Internal server error" });
    }
  }
}
