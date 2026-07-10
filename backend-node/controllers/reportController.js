import { ReportModel } from '../models/reportModel.js';

export const ReportController = {
  // GET /api/reports
  async getReports(req, res) {
    try {
      const data = await ReportModel.getAll();
      res.json(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // GET /api/reports/:id
  async getReportById(req, res) {
    const { id } = req.params;
    try {
      const data = await ReportModel.getById(id);
      res.json(data);
    } catch (error) {
      console.error(`Error fetching report ${id}:`, error);
      res.status(500).json({ error: error.message });
    }
  },

  // POST /api/reports
  async createReport(req, res) {
    try {
      const data = await ReportModel.create(req.body);
      res.status(201).json(data);
    } catch (error) {
      console.error('Error creating report:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // PUT /api/reports/:id
  async updateReport(req, res) {
    const { id } = req.params;
    try {
      const data = await ReportModel.update(id, req.body);
      res.json(data);
    } catch (error) {
      console.error(`Error updating report ${id}:`, error);
      res.status(500).json({ error: error.message });
    }
  },

  // DELETE /api/reports/:id
  async deleteReport(req, res) {
    const { id } = req.params;
    try {
      const result = await ReportModel.delete(id);
      res.json(result);
    } catch (error) {
      console.error(`Error deleting report ${id}:`, error);
      res.status(500).json({ error: error.message });
    }
  },

  // PUT /api/reports/:id/rows
  async upsertRows(req, res) {
    const { id } = req.params;
    const { rows } = req.body;
    try {
      const data = await ReportModel.upsertRows(id, rows);
      res.json(data);
    } catch (error) {
      console.error(`Error bulk upserting rows for report ${id}:`, error);
      res.status(500).json({ error: error.message });
    }
  }
};
