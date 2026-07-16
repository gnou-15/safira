import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

export const AiController = {
  // POST /api/ai/generate
  async generateReport(req, res) {
    const { incident_prompt, location, department } = req.body;
    try {
      const response = await axios.post(`${PYTHON_SERVICE_URL}/generate-hirac`, {
        incident_prompt,
        location,
        department
      });
      res.json(response.data);
    } catch (error) {
      console.error('Error in AI report generation proxy:', error.message);
      const status = error.response?.status || 500;
      const detail = error.response?.data?.detail || 'AI Service communication error';
      res.status(status).json({ error: detail });
    }
  },

  // POST /api/ai/chat
  async chatAgent(req, res) {
    const { message, chat_history, current_table, doc_type, current_investigation } = req.body;
    console.log('[SAFIRA NODE DEBUG] Chat proxy received:', {
      doc_type,
      hasInvestigation: !!current_investigation,
      messagePreview: message?.substring(0, 50)
    });
    try {
      const response = await axios.post(`${PYTHON_SERVICE_URL}/chat`, {
        message,
        chat_history,
        current_table,
        doc_type,
        current_investigation
      });
      res.json(response.data);
    } catch (error) {
      console.error('Error in AI Chat proxy:', error.message);
      const status = error.response?.status || 500;
      const detail = error.response?.data?.detail || 'AI Service communication error';
      res.status(status).json({ error: detail });
    }
  },

  // GET /api/ai/documents
  async listDocuments(req, res) {
    try {
      const response = await axios.get(`${PYTHON_SERVICE_URL}/documents`);
      res.json(response.data);
    } catch (error) {
      console.error('Error listing documents in proxy:', error.message);
      const status = error.response?.status || 500;
      const detail = error.response?.data?.detail || 'AI Service communication error';
      res.status(status).json({ error: detail });
    }
  },

  // DELETE /api/ai/documents
  async deleteDocument(req, res) {
    const { name } = req.query;
    try {
      const response = await axios.delete(`${PYTHON_SERVICE_URL}/documents/${encodeURIComponent(name)}`);
      res.json(response.data);
    } catch (error) {
      console.error(`Error deleting document ${name} in proxy:`, error.message);
      const status = error.response?.status || 500;
      const detail = error.response?.data?.detail || 'AI Service communication error';
      res.status(status).json({ error: detail });
    }
  },

  // POST /api/ai/upload
  async uploadDocument(req, res) {
    const { filename, base64_data } = req.body;
    try {
      const response = await axios.post(`${PYTHON_SERVICE_URL}/upload-document`, {
        filename,
        base64_data
      });
      res.json(response.data);
    } catch (error) {
      console.error('Error uploading document in proxy:', error.message);
      const status = error.response?.status || 500;
      const detail = error.response?.data?.detail || 'AI Service communication error';
      res.status(status).json({ error: detail });
    }
  },

  // POST /api/ai/suggest-details
  async suggestDetails(req, res) {
    const { title } = req.body;
    try {
      const response = await axios.post(`${PYTHON_SERVICE_URL}/suggest-details`, {
        title
      });
      res.json(response.data);
    } catch (error) {
      console.error('Error in AI suggest details proxy:', error.message);
      const status = error.response?.status || 500;
      const detail = error.response?.data?.detail || 'AI Service communication error';
      res.status(status).json({ error: detail });
    }
  },

  // POST /api/ai/investigate
  async generateInvestigation(req, res) {
    const { executive_summary, id_number, position, date_of_hiring, trainings } = req.body;
    try {
      const response = await axios.post(`${PYTHON_SERVICE_URL}/generate-investigation`, {
        executive_summary,
        id_number,
        position,
        date_of_hiring,
        trainings
      });
      res.json(response.data);
    } catch (error) {
      console.error('Error in AI investigation generation proxy:', error.message);
      const status = error.response?.status || 500;
      const detail = error.response?.data?.detail || 'AI Service communication error';
      res.status(status).json({ error: detail });
    }
  }
};
