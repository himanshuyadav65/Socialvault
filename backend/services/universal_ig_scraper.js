const { execSync } = require('child_process');
const https = require('https');
const http = require('http');
const { decodeHtmlEntities } = require('./htmlDecoder');

function extractTargetProfile(username) {
  try {
    const cleanUser = username.replace(/^@/, '').replace(/https?:\/\/(www\.)?instagram\.com\//i, '').replace(/[\/?].*$/, '').toLowerCase().trim();
    const url = `https://www.instagram.com/${cleanUser}/`;
    
    const html = execSync(`curl -sL --max-time 10 "${url}"`).toString('utf-8');
    
    let avatarUrl = '';
    let displayName = cleanUser;
    let bio = '';
    let followers = '';
    let following = '';
    let posts = '';

    // 1. og:image (This is ALWAYS the searched user's real DP!)
    const ogMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
    if (ogMatch && ogMatch[1]) {
      avatarUrl = ogMatch[1].replace(/&amp;/g, '&');
    }

    // 2. Title (Name)
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      const nameMatch = titleMatch[1].match(/^(.*?)\s*\(@/);
      if (nameMatch && nameMatch[1]) {
        displayName = decodeHtmlEntities(nameMatch[1].trim());
      }
    }

    // 3. Meta Description (Followers, Following, Posts, Bio)
    // Matches either <meta name="description" content="..."> OR <meta content="..." name="description"> OR <meta property="og:description" content="...">
    const descMatch = html.match(/<meta[^>]+(?:name=["']description["']|property=["']og:description["'])[^>]+content=["']([^"']+)["']/i) 
                   || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:name=["']description["']|property=["']og:description["'])/i);
    
    if (descMatch && descMatch[1]) {
      const desc = descMatch[1].replace(/&quot;/g, '"').replace(/&#064;/g, '@');
      const statsMatch = desc.match(/([\d,\.KkMm]+)\s*Followers?[,\s]+([\d,\.KkMm]+)\s*Following[,\s]+([\d,\.KkMm]+)\s*Posts?/i);
      if (statsMatch) {
        followers = statsMatch[1];
        following = statsMatch[2];
        posts = statsMatch[3];
      }
      const bioMatch = desc.match(/on Instagram:\s*"(.*?)"/i);
      if (bioMatch) {
        bio = decodeHtmlEntities(bioMatch[1].trim());
      }
    }

    return {
      found: Boolean(avatarUrl),
      username: cleanUser,
      displayName,
      avatarUrl,
      bio,
      followers,
      following,
      posts
    };
  } catch (err) {
    return { found: false, username };
  }
}

// Download image using Node https and convert to Data URI (100% reliable, no external tool needed)
function downloadImageAsBase64(imageUrl) {
  return new Promise((resolve) => {
    if (!imageUrl || !imageUrl.startsWith('http')) return resolve('');
    try {
      const client = imageUrl.startsWith('https') ? https : http;
      const req = client.get(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Referer': 'https://www.instagram.com/'
        },
        timeout: 10000
      }, (res) => {
        if (res.statusCode !== 200) return resolve(imageUrl);
        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          if (buffer.length > 500) {
            const mimeType = res.headers['content-type'] || 'image/jpeg';
            return resolve(`data:${mimeType};base64,${buffer.toString('base64')}`);
          }
          resolve(imageUrl);
        });
      });
      req.on('error', () => resolve(imageUrl));
      req.on('timeout', () => { req.destroy(); resolve(imageUrl); });
    } catch (e) {
      resolve(imageUrl);
    }
  });
}

module.exports = {
  extractTargetProfile,
  downloadImageAsBase64
};
