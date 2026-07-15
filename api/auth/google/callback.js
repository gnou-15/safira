import { supabase, setCorsHeaders } from '../../_lib/supabase.js';
import { generateToken } from '../../_lib/auth.js';

export default async function handler(req, res) {
  setCorsHeaders(res);

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
    // Detect server host for dynamic redirect URI in token exchange
    const host = req.headers.host;
    const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
    const protocol = isLocal ? 'http' : 'https';
    const redirectUri = `${protocol}://${host}/api/auth/google/callback`;

    // 1. Exchange authorization code for token
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

    // 5. Generate token and redirect back to frontend
    const sessionToken = generateToken({ userId: user.id, username: user.username, email: user.email });
    const redirectUrl = `${FRONTEND_URL}/login?token=${sessionToken}&username=${encodeURIComponent(user.username)}&email=${encodeURIComponent(user.email)}`;
    
    res.writeHead(302, { Location: redirectUrl });
    res.end();
  } catch (err) {
    console.error('Google callback serverless error:', err);
    res.writeHead(302, { Location: `${FRONTEND_URL}/login?error=${encodeURIComponent(err.message)}` });
    res.end();
  }
}
