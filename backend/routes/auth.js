/**
 * Google Authentication Routes for SocialVault
 * Uses Google OAuth 2.0 Client & Token Verification
 * Saves user details directly into XAMPP MySQL database (instatrack_db.users)
 */

const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const { saveGoogleUserToDb, getUserByEmail, isDbConnected } = require('../config/db');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '635983231827-6cfrakmb2v5l7q03u7ser51anndrpvm7.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Verify Google ID Token Helper
async function verifyGoogleToken(idToken) {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: idToken,
      audience: GOOGLE_CLIENT_ID
    });
    return ticket.getPayload();
  } catch (err) {
    // Fallback: Verify via Google TokenInfo HTTP API
    try {
      const resp = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
      if (resp.ok) {
        return await resp.json();
      }
    } catch (fetchErr) {
      console.warn("Tokeninfo API fallback error:", fetchErr.message);
    }
    throw new Error(err.message || "Invalid Google ID token");
  }
}

// 1. Google One-Tap / Button Sign-In Handler
router.post('/google', async (req, res) => {
  try {
    const { credential, clientId } = req.body;

    if (!credential) {
      return res.status(400).json({ success: false, error: "Google credential token is required." });
    }

    const payload = await verifyGoogleToken(credential);

    if (!payload || !payload.email) {
      return res.status(401).json({ success: false, error: "Failed to verify Google identity." });
    }

    const userData = {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name || payload.email.split('@')[0],
      givenName: payload.given_name || '',
      familyName: payload.family_name || '',
      picture: payload.picture || '',
      locale: payload.locale || 'en'
    };

    // Save to XAMPP MySQL Database (users table)
    let savedUser = userData;
    try {
      const dbUser = await saveGoogleUserToDb(userData);
      if (dbUser) {
        savedUser = {
          ...userData,
          id: dbUser.id || undefined,
          savedInDb: true
        };
      }
    } catch (dbErr) {
      console.warn("[MySQL] Warning saving user to DB:", dbErr.message);
    }

    console.log(`👤 [Google Auth] User signed in: ${userData.name} (${userData.email})`);

    return res.json({
      success: true,
      message: "Google sign-in successful.",
      user: savedUser,
      dbConnected: isDbConnected()
    });

  } catch (error) {
    console.error("Google Auth Error:", error.message);
    return res.status(401).json({
      success: false,
      error: error.message || "Google Authentication failed."
    });
  }
});

// 2. Google OAuth2 Access Token / UserInfo Flow (Popup fallback)
router.post('/google-user', async (req, res) => {
  try {
    const { accessToken, user } = req.body;
    let verifiedUser = user;

    // Verify token with Google UserInfo endpoint if accessToken provided
    if (accessToken) {
      const gRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (gRes.ok) {
        const payload = await gRes.json();
        verifiedUser = {
          googleId: payload.sub,
          email: payload.email,
          name: payload.name || payload.email.split('@')[0],
          givenName: payload.given_name || '',
          familyName: payload.family_name || '',
          picture: payload.picture || '',
          locale: payload.locale || 'en'
        };
      }
    }

    if (!verifiedUser || !verifiedUser.email) {
      return res.status(400).json({ success: false, error: "Valid user email is required." });
    }

    const userData = {
      googleId: verifiedUser.googleId || verifiedUser.sub || '',
      email: verifiedUser.email,
      name: verifiedUser.name || verifiedUser.email.split('@')[0],
      givenName: verifiedUser.givenName || verifiedUser.given_name || '',
      familyName: verifiedUser.familyName || verifiedUser.family_name || '',
      picture: verifiedUser.picture || verifiedUser.avatarUrl || '',
      locale: verifiedUser.locale || 'en'
    };

    // Save to XAMPP MySQL Database (users table)
    let savedUser = userData;
    try {
      const dbUser = await saveGoogleUserToDb(userData);
      if (dbUser) {
        savedUser = {
          ...userData,
          id: dbUser.id || undefined,
          savedInDb: true
        };
      }
    } catch (dbErr) {
      console.warn("[MySQL] Warning saving user to DB:", dbErr.message);
    }

    console.log(`👤 [Google OAuth2] User saved in MySQL: ${userData.name} (${userData.email})`);

    return res.json({
      success: true,
      message: "Google sign-in successful.",
      user: savedUser,
      dbConnected: isDbConnected()
    });

  } catch (error) {
    console.error("Google User Auth Error:", error.message);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to process Google user."
    });
  }
});

// 2. Get Public Google Client ID for Frontend Init
router.get('/config', (req, res) => {
  res.json({
    clientId: GOOGLE_CLIENT_ID
  });
});

// 3. Logout Route
router.post('/logout', (req, res) => {
  res.json({ success: true, message: "Logged out successfully." });
});

module.exports = router;
