
/**
 * ============================================================================
 * SocialScope — Express REST API Backend
 * Node.js / Express Server Structure
 * ============================================================================
 */

const express = require('express');
const path = require('path');
const cors = require('cors');

const analysisRoutes = require('./routes/analysis');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.static(path.join(__dirname, './')));

// API Routes
app.use('/api/analysis', analysisRoutes);
app.use('/api/auth', authRoutes);

const { extractMediaInfo } = require('./services/ytDlpHelper');

// Free Instagram Downloader API route powered by yt-dlp
app.post('/api/download', async (req, res) => {
  const { url, cookies } = req.body || {};
  if (!url) {
    return res.status(400).json({ status: 'error', error: 'Instagram link is required.' });
  }

  // Clean Instagram URL
  let cleanUrl = url.trim();
  const shortcodeMatch = cleanUrl.match(/\/(?:reel|reels|p|tv)\/([A-Za-z0-9_-]+)/i);
  if (shortcodeMatch) {
    const sc = shortcodeMatch[1];
    const isReel = cleanUrl.includes('/reel/') || cleanUrl.includes('/reels/');
    cleanUrl = `https://www.instagram.com/${isReel ? 'reel' : 'p'}/${sc}/`;
  }

  // Auto-save cookies if passed in body
  if (cookies && typeof cookies === 'string' && cookies.trim()) {
    try {
      const fs = require('fs');
      const cPath = path.join(__dirname, 'cookies.txt');
      const lines = cookies.includes('\t') ? cookies : `.instagram.com\tTRUE\t/\tTRUE\t2147483647\tsessionid\t${cookies.replace(/^sessionid=/, '').trim()}`;
      fs.writeFileSync(cPath, lines, 'utf-8');
    } catch (e) {}
  }

  try {
    const data = await extractMediaInfo(cleanUrl, cookies);
    if (data && (data.url || data.status === 'success')) {
      const isActuallyImg = Boolean(data.ext === 'jpg' || data.ext === 'jpeg' || (data.url && (data.url.includes('.jpg') || data.url.includes('.webp') || data.url.includes('dst-jpg'))));
      if (isActuallyImg) {
        data.is_video = false;
        data.ext = 'jpg';
      }
      const isReelReq = cleanUrl.includes('/reel/') || cleanUrl.includes('/reels/');
      if (isReelReq && isActuallyImg) {
        return res.status(401).json({
          status: 'error',
          error_type: 'video_stream_restricted',
          error: '⚠️ Instagram Video Stream Restricted: Instagram requires account authentication to stream this reel. Automated direct MP4 download is currently restricted for this reel.'
        });
      }
      return res.json(data);
    }

    const errText = (data && data.error) ? String(data.error).toLowerCase() : '';
    const isPrivate = Boolean(data && (data.is_private || data.isPrivate || errText.includes('this account is private')));

    if (isPrivate) {
      return res.status(403).json({
        status: 'error',
        isPrivate: true,
        error_type: 'private_account',
        error: '🔒 Private Account: This Instagram reel, photo, or post is from a Private account. Media cannot be extracted from private profiles without permission. Please paste a link from a Public account.'
      });
    }

    return res.status(401).json({
      status: 'error',
      isPrivate: false,
      error_type: 'cookie_required',
      error: '🔑 Instagram Login Verification Required: Instagram temporarily restricts automated downloading of this public Reel. Please paste your Instagram sessionid cookie below to download in Full HD 1080p.'
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', error: 'Failed to extract media: ' + err.message });
  }
});

// Stream Media Proxy
app.get('/api/stream', async (req, res) => {
  const mediaUrl = req.query.url;
  const isVid = (req.query.filename || '').endsWith('.mp4');
  const filename = req.query.filename || (isVid ? 'instagram_download.mp4' : 'instagram_download.jpg');
  if (!mediaUrl) return res.status(400).send('Missing url parameter');

  try {
    const pyRes = await fetch(`http://localhost:8000/api/stream?url=${encodeURIComponent(mediaUrl)}&filename=${encodeURIComponent(filename)}`);
    if (pyRes.ok) {
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', pyRes.headers.get('content-type') || (filename.endsWith('.jpg') ? 'image/jpeg' : 'video/mp4'));
      const { Readable } = require('stream');
      return Readable.fromWeb(pyRes.body).pipe(res);
    }
  } catch (e) {
    // Fallback direct stream
  }

  try {
    const upstream = await fetch(mediaUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': 'https://www.instagram.com/',
        'Accept': filename.endsWith('.jpg') ? 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8' : '*/*'
      }
    });
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || (filename.endsWith('.jpg') ? 'image/jpeg' : 'video/mp4'));
    const { Readable } = require('stream');
    return Readable.fromWeb(upstream.body).pipe(res);
  } catch (err) {
    res.status(500).send('Stream error: ' + err.message);
  }
});

// Cookie Upload & Status Endpoints
app.post('/api/upload-cookies', async (req, res) => {
  const fs = require('fs');
  const cookiesPath = path.join(__dirname, 'cookies.txt');

  if (req.body && req.body.cookies) {
    fs.writeFileSync(cookiesPath, req.body.cookies, 'utf-8');
    return res.json({
      status: 'success',
      message: 'cookies.txt uploaded and saved successfully! All 3 tools will now use this cookie file.'
    });
  }

  // Fallback direct text body or proxy
  let rawData = '';
  req.on('data', chunk => { rawData += chunk; });
  req.on('end', () => {
    if (rawData && rawData.trim()) {
      fs.writeFileSync(cookiesPath, rawData, 'utf-8');
      return res.json({
        status: 'success',
        message: 'cookies.txt uploaded and saved successfully! All 3 tools will now use this cookie file.'
      });
    }
    return res.status(400).json({ status: 'error', error: 'No cookie data provided.' });
  });
});

app.get('/api/cookies-status', (req, res) => {
  const fs = require('fs');
  const cookiesPath = path.join(__dirname, 'cookies.txt');
  const exists = fs.existsSync(cookiesPath);
  return res.json({
    status: 'success',
    has_cookies: exists,
    size_bytes: exists ? fs.statSync(cookiesPath).size : 0
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: "online",
    engine: "SocialScope Simulation Engine v4.8",
    timestamp: new Date().toISOString()
  });
});

const fs = require('fs');

function sendFrontendFile(res, fileName) {
  const frontendPath = path.join(__dirname, '../frontend', fileName);
  if (fs.existsSync(frontendPath)) {
    return res.sendFile(frontendPath);
  }
  return res.sendFile(path.join(__dirname, fileName));
}

// Page routes
app.get('/features', (req, res) => {
  sendFrontendFile(res, 'features.html');
});

app.get('/hashtag-scraper', (req, res) => {
  sendFrontendFile(res, 'hashtag-scraper.html');
});

app.get('/reel-downloader', (req, res) => {
  sendFrontendFile(res, 'reel-downloader.html');
});

app.get('/comment-scraper', (req, res) => {
  sendFrontendFile(res, 'comment-scraper.html');
});

app.get('/facebook-scraper', (req, res) => {
  sendFrontendFile(res, 'facebook-scraper.html');
});

app.get('/facebook-story-downloader', (req, res) => {
  res.redirect(301, '/facebook-reel-downloader');
});

app.get('/facebook-reel-downloader', (req, res) => {
  sendFrontendFile(res, 'facebook-reel-downloader.html');
});

app.get('/instagram-story-downloader', (req, res) => {
  sendFrontendFile(res, 'instagram-story-downloader.html');
});

app.get('/youtube-video-downloader', (req, res) => {
  sendFrontendFile(res, 'youtube-video-downloader.html');
});

app.get('/youtube-shorts-downloader', (req, res) => {
  res.redirect('https://share.google/xR9zCtt80CYPOxGhD');
});

app.get('/youtube-thumbnail-downloader', (req, res) => {
  sendFrontendFile(res, 'youtube-thumbnail-downloader.html');
});

// Serve frontend fallback
app.get('*', (req, res) => {
  sendFrontendFile(res, 'index.html');
});

// Start server
if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`[SocialScope] Simulation Server active at http://localhost:${PORT}`);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`\n⚠️ Port ${PORT} is already running an active SocialVault server instance at http://localhost:${PORT}`);
    } else {
      console.error('Server error:', err);
    }
  });
}

module.exports = app;
