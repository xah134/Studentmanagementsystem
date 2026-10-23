import { StudentService } from '../services/studentService.js';

function queryValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

export class StudentController {
  static async list(req, res) {
    try {
      const page = req.query.page !== undefined ? req.query.page : 1;
      const pageSize = req.query.pageSize !== undefined ? req.query.pageSize : 10;
      const result = await StudentService.list({
        institutionId: queryValue(req.query.institutionId),
        page: queryValue(page),
        pageSize: queryValue(pageSize),
      });

      if (result.error) {
        return res.status(result.status || 400).json({ message: result.error });
      }

      return res.status(200).json({
        message: 'Students',
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
      const result = await StudentService.getById(req.params.id);
      if (result.error) {
        return res.status(result.status || 404).json({ message: result.error });
      }
      return res.status(200).json({ message: 'Student', data: result.data });
    } catch (err) {
      return res.status(500).json({ message: err.message || 'Internal server error' });
    }
  }

  static async create(req, res) {
    try {
      const result = await StudentService.create(req.body || {});
      if (result.error) {
        return res.status(result.status || 400).json({ message: result.error });
      }
      return res.status(201).json({ message: 'Student created', data: result.data });
    } catch (err) {
      return res.status(500).json({ message: err.message || 'Internal server error' });
    }
  }

  static async update(req, res) {
    try {
      const result = await StudentService.update(req.params.id, req.body || {});
      if (result.error) {
        return res.status(result.status || 400).json({ message: result.error });
      }
      return res.status(200).json({ message: 'Student updated', data: result.data });
    } catch (err) {
      return res.status(500).json({ message: err.message || 'Internal server error' });
    }
  }

  static async remove(req, res) {
    try {
      const result = await StudentService.remove(req.params.id);
      if (result.error) {
        return res.status(result.status || 404).json({ message: result.error });
      }
      return res.status(200).json({ message: 'Student removed' });
    } catch (err) {
      return res.status(500).json({ message: err.message || 'Internal server error' });
    }
  }
}
