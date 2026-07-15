import { supabase, setCorsHeaders } from '../_lib/supabase.js';
import { hashPassword, verifyPassword, generateToken, getAuthenticatedUser } from '../_lib/auth.js';

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { auth } = req.query;
  if (!auth || !Array.isArray(auth) || auth.length === 0) {
    return res.status(404).json({ error: 'Not found' });
  }

  const action = auth[0];
  const subAction = auth[1];

  // 1. POST /api/auth/login
  if (action === 'login' && !subAction) {
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

  // 2. POST /api/auth/signup
  if (action === 'signup' && !subAction) {
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

  // 3. GET /api/auth/me
  if (action === 'me' && !subAction) {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired session token' });
    }
    return res.status(200).json({ user });
  }

  // 4. GET /api/auth/google
  if (action === 'google') {
    // Check if it's the callback or the redirect
    if (!subAction) {
      if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
      }
      const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
      if (!GOOGLE_CLIENT_ID) {
        return res.status(500).json({ error: 'Google Client ID is not configured' });
      }

      const host = req.headers.host;
      const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
      const protocol = isLocal ? 'http' : 'https';
      const redirectUri = `${protocol}://${host}/api/auth/google/callback`;

      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent('email profile')}&prompt=select_account`;
      
      res.writeHead(302, { Location: googleAuthUrl });
      return res.end();
    }

    // GET /api/auth/google/callback
    if (subAction === 'callback') {
      if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const { code, error } = req.query;
      const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
      const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
      const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

      if (error) {
        res.writeHead(302, { Location: `${FRONTEND_URL}/login?error=${encodeURIComponent(error)}` });
        return res.end();
      }

      if (!code) {
        res.writeHead(302, { Location: `${FRONTEND_URL}/login?error=no_code` });
        return res.end();
      }

      try {
        const host = req.headers.host;
        const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
        const protocol = isLocal ? 'http' : 'https';
        const redirectUri = `${protocol}://${host}/api/auth/google/callback`;

        // Exchange authorization code for token
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id: GOOGLE_CLIENT_ID || '',
            client_secret: GOOGLE_CLIENT_SECRET || '',
            redirect_uri: redirectUri,
            grant_type: 'authorization_code'
          })
        });

        if (!tokenResponse.ok) {
          const errText = await tokenResponse.text();
          throw new Error(`Token exchange failed: ${errText}`);
        }

        const { access_token } = await tokenResponse.json();

        // Fetch user profile from Google UserInfo endpoint
        const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${access_token}` }
        });

        if (!profileResponse.ok) {
          throw new Error('Failed to retrieve user profile from Google');
        }

        const googleUser = await profileResponse.json();
        const { email, name, sub: googleId } = googleUser;

        if (!email) {
          throw new Error('Google did not return an email address');
        }

        // Check if user already exists in database
        let { data: user, error: checkError } = await supabase
          .from('safira_users')
          .select('*')
          .eq('email', email.toLowerCase())
          .maybeSingle();

        if (checkError) throw checkError;

        // Create user if they do not exist
        if (!user) {
          let username = name ? name.replace(/\s+/g, '') : email.split('@')[0];
          const { data: nameCheck } = await supabase
            .from('safira_users')
            .select('id')
            .eq('username', username)
            .maybeSingle();

          if (nameCheck) {
            username = `${username}${Date.now().toString().slice(-4)}`;
          }

          const { data: newUser, error: insertError } = await supabase
            .from('safira_users')
            .insert([{
              username,
              email: email.toLowerCase(),
              password_hash: `oauth:google:${googleId}`
            }])
            .select('*')
            .single();

          if (insertError) throw insertError;
          user = newUser;
        }

        // Generate token and redirect back to frontend
        const sessionToken = generateToken({ userId: user.id, username: user.username, email: user.email });
        const redirectUrl = `${FRONTEND_URL}/login?token=${sessionToken}&username=${encodeURIComponent(user.username)}&email=${encodeURIComponent(user.email)}`;
        
        res.writeHead(302, { Location: redirectUrl });
        return res.end();
      } catch (err) {
        console.error('Google callback serverless error:', err);
        res.writeHead(302, { Location: `${FRONTEND_URL}/login?error=${encodeURIComponent(err.message)}` });
        return res.end();
      }
    }
  }

  return res.status(404).json({ error: 'Not found' });
}
