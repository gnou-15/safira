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
    const { message, chat_history, current_table } = req.body;
    try {
      const response = await axios.post(`${PYTHON_SERVICE_URL}/chat`, {
        message,
        chat_history,
        current_table
      });
      res.json(response.data);
    } catch (error) {
      console.error('Error in AI Chat proxy:', error.message);
      const status = error.response?.status || 500;
      const detail = error.response?.data?.detail || 'AI Service communication error';
      res.status(status).json({ error: detail });
    }
  }
};
