import { InvestigationModel } from '../models/investigationModel.js';

export const InvestigationController = {
  // GET /api/investigations
  async getInvestigations(req, res) {
    try {
      const data = await InvestigationModel.getAll(req.user?.id);
      res.json(data);
    } catch (error) {
      console.error('Error fetching investigations:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // GET /api/investigations/:id
  async getInvestigationById(req, res) {
    const { id } = req.params;
    try {
      const data = await InvestigationModel.getById(id, req.user?.id);
      res.json(data);
    } catch (error) {
      console.error(`Error fetching investigation ${id}:`, error);
      res.status(500).json({ error: error.message });
    }
  },

  // POST /api/investigations
  async createInvestigation(req, res) {
    try {
      const data = await InvestigationModel.create(req.body, req.user?.id);
      res.status(201).json(data);
    } catch (error) {
      console.error('Error creating investigation:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // PUT /api/investigations/:id
  async updateInvestigation(req, res) {
    const { id } = req.params;
    try {
      const data = await InvestigationModel.update(id, req.body, req.user?.id);
      res.json(data);
    } catch (error) {
      console.error(`Error updating investigation ${id}:`, error);
      res.status(500).json({ error: error.message });
    }
  },

  // DELETE /api/investigations/:id
  async deleteInvestigation(req, res) {
    const { id } = req.params;
    try {
      const result = await InvestigationModel.delete(id, req.user?.id);
      res.json(result);
    } catch (error) {
      console.error(`Error deleting investigation ${id}:`, error);
      res.status(500).json({ error: error.message });
    }
  }
};
