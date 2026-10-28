import { AcademicYearService } from "../services/academicYearService.js";

function sendResult(res, result, successStatus, message) {
  if (result.error) {
    return res.status(result.status || 400).json({ message: result.error });
  }
  return res.status(successStatus).json({ message, data: result.data });
}

export class AcademicYearController {
  static async list(req, res) {
    try {
      const result = await AcademicYearService.list(
        req.actor,
        req.query.institutionId
      );
      return sendResult(res, result, 200, "Academic years");
    } catch (error) {
      return res.status(500).json({ message: error.message || "Internal server error" });
    }
  }

  static async create(req, res) {
    try {
      const result = await AcademicYearService.create(req.actor, req.body);
      return sendResult(res, result, 201, "Academic year created");
    } catch (error) {
      return res.status(500).json({ message: error.message || "Internal server error" });
    }
  }

  static async update(req, res) {
    try {
      const result = await AcademicYearService.update(
        req.actor,
        req.params.id,
        req.body
      );
      return sendResult(res, result, 200, "Academic year updated");
    } catch (error) {
      return res.status(500).json({ message: error.message || "Internal server error" });
    }
  }

  static async remove(req, res) {
    try {
      const result = await AcademicYearService.remove(req.actor, req.params.id);
      return sendResult(res, result, 200, "Academic year deleted");
    } catch (error) {
      return res.status(500).json({ message: error.message || "Internal server error" });
    }
  }
}
