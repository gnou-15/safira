import axios from 'axios';
import dotenv from 'dotenv';
import {
  fallbackChat,
  fallbackGenerateHirac,
  fallbackGenerateInvestigation,
  fallbackSuggestDetails
} from '../services/groqFallbackService.js';

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
      }, { timeout: 15000 });
      return res.json(response.data);
    } catch (error) {
      console.warn('Python service unavailable/failed for HIRAC generation, executing fallback via Groq direct:', error.message);
      try {
        const fallbackData = await fallbackGenerateHirac({ incident_prompt, location, department });
        return res.json(fallbackData);
      } catch (fallbackErr) {
        console.error('Fallback HIRAC generation also failed:', fallbackErr.message);
        return res.status(500).json({ error: 'AI Service error: Unable to generate HIRAC report. Please try again.' });
      }
    }
  },

  // POST /api/ai/chat
  async chatAgent(req, res) {
    const { message, chat_history, current_table, doc_type, current_investigation } = req.body;
    console.log('[SAFIRA NODE DEBUG] Chat proxy received request');

    try {
      const response = await axios.post(`${PYTHON_SERVICE_URL}/chat`, {
        message,
        chat_history,
        current_table,
        doc_type,
        current_investigation
      }, { timeout: 15000 });
      return res.json(response.data);
    } catch (error) {
      console.warn('Python service unavailable/failed for chat, executing fallback via Groq direct:', error.message);
      try {
        const fallbackData = await fallbackChat({ message, chat_history, current_table, doc_type, current_investigation });
        return res.json(fallbackData);
      } catch (fallbackErr) {
        console.error('Fallback chat also failed:', fallbackErr.message);
        return res.status(500).json({ error: `AI Chat Error: ${fallbackErr.message || 'Service unavailable'}` });
      }
    }
  },

  // GET /api/ai/documents
  async listDocuments(req, res) {
    try {
      const response = await axios.get(`${PYTHON_SERVICE_URL}/documents`, { timeout: 5000 });
      return res.json(response.data);
    } catch (error) {
      console.error('Error listing documents in proxy:', error.message);
      return res.json([]);
    }
  },

  // DELETE /api/ai/documents
  async deleteDocument(req, res) {
    const { name } = req.query;
    try {
      const response = await axios.delete(`${PYTHON_SERVICE_URL}/documents/${encodeURIComponent(name)}`, { timeout: 5000 });
      return res.json(response.data);
    } catch (error) {
      console.error(`Error deleting document ${name} in proxy:`, error.message);
      return res.status(500).json({ error: `Failed to delete document ${name}` });
    }
  },

  // POST /api/ai/upload
  async uploadDocument(req, res) {
    const { filename, base64_data } = req.body;
    try {
      const response = await axios.post(`${PYTHON_SERVICE_URL}/upload-document`, {
        filename,
        base64_data
      }, { timeout: 30000 });
      return res.json(response.data);
    } catch (error) {
      console.error('Error uploading document in proxy:', error.message);
      const detail = error.response?.data?.detail || 'Python document service is offline. Please ensure Python microservice is running.';
      return res.status(500).json({ error: detail });
    }
  },

  // POST /api/ai/suggest-details
  async suggestDetails(req, res) {
    const { title } = req.body;
    try {
      const response = await axios.post(`${PYTHON_SERVICE_URL}/suggest-details`, {
        title
      }, { timeout: 10000 });
      return res.json(response.data);
    } catch (error) {
      console.warn('Python service unavailable/failed for suggest-details, executing fallback via Groq direct:', error.message);
      try {
        const fallbackData = await fallbackSuggestDetails({ title });
        return res.json(fallbackData);
      } catch (fallbackErr) {
        return res.json({
          department: "Operations",
          description: `Incident scenario relating to ${title} at the airport.`
        });
      }
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
      }, { timeout: 20000 });
      return res.json(response.data);
    } catch (error) {
      console.warn('Python service unavailable/failed for investigation generation, executing fallback via Groq direct:', error.message);
      try {
        const fallbackData = await fallbackGenerateInvestigation({ executive_summary, id_number, position, date_of_hiring, trainings });
        return res.json(fallbackData);
      } catch (fallbackErr) {
        console.error('Fallback investigation generation also failed:', fallbackErr.message);
        return res.status(500).json({ error: 'AI Service error: Unable to generate Investigation report. Please try again.' });
      }
    }
  }
};
