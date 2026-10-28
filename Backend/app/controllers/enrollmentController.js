import { EnrollmentService } from "../services/enrollmentService.js";

function queryValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

function sendResult(res, result, successStatus, message) {
  if (result.error) {
    return res.status(result.status || 400).json({ message: result.error });
  }
  return res.status(successStatus).json({ message, data: result.data });
}

export class EnrollmentController {
  static async list(req, res) {
    try {
      const result = await EnrollmentService.list(req.actor, {
        institutionId: queryValue(req.query.institutionId),
        siteId: queryValue(req.query.siteId),
        courseId: queryValue(req.query.courseId),
        academicYearId: queryValue(req.query.academicYearId),
      });
      return sendResult(res, result, 200, "Enrollments");
    } catch (error) {
      return res.status(500).json({ message: error.message || "Internal server error" });
    }
  }

  static async create(req, res) {
    try {
      const result = await EnrollmentService.create(req.actor, req.body || {});
      return sendResult(res, result, 201, "Enrollment created");
    } catch (error) {
      return res.status(500).json({ message: error.message || "Internal server error" });
    }
  }

  static async remove(req, res) {
    try {
      const result = await EnrollmentService.remove(
        req.actor,
        req.params.id,
        queryValue(req.query.siteId) || req.body?.siteId
      );
      return sendResult(res, result, 200, "Enrollment removed");
    } catch (error) {
      return res.status(500).json({ message: error.message || "Internal server error" });
    }
  }
}
