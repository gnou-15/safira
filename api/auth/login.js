import { supabase, setCorsHeaders } from '../_lib/supabase.js';
import { verifyPassword, generateToken } from '../_lib/auth.js';

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const { data: user, error: fetchError } = await supabase
      .from('safira_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isValid = verifyPassword(password, user.password_hash);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = generateToken({ userId: user.id, username: user.username, email: user.email });
    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
