import { InstitutionService } from '../services/institutionService.js';

export class InstitutionController {
  static async list(req, res) {
    try {
      const page = req.query.page !== undefined ? req.query.page : 1;
      const pageSize = req.query.pageSize !== undefined ? req.query.pageSize : 10;

      const result = await InstitutionService.list({ page, pageSize });

      if (result.error) {
        return res.status(result.status || 400).json({ message: result.error });
      }

      return res.status(200).json({
        message: 'Institutions',
        data: result.data,
        pagination: result.pagination,
        summary: result.summary,
      });
    } catch (err) {
      return res.status(500).json({ message: err.message || 'Internal server error' });
    }
  }

  static async create(req, res) {
    try {
      const body = req.body || {};
      const result = await InstitutionService.create(body);
      if (result.error) {
        return res.status(result.status || 400).json({ message: result.error });
      }

      if (req.file) {
        const uploaded = await InstitutionService.uploadLogo(result.data.id, req.file);
        if (uploaded.error) {
          return res.status(201).json({
            message: 'Institution created, but logo upload failed',
            data: result.data,
            logoError: uploaded.error,
          });
        }
        return res.status(201).json({ message: 'Institution created', data: uploaded.data });
      }

      return res.status(201).json({ message: 'Institution created', data: result.data });
    } catch (err) {
      return res.status(500).json({ message: err.message || 'Internal server error' });
    }
  }

  static async update(req, res) {
    try {
      const result = await InstitutionService.update(req.params.id, req.body || {});
      if (result.error) {
        return res.status(result.status || 400).json({ message: result.error });
      }

      if (req.file) {
        const uploaded = await InstitutionService.uploadLogo(req.params.id, req.file);
        if (uploaded.error) {
          return res.status(200).json({
            message: 'Institution updated, but logo upload failed',
            data: result.data,
            logoError: uploaded.error,
          });
        }
        return res.status(200).json({ message: 'Institution updated', data: uploaded.data });
      }

      return res.status(200).json({ message: 'Institution updated', data: result.data });
    } catch (err) {
      return res.status(500).json({ message: err.message || 'Internal server error' });
    }
  }

  static async uploadLogo(req, res) {
    try {
      const result = await InstitutionService.uploadLogo(req.params.id, req.file);
      if (result.error) {
        return res.status(result.status || 400).json({ message: result.error });
      }
      return res.status(200).json({ message: 'Logo uploaded', data: result.data });
    } catch (err) {
      return res.status(500).json({ message: err.message || 'Internal server error' });
    }
  }
}
