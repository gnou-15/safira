import crypto from 'crypto';

// Use backend environment variable for secret, fallback for security
const JWT_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || 'default-jwt-secret-key-321';

/**
 * Hashes a plain-text password using native SHA-512 PBKDF2.
 * @param {string} password 
 * @returns {string} salt:hash format
 */
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verifies password matches the stored salted hash.
 * @param {string} password 
 * @param {string} storedPassword 
 * @returns {boolean}
 */
export function verifyPassword(password, storedPassword) {
  try {
    const [salt, hash] = storedPassword.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  } catch (e) {
    return false;
  }
}

/**
 * Generates a signed, custom secure JWT-like session token natively.
 * @param {object} payload 
 * @param {number} expiresInMs Default 7 days
 * @returns {string} header.body.signature token
 */
export function generateToken(payload, expiresInMs = 7 * 24 * 60 * 60 * 1000) {
  const exp = Date.now() + expiresInMs;
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
    
  return `${header}.${body}.${signature}`;
}

/**
 * Verifies native session token validity and expiration.
 * @param {string} token 
 * @returns {object|null} payload or null if invalid
 */
export function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const [header, body, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');
      
    if (signature !== expectedSignature) return null;
    
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) {
      return null; // Expired
    }
    
    return payload;
  } catch (e) {
    return null;
  }
}
