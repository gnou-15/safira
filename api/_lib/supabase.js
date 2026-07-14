import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("Warning: Supabase credentials are not configured.");
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');

// Helper: validate a date string or return null
export const parseDate = (val) => {
  if (!val || typeof val !== 'string') return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(val.trim())) return val.trim();
  return null;
};

// Helper: clamp integer between 1 and 5
export const clampScore = (val, fallback = 3) => {
  const n = parseInt(val);
  if (isNaN(n)) return fallback;
  return Math.max(1, Math.min(5, n));
};

// Helper: calculate risk index level
export const calcRiskLevel = (score) => {
  if (score <= 4) return 'Low';
  if (score <= 12) return 'Medium';
  return 'High';
};

// Helper: set CORS headers
export function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}
