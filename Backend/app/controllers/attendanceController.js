import { AttendanceService } from "../services/attendanceService.js";

function queryValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

function sendResult(res, result, successStatus, message) {
  if (result.error) {
    return res.status(result.status || 400).json({ message: result.error });
  }
  return res.status(successStatus).json({ message, data: result.data });
}

export class AttendanceController {
  static async getRoster(req, res) {
    try {
      const result = await AttendanceService.getRoster(req.actor, {
        timetableSlotId: queryValue(req.query.timetableSlotId),
        date: queryValue(req.query.date),
        siteId: queryValue(req.query.siteId),
      });
      return sendResult(res, result, 200, "Attendance roster");
    } catch (error) {
      return res.status(500).json({ message: error.message || "Internal server error" });
    }
  }

  static async bulkUpsert(req, res) {
    try {
      const result = await AttendanceService.bulkUpsert(req.actor, req.body || {});
      return sendResult(res, result, 200, "Attendance saved");
    } catch (error) {
      return res.status(500).json({ message: error.message || "Internal server error" });
    }
  }
}
