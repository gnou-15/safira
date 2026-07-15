import express from 'express';
import { supabase } from '../config/supabase.js';
import { hashPassword, verifyPassword, generateToken } from '../utils/auth.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Google Client Config
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
// Make sure REDIRECT_URI matches the registered one on Google Console (local vs prod)
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback';

/**
 * POST /api/auth/signup
 * Standard email/password registration
 */
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  try {
    // 1. Check if email or username already exists
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

    // 2. Hash password and insert user
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

    // 3. Generate token and respond
    const token = generateToken({ userId: newUser.id, username: newUser.username, email: newUser.email });
    res.status(201).json({
      message: 'Registration successful',
      token,
      user: newUser
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/auth/login
 * Standard email/password log in
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // 1. Fetch user by email
    const { data: user, error: fetchError } = await supabase
      .from('safira_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // 2. Verify hashed password
    const isValid = verifyPassword(password, user.password_hash);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // 3. Generate token and respond
    const token = generateToken({ userId: user.id, username: user.username, email: user.email });
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/auth/me
 * Retrieve authenticated user profile
 */
router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

/**
 * GET /api/auth/google
 * Redirects user to Google OAuth2 consent screen
 */
router.get('/google', (req, res) => {
  if (!GOOGLE_CLIENT_ID) {
    return res.status(500).json({ error: 'Google Client ID is not configured' });
  }

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent('email profile')}&prompt=select_account`;
  res.redirect(googleAuthUrl);
});

/**
 * GET /api/auth/google/callback
 * Handles the redirect from Google, exchanges authorization code for profile,
 * signs user in and redirects back to the frontend dashboard.
 */
router.get('/google/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    console.error('Google OAuth error from query:', error);
    return res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return res.redirect(`${FRONTEND_URL}/login?error=no_code_provided`);
  }

  try {
    // 1. Exchange authorization code for token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID || '',
        client_secret: GOOGLE_CLIENT_SECRET || '',
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code'
      })
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      throw new Error(`Token exchange failed: ${errText}`);
    }

    const { access_token } = await tokenResponse.json();

    // 2. Fetch user profile from Google UserInfo endpoint
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

    // 3. Check if user already exists in database
    let { data: user, error: checkError } = await supabase
      .from('safira_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (checkError) throw checkError;

    // 4. Create user if they do not exist
    if (!user) {
      // Clean name for unique username
      let username = name ? name.replace(/\s+/g, '') : email.split('@')[0];
      
      // Ensure username uniqueness
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
          password_hash: `oauth:google:${googleId}` // Dummy password hash
        }])
        .select('*')
        .single();

      if (insertError) throw insertError;
      user = newUser;
    }

    // 5. Generate token and redirect back to frontend
    const sessionToken = generateToken({ userId: user.id, username: user.username, email: user.email });
    
    // Redirect frontend dashboard with token credentials
    const redirectUrl = `${FRONTEND_URL}/login?token=${sessionToken}&username=${encodeURIComponent(user.username)}&email=${encodeURIComponent(user.email)}`;
    res.redirect(redirectUrl);
  } catch (err) {
    console.error('Google callback error:', err);
    res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent(err.message)}`);
  }
});

export default router;
