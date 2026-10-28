import { LecturerService } from '../services/lecturerService.js';

function queryValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

export class LecturerController {
  static async list(req, res) {
    try {
      const page = req.query.page !== undefined ? req.query.page : 1;
      const pageSize = req.query.pageSize !== undefined ? req.query.pageSize : 10;
      const result = await LecturerService.list({
        institutionId: queryValue(req.query.institutionId),
        siteId: queryValue(req.query.siteId),
        page: queryValue(page),
        pageSize: queryValue(pageSize),
      });

      if (result.error) {
        return res.status(result.status || 400).json({ message: result.error });
      }

      return res.status(200).json({
        message: 'Lecturers',
        data: result.data,
        pagination: result.pagination,
        summary: result.summary,
      });
    } catch (err) {
      return res.status(500).json({ message: err.message || 'Internal server error' });
    }
  }

  static async getById(req, res) {
    try {
      const result = await LecturerService.getById(req.params.id);
      if (result.error) {
        return res.status(result.status || 404).json({ message: result.error });
      }
      return res.status(200).json({ message: 'Lecturer', data: result.data });
    } catch (err) {
      return res.status(500).json({ message: err.message || 'Internal server error' });
    }
  }

  static async create(req, res) {
    try {
      const result = await LecturerService.create(req.body || {});
      if (result.error) {
        return res.status(result.status || 400).json({ message: result.error });
      }
      return res.status(201).json({ message: 'Lecturer created', data: result.data });
    } catch (err) {
      return res.status(500).json({ message: err.message || 'Internal server error' });
    }
  }

  static async update(req, res) {
    try {
      const result = await LecturerService.update(req.params.id, req.body || {});
      if (result.error) {
        return res.status(result.status || 400).json({ message: result.error });
      }
      return res.status(200).json({ message: 'Lecturer updated', data: result.data });
    } catch (err) {
      return res.status(500).json({ message: err.message || 'Internal server error' });
    }
  }

  static async remove(req, res) {
    try {
      const result = await LecturerService.remove(req.params.id);
      if (result.error) {
        return res.status(result.status || 404).json({ message: result.error });
      }
      return res.status(200).json({ message: 'Lecturer removed' });
    } catch (err) {
      return res.status(500).json({ message: err.message || 'Internal server error' });
    }
  }
}
