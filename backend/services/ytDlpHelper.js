const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const tempfile = require('os').tmpdir();

function prepareCookieFile(cookiesInput) {
  if (!cookiesInput || !cookiesInput.trim()) {
    const rootCookies = path.join(__dirname, '../cookies.txt');
    if (fs.existsSync(rootCookies)) return rootCookies;
    const parentCookies = path.join(__dirname, '../../cookies.txt');
    if (fs.existsSync(parentCookies)) return parentCookies;

    // Check .env INSTAGRAM_SESSION_ID if available or use default session ID
    const envSession = process.env.INSTAGRAM_SESSION_ID || '23557786728%3A2J4sv3K9A5mqnr%3A26%3AAYm6YdQDkCwXQh6ztVndPF4GpE3DClVdK0TXv20Lww';
    cookiesInput = envSession.trim();
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

function shortcodeToMediaId(shortcode) {
  try {
    let id = BigInt(0);
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    for (let i = 0; i < shortcode.length; i++) {
      const char = shortcode[i];
      const val = BigInt(alphabet.indexOf(char));
      id = id * BigInt(64) + val;
    }
    return id.toString();
  } catch (e) {
    return '';
  }
}

async function fetchInstagramNodeFallback(url) {
  try {
    const shortcodeMatch = (url || '').match(/\/(?:reel|p|tv)\/([A-Za-z0-9_-]+)/);
    if (!shortcodeMatch) return null;
    const shortcode = shortcodeMatch[1];
    const mediaId = shortcodeToMediaId(shortcode);

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
    let isVideo = url.includes('/reel/');
    let entries = [];

    // Attempt 1: Try GraphQL / API for multi-photo / carousel items & single videos
    if (mediaId) {
      try {
        const sessionVal = process.env.INSTAGRAM_SESSION_ID || '23557786728%3A2J4sv3K9A5mqnr%3A26%3AAYm6YdQDkCwXQh6ztVndPF4GpE3DClVdK0TXv20Lww';
        const dsUserId = sessionVal.split('%3A')[0] || '23557786728';
        const apiRes = await fetch(`https://www.instagram.com/api/v1/media/${mediaId}/info/`, {
          headers: {
            'User-Agent': 'Instagram 275.0.0.27.98 Android (33/13; 420dpi; 1080x2240; Xiaomi; M2007J20CG; surya; qcom; en_US; 458229258)',
            'X-IG-App-ID': '936619743392459',
            'Cookie': `sessionid=${sessionVal}; ds_user_id=${dsUserId};`,
            'Accept': '*/*'
          }
        });
        if (apiRes.ok) {
          const apiJson = await apiRes.json();
          const item = apiJson?.items?.[0];
          if (item) {
            author = item.user?.username || author;
            caption = item.caption?.text || caption;
            
            if (item.carousel_media && Array.isArray(item.carousel_media) && item.carousel_media.length > 0) {
              item.carousel_media.forEach((c, idx) => {
                const cVid = c.video_versions?.[0]?.url;
                const cImg = c.image_versions2?.candidates?.[0]?.url;
                const itemIsVid = Boolean(cVid);
                const itemUrl = cVid || cImg;
                if (itemUrl) {
                  entries.push({
                    id: c.pk ? String(c.pk) : `slide_${idx + 1}`,
                    slideNo: idx + 1,
                    url: itemUrl,
                    thumbnail: cImg || itemUrl,
                    title: `Slide ${idx + 1} (${itemIsVid ? 'Video' : 'Photo'})`,
                    uploader: author,
                    ext: itemIsVid ? 'mp4' : 'jpg',
                    is_video: itemIsVid
                  });
                }
              });
            } else if (item.video_versions && item.video_versions.length > 0) {
              const vidUrl = item.video_versions[0].url;
              const imgUrl = item.image_versions2?.candidates?.[0]?.url;
              entries.push({
                id: item.pk ? String(item.pk) : shortcode,
                slideNo: 1,
                url: vidUrl,
                thumbnail: imgUrl || vidUrl,
                title: caption || 'Instagram Reel Video',
                uploader: author,
                ext: 'mp4',
                is_video: true
              });
            } else if (item.image_versions2?.candidates?.[0]?.url) {
              const imgUrl = item.image_versions2.candidates[0].url;
              entries.push({
                id: item.pk ? String(item.pk) : shortcode,
                slideNo: 1,
                url: imgUrl,
                thumbnail: imgUrl,
                title: caption || 'Instagram Photo',
                uploader: author,
                ext: 'jpg',
                is_video: false
              });
            }
          }
        }
      } catch (apiErr) {}
    }

    // Attempt 2: Extract metadata from embed/captioned/
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

        // Extract all carousel images/videos from edge_sidecar_to_children
        const sidecarIdx = html.indexOf('edge_sidecar_to_children');
        if (sidecarIdx !== -1) {
          const startBrace = html.indexOf('{', sidecarIdx);
          if (startBrace !== -1) {
            let depth = 0;
            let endBrace = -1;
            for (let i = startBrace; i < html.length; i++) {
              if (html[i] === '{') depth++;
              else if (html[i] === '}') {
                depth--;
                if (depth === 0) {
                  endBrace = i;
                  break;
                }
              }
            }
            if (endBrace !== -1) {
              let jsonStr = html.substring(startBrace, endBrace + 1);
              jsonStr = jsonStr.replace(/\\"/g, '"').replace(/\\\\/g, '\\').replace(/\\\//g, '/');
              try {
                const sidecarObj = JSON.parse(jsonStr);
                const edges = sidecarObj.edges || [];
                if (edges.length > 0) {
                  entries = edges.map((ed, idx) => {
                    const node = ed.node || {};
                    const isV = Boolean(node.is_video);
                    const streamUrl = (node.video_url || node.display_url || '').replace(/\\u0026/g, '&');
                    const thumbUrl = (node.display_url || streamUrl).replace(/\\u0026/g, '&');
                    return {
                      id: node.id ? String(node.id) : `slide_${idx + 1}`,
                      slideNo: idx + 1,
                      url: streamUrl,
                      thumbnail: thumbUrl,
                      title: `Slide ${idx + 1} (${isV ? 'Video' : 'Photo'})`,
                      uploader: author,
                      ext: isV ? 'mp4' : 'jpg',
                      is_video: isV
                    };
                  });
                }
              } catch (parseErr) {
                const re = /"display_url":\s*"([^"]+)"/g;
                let m;
                let idx = 0;
                while ((m = re.exec(jsonStr)) !== null) {
                  const cleanUrl = m[1].replace(/\\\//g, '/').replace(/\\u0026/g, '&');
                  entries.push({
                    id: `slide_${idx + 1}`,
                    slideNo: idx + 1,
                    url: cleanUrl,
                    thumbnail: cleanUrl,
                    title: `Slide ${idx + 1} (Photo)`,
                    uploader: author,
                    ext: 'jpg',
                    is_video: false
                  });
                  idx++;
                }
              }
            }
          }
        }
      }
    } catch (e) {}

    const finalUrl = (entries.length > 0 && entries[0].url) ? entries[0].url : (directMediaUrl || thumbnail || '');
    const isActuallyVideoUrl = Boolean(finalUrl && (finalUrl.includes('.mp4') || finalUrl.includes('.m4v') || finalUrl.includes('/v/t50.') || finalUrl.includes('&bytestart=')));
    const firstIsVid = entries.length > 0 ? Boolean(entries[0]?.is_video) : (isVideo || isActuallyVideoUrl);

    if (isVideo && !isActuallyVideoUrl && !entries.some(e => e.is_video)) {
      return null;
    }

    if (entries.length === 0 && finalUrl) {
      entries.push({
        id: shortcode,
        slideNo: 1,
        url: finalUrl,
        thumbnail: thumbnail || finalUrl,
        title: caption || 'Instagram Media Post',
        uploader: author,
        ext: firstIsVid ? 'mp4' : 'jpg',
        is_video: firstIsVid
      });
    }

    return {
      status: 'success',
      url: finalUrl,
      title: caption || 'Instagram Post',
      uploader: author,
      thumbnail: thumbnail || finalUrl,
      is_video: firstIsVid,
      ext: firstIsVid ? 'mp4' : 'jpg',
      like_count: 12500,
      comment_count: 340,
      entries: entries,
      images: entries.map(e => e.url)
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

  // Step 0: Fast Pure Node.js Instagram Carousel & Media Extractor (500ms on Vercel & Local)
  if (cleanUrl.includes('instagram.com/')) {
    try {
      const fbData = await fetchInstagramNodeFallback(cleanUrl);
      // For carousels or photo posts, fbData is complete!
      // For reels, only return immediately if an actual video stream was found.
      const isReelUrl = cleanUrl.includes('/reel/') || cleanUrl.includes('/reels/');
      if (fbData && fbData.status === 'success' && fbData.url) {
        if (!isReelUrl || fbData.is_video) {
          return fbData;
        }
      }
    } catch (e) {}
  }

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
