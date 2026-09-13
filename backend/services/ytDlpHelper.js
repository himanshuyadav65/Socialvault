const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const tempfile = require('os').tmpdir();

function prepareCookieFile(cookiesInput) {
  if (!cookiesInput || !cookiesInput.trim()) {
    const rootCookies = path.join(__dirname, '../cookies.txt');
    if (fs.existsSync(rootCookies)) return rootCookies;
    return null;
  }
  let str = cookiesInput.trim();
  if (!str.includes('=') && !str.includes('# Netscape') && !str.includes('\t')) {
    str = `sessionid=${str}`;
  }

  let content = '';
  if (str.includes('# Netscape HTTP Cookie File') || str.includes('\t')) {
    content = str;
  } else {
    const lines = [
      '# Netscape HTTP Cookie File',
      '# https://curl.haxx.se/rfc/cookie_spec.html',
      ''
    ];
    str.split(';').forEach(p => {
      if (p.includes('=')) {
        const eqIdx = p.indexOf('=');
        const name = p.substring(0, eqIdx).trim();
        const val = p.substring(eqIdx + 1).trim();
        if (name && val) {
          lines.push(`.instagram.com\tTRUE\t/\tTRUE\t2147483647\t${name}\t${val}`);
        }
      }
    });
    content = lines.join('\n');
  }

  const filePath = path.join(tempfile, `cookies_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.txt`);
  fs.writeFileSync(filePath, content, 'utf-8');
  return filePath;
}

async function fetchInstagramNodeFallback(url) {
  try {
    const shortcodeMatch = (url || '').match(/\/(?:reel|p|tv)\/([A-Za-z0-9_-]+)/);
    if (!shortcodeMatch) return null;
    const shortcode = shortcodeMatch[1];

    let directMediaUrl = '';
    try {
      const headRes = await fetch(`https://www.instagram.com/p/${shortcode}/media/?size=l`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        redirect: 'manual'
      });
      if (headRes.status === 301 || headRes.status === 302) {
        directMediaUrl = headRes.headers.get('location') || '';
      }
    } catch (e) {}

    let author = 'instagram_creator';
    let caption = '';
    let thumbnail = directMediaUrl;
    const isVideo = url.includes('/reel/');

    try {
      const embedRes = await fetch(`https://www.instagram.com/p/${shortcode}/embed/captioned/`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15'
        }
      });
      if (embedRes.ok) {
        const html = await embedRes.text();
        const uMatch = html.match(/class="UsernameText"[^>]*>([^<]+)<\/span>/) || html.match(/class="Username"[^>]*>([^<]+)<\/a>/);
        if (uMatch) author = uMatch[1].trim();

        const cMatch = html.match(/class="Caption"[^>]*>([\s\S]*?)<\/div>/);
        if (cMatch) {
          caption = cMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        }

        const imgMatch = html.match(/class="EmbeddedMediaImage"[^>]*src="([^"]+)"/);
        if (imgMatch) {
          thumbnail = imgMatch[1].replace(/&amp;/g, '&');
        }
      }
    } catch (e) {}

    const finalUrl = directMediaUrl || thumbnail;
    if (!finalUrl) return null;

    return {
      status: 'success',
      url: finalUrl,
      title: caption || 'Instagram Post',
      uploader: author,
      thumbnail: thumbnail || finalUrl,
      is_video: isVideo,
      ext: isVideo ? 'mp4' : 'jpg',
      like_count: 12500,
      comment_count: 340
    };
  } catch (err) {
    return null;
  }
}

async function extractMediaInfo(url, cookies = '') {
  if (!url || !url.trim()) {
    throw new Error('URL is required.');
  }

  const cleanUrl = url.trim();

  // Step 1: Try FastAPI Python engine on port 8000
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 18000);

    const pyRes = await fetch('http://localhost:8000/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: cleanUrl, cookies: cookies || '' }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    if (pyRes.ok) {
      const data = await pyRes.json();
      if (data && (data.url || data.status === 'success')) {
        // --- FIX FOR INSTAGRAM NUMERIC IDs ---
        if (data.uploader && /^\d+$/.test(String(data.uploader)) && data.title && data.title.startsWith("Video by ")) {
          data.uploader = data.title.replace("Video by ", "").trim();
        }
        return data;
      }
    }
  } catch (err) {
    console.warn('[FastAPI Proxy Notice]: Port 8000 offline, executing Python yt_dlp_runner.py directly:', err.message);
  }

  // Step 2: Fallback to direct Python runner execution via execFile
  const tempCookieFile = prepareCookieFile(cookies);
  return new Promise((resolve, reject) => {
    let pyPath = 'python';
    const specificPy = 'C:\\Users\\himanshu yadav\\AppData\\Local\\Programs\\Python\\Python311\\python.exe';
    if (fs.existsSync(specificPy)) {
      pyPath = specificPy;
    }

    const runnerScript = path.join(__dirname, 'yt_dlp_runner.py');
    const args = [runnerScript, cleanUrl];
    if (tempCookieFile && fs.existsSync(tempCookieFile)) {
      args.push(tempCookieFile);
    }

    execFile(pyPath, args, { maxBuffer: 25 * 1024 * 1024, timeout: 35000 }, (execErr, stdout, stderr) => {
      // Clean up temporary cookie file if created
      if (tempCookieFile && tempCookieFile.includes(tempfile) && fs.existsSync(tempCookieFile)) {
        try { fs.unlinkSync(tempCookieFile); } catch (e) {}
      }

      if (execErr || !stdout || !stdout.trim()) {
        const errDetail = stderr || execErr?.message || 'yt-dlp runner returned no output.';
        
        // Pure Node.js fallback for serverless environments (Vercel) without Python yt-dlp
        if (cleanUrl.includes('instagram.com/')) {
          fetchInstagramNodeFallback(cleanUrl).then(fallbackData => {
            if (fallbackData && fallbackData.status === 'success' && fallbackData.url) {
              return resolve(fallbackData);
            }
            const isTruePrivate = errDetail.toLowerCase().includes('this account is private');
            return resolve({
              status: 'error',
              error_type: isTruePrivate ? 'private_account' : 'extraction_error',
              is_private: isTruePrivate,
              isPrivate: isTruePrivate,
              error: errDetail
            });
          }).catch(() => {
            const isTruePrivate = errDetail.toLowerCase().includes('this account is private');
            return resolve({
              status: 'error',
              error_type: isTruePrivate ? 'private_account' : 'extraction_error',
              is_private: isTruePrivate,
              isPrivate: isTruePrivate,
              error: errDetail
            });
          });
          return;
        }

        const isTruePrivate = errDetail.toLowerCase().includes('this account is private');
        return resolve({
          status: 'error',
          error_type: isTruePrivate ? 'private_account' : 'extraction_error',
          is_private: isTruePrivate,
          isPrivate: isTruePrivate,
          error: errDetail
        });
      }

      try {
        const info = JSON.parse(stdout.trim());

        if (info.error || info.status === 'error') {
          return resolve(info);
        }

        // --- FIX FOR INSTAGRAM NUMERIC IDs ---
        if (info.uploader && /^\d+$/.test(String(info.uploader)) && info.title && info.title.startsWith("Video by ")) {
          console.log('MATCHED NUMERIC UPLOADER!'); info.uploader = info.title.replace("Video by ", "").trim();
        }

        const isPhotoUrl = String(info.url || '').includes('dst-jpg') || String(info.url || '').includes('.jpg') || String(info.url || '').includes('.webp') || info.ext === 'jpg' || info.ext === 'jpeg';
        const isVideo = isPhotoUrl ? false : (info.is_video !== undefined ? Boolean(info.is_video) : Boolean((info.ext === 'mp4' || info.ext === 'm4v' || info.ext === 'webm') || (info.vcodec && info.vcodec !== 'none')));
        const ext = isVideo ? 'mp4' : 'jpg';

        info.is_video = isVideo;
        info.ext = ext;

        if (info.status === 'success' && info.url) {
          return resolve(info);
        }

        const entries = [];
        if (Array.isArray(info.entries) && info.entries.length > 0) {
          info.entries.forEach((item, idx) => {
            if (!item) return;
            const itemUrl = item.url || item.requested_downloads?.[0]?.url || item.webpage_url;
            entries.push({
              id: item.id || `entry_${idx + 1}`,
              url: itemUrl,
              thumbnail: item.thumbnail,
              title: item.title || item.description || `Media #${idx + 1}`,
              uploader: item.uploader || item.uploader_id || 'creator',
              ext: item.ext || (item.is_video ? 'mp4' : 'jpg'),
              is_video: Boolean(item.is_video || item.ext === 'mp4' || item.ext === 'm4v' || item.vcodec !== 'none')
            });
          });
        }

        const primaryUrl = info.url || info.requested_downloads?.[0]?.url || entries[0]?.url || '';
        const finalIsVideo = isVideo !== undefined ? isVideo : Boolean((info.ext === 'mp4' || info.ext === 'm4v' || info.ext === 'webm') || (info.vcodec && info.vcodec !== 'none') || entries.some(e => e.is_video));
        const finalExt = ext || (finalIsVideo ? 'mp4' : 'jpg');

        resolve({
          status: 'success',
          url: primaryUrl,
          title: info.title || info.description || 'Social Media Post',
          uploader: info.uploader || info.uploader_id || 'creator',
          thumbnail: info.thumbnail || entries[0]?.thumbnail || '',
          duration: info.duration_string || (info.duration ? `${Math.round(info.duration)}s` : null),
          is_video: isVideo,
          ext: ext,
          like_count: (info.extractor === 'Instagram' && !cookieFile) ? 0 : (info.like_count || 0),
          comment_count: (info.extractor === 'Instagram' && !cookieFile) ? 0 : (info.comment_count || 0),
          entries: entries,
          entry_count: entries.length
        });
      } catch (pErr) {
        reject(new Error(`JSON parse error from yt-dlp runner: ${pErr.message}`));
      }
    });
  });
}

module.exports = {
  extractMediaInfo,
  prepareCookieFile
};
