import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

// Middlewares
app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Warning: Supabase credentials are not fully configured in backend-node.");
}

const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// --- REPORTS API ---

// 1. Get all reports
app.get('/api/reports', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('hirac_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: error.message });
  }
});

// 2. Get a single report (with its table rows)
app.get('/api/reports/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Fetch report meta
    const { data: report, error: reportError } = await supabase
      .from('hirac_reports')
      .select('*')
      .eq('id', id)
      .single();

    if (reportError) throw reportError;

    // Fetch report rows
    const { data: rows, error: rowsError } = await supabase
      .from('hirac_rows')
      .select('*')
      .eq('report_id', id)
      .order('row_order', { ascending: true });

    if (rowsError) throw rowsError;

    res.json({ ...report, rows });
  } catch (error) {
    console.error(`Error fetching report ${id}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Create a new report
app.post('/api/reports', async (req, res) => {
  const {
    title,
    ref_no,
    location,
    activity_assessed,
    assessor_team,
    department,
    prepared_by_name,
    prepared_by_role,
    approved_by_name,
    approved_by_role,
    acknowledged_by_name,
    acknowledged_by_role,
    footer_remarks
  } = req.body;

  try {
    const { data, error } = await supabase
      .from('hirac_reports')
      .insert([{
        title: title || 'New HIRAC Report',
        ref_no: ref_no || `CSC-${Date.now().toString().slice(-6)}`,
        location: location || 'Airport Terminal',
        activity_assessed: activity_assessed || 'Safety Assessment',
        assessor_team: assessor_team || 'SSQA Team',
        department: department || 'Operations',
        prepared_by_name,
        prepared_by_role,
        approved_by_name,
        approved_by_role,
        acknowledged_by_name,
        acknowledged_by_role,
        footer_remarks
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ error: error.message });
  }
});

// 4. Update report metadata
app.put('/api/reports/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const { data, error } = await supabase
      .from('hirac_reports')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error(`Error updating report ${id}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// 5. Delete a report
app.delete('/api/reports/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('hirac_reports')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error(`Error deleting report ${id}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// 6. Bulk-save/update rows of a report (Upsert rows)
app.put('/api/reports/:id/rows', async (req, res) => {
  const { id } = req.params;
  const { rows } = req.body; // Array of row objects

  try {
    // 1. Delete all existing rows for this report to overwrite
    const { error: deleteError } = await supabase
      .from('hirac_rows')
      .delete()
      .eq('report_id', id);

    if (deleteError) throw deleteError;

    if (!rows || rows.length === 0) {
      return res.json({ message: 'Rows cleared successfully.' });
    }

    // 2. Prepare rows for insertion
    const rowsToInsert = rows.map((row, index) => {
      // Stripping ID to avoid conflicts, letting Supabase generate new ones
      const { id: _, created_at: __, ...cleanRow } = row;
      return {
        ...cleanRow,
        report_id: id,
        row_order: index + 1
      };
    });

    // 3. Insert new rows
    const { data, error: insertError } = await supabase
      .from('hirac_rows')
      .insert(rowsToInsert)
      .select();

    if (insertError) throw insertError;
    res.json(data);
  } catch (error) {
    console.error(`Error bulk upserting rows for report ${id}:`, error);
    res.status(500).json({ error: error.message });
  }
});


// --- AI INTERACTION PROXIES ---

// 1. Proxy report generation to Python FastAPI service
app.post('/api/ai/generate', async (req, res) => {
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
});

// 2. Proxy chat queries to Python FastAPI service
app.post('/api/ai/chat', async (req, res) => {
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
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Node.js Gateway' });
});

app.listen(PORT, () => {
  console.log(`Node.js API Gateway listening on port ${PORT}`);
});
