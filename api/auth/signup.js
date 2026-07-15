import { supabase, setCorsHeaders } from '../_lib/supabase.js';
import { hashPassword, generateToken } from '../_lib/auth.js';

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  try {
    const { data: existingUser, error: checkError } = await supabase
      .from('safira_users')
      .select('id, email, username')
      .or(`email.eq.${email.toLowerCase()},username.eq.${username}`)
      .maybeSingle();

    if (checkError) throw checkError;
    if (existingUser) {
      const field = existingUser.email.toLowerCase() === email.toLowerCase() ? 'Email' : 'Username';
      return res.status(400).json({ error: `${field} is already registered` });
    }

    const password_hash = hashPassword(password);
    const { data: newUser, error: insertError } = await supabase
      .from('safira_users')
      .insert([{
        username,
        email: email.toLowerCase(),
        password_hash
      }])
      .select('id, username, email')
      .single();

    if (insertError) throw insertError;

    const token = generateToken({ userId: newUser.id, username: newUser.username, email: newUser.email });
    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: newUser
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
