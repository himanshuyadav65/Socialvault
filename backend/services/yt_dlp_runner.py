import sys
import json
import os
import re
import base64
import requests
import yt_dlp

def fetch_user_tray(user_id, cookie_file=None):
    cookies = {}
    if cookie_file and os.path.exists(cookie_file):
        with open(cookie_file, 'r', encoding='utf-8') as f:
            for line in f:
                if line.startswith('#') or not line.strip():
                    continue
                parts = line.strip().split('\t')
                if len(parts) >= 7:
                    cookies[parts[5]] = parts[6]
    
    url = f"https://www.instagram.com/api/v1/highlights/{user_id}/highlights_tray/"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'X-IG-App-ID': '936619743392459',
        'X-Requested-With': 'XMLHttpRequest',
    }
    try:
        r = requests.get(url, headers=headers, cookies=cookies, timeout=8)
        if r.status_code == 200:
            trays = r.json().get('tray', [])
            result = []
            for t in trays:
                cover = t.get('cover_media', {}).get('cropped_image_version', {}).get('url') or t.get('cover_media_cropped_url') or ''
                hl_raw_id = str(t.get('id', '')).replace('highlight:', '')
                result.append({
                    'id': hl_raw_id,
                    'title': t.get('title', 'Highlight'),
                    'coverUrl': cover
                })
            return result
    except Exception:
        pass
    return []

def resolve_instagram_image_url(shortcode_or_url):
    """
    Resolves Instagram high-res photo CDN URL via public media endpoint redirect.
    """
    clean_url = shortcode_or_url
    if not clean_url.startswith("http"):
        clean_url = f"https://www.instagram.com/p/{shortcode_or_url}/"
    
    media_url = clean_url.rstrip('/') + '/media/?size=l'
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    }
    try:
        r = requests.get(media_url, headers=headers, allow_redirects=True, timeout=8, stream=True)
        if r.status_code == 200 and ('image' in r.headers.get('content-type', '') or 'fbcdn.net' in r.url):
            return r.url
    except Exception:
        pass
    return None

class ErrorCollector:
    def __init__(self):
        self.errors = []
    def debug(self, msg): pass
    def warning(self, msg): pass
    def error(self, msg):
        self.errors.append(msg)

def extract(url_or_username, cookie_file=None):
    raw_input = url_or_username.strip()
    target_url = raw_input
    
    # Decode /s/ shortlink if present
    if "/s/" in raw_input.lower():
        match = re.search(r'/s/([A-Za-z0-9+/=]+)', raw_input)
        if match:
            b64_str = match.group(1)
            missing_padding = len(b64_str) % 4
            if missing_padding:
                b64_str += '=' * (4 - missing_padding)
            try:
                decoded = base64.b64decode(b64_str).decode('utf-8', errors='ignore')
                if 'highlight:' in decoded:
                    hl_id = decoded.split('highlight:')[1]
                    target_url = f"https://www.instagram.com/stories/highlights/{hl_id}/"
            except Exception:
                pass
    elif not raw_input.startswith("http://") and not raw_input.startswith("https://"):
        clean_user = raw_input.replace('@', '').strip()
        target_url = f"https://www.instagram.com/stories/highlights/{clean_user}/"

    clean_url = target_url.split('?')[0].rstrip('/') + '/'
    shortcode_match = re.search(r'/(?:p|reel|tv)/([A-Za-z0-9_-]+)', target_url)
    main_shortcode = shortcode_match.group(1) if shortcode_match else None

    # Auto fallback to root cookies.txt if not explicitly passed
    if not cookie_file:
        root_cookie = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'cookies.txt'))
        if os.path.exists(root_cookie):
            cookie_file = root_cookie

    user_agents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
        'Instagram 275.0.0.27.98 Android (33/13; 420dpi; 1080x2240; Xiaomi; M2007J20CG; surya; qcom; en_US; 458229258)'
    ]

    last_err = None
    info = None
    collector = ErrorCollector()

    for ua in user_agents:
        opts = {
            'quiet': True,
            'no_warnings': True,
            'retries': 3,
            'fragment_retries': 3,
            'ignoreerrors': True,
            'logger': collector,
            'http_headers': {
                'User-Agent': ua,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
            }
        }
        if cookie_file and os.path.exists(cookie_file):
            opts['cookiefile'] = cookie_file

        try:
            with yt_dlp.YoutubeDL(opts) as ydl:
                info = ydl.extract_info(target_url, download=False)
                if info:
                    break
        except Exception as e:
            last_err = e
            if "login" in str(e).lower() or "cookie" in str(e).lower() or "private" in str(e).lower():
                raise e
            continue

    # Extract skipped photo shortcodes from errors
    photo_shortcodes = []
    for err in collector.errors:
        m = re.search(r'\[Instagram\]\s+([A-Za-z0-9_-]+):', str(err))
        if m and m.group(1) not in photo_shortcodes:
            photo_shortcodes.append(m.group(1))

    # Process and build complete response
    title = "Instagram Media Post"
    uploader = "instagram_user"
    thumbnail = ""
    video_url = ""
    entries = []

    if info:
        title = info.get('title') or info.get('description') or title
        uploader = info.get('uploader') or info.get('uploader_id') or uploader
        thumbnail = info.get('thumbnail') or ""

        # Fetch highlight trays if user ID present
        u_id = info.get('uploader_id')
        if not u_id and info.get('entries') and len(info['entries']) > 0 and info['entries'][0]:
            u_id = info['entries'][0].get('uploader_id')
        if u_id:
            trays = fetch_user_tray(u_id, cookie_file)
            if trays:
                info['user_highlight_trays'] = trays

        video_url = info.get('url') or ""
        if not video_url and info.get('requested_downloads'):
            video_url = info['requested_downloads'][0].get('url') or ""

        raw_entries = info.get('entries') or []
        photo_idx = 0

        if raw_entries:
            for idx, item in enumerate(raw_entries):
                slide_no = idx + 1
                if item and (item.get('url') or item.get('requested_downloads')):
                    item_id = item.get('id') or f"slide_{slide_no}"
                    item_title = item.get('title') or f"Slide {slide_no} (Video)"
                    item_url = item.get('url') or (item.get('requested_downloads')[0].get('url') if item.get('requested_downloads') else None)
                    item_ext = item.get('ext') or 'mp4'
                    is_vid = item_ext in ['mp4', 'm4v', 'webm'] or bool(item.get('vcodec') and item.get('vcodec') != 'none')
                    
                    entries.append({
                        'id': item_id,
                        'slideNo': slide_no,
                        'url': item_url,
                        'thumbnail': item.get('thumbnail') or item_url,
                        'title': item_title,
                        'uploader': uploader,
                        'ext': item_ext,
                        'is_video': is_vid
                    })
                else:
                    # Photo slide skipped by yt-dlp
                    sc = photo_shortcodes[photo_idx] if photo_idx < len(photo_shortcodes) else None
                    photo_idx += 1
                    img_url = resolve_instagram_image_url(sc) if sc else None
                    if img_url:
                        entries.append({
                            'id': sc or f"slide_{slide_no}",
                            'slideNo': slide_no,
                            'url': img_url,
                            'thumbnail': img_url,
                            'title': f"Slide {slide_no} (Photo)",
                            'uploader': uploader,
                            'ext': 'jpg',
                            'is_video': False
                        })

    # If carousel photos were detected without entries structure
    if not entries and photo_shortcodes:
        for idx, sc in enumerate(photo_shortcodes):
            slide_no = idx + 1
            img_url = resolve_instagram_image_url(sc)
            if img_url:
                entries.append({
                    'id': sc,
                    'slideNo': slide_no,
                    'url': img_url,
                    'thumbnail': img_url,
                    'title': f"Slide {slide_no} (Photo)",
                    'uploader': uploader,
                    'ext': 'jpg',
                    'is_video': False
                })

    # If single photo post or primary video URL is not found via yt-dlp
    is_video = bool(video_url or any(e['is_video'] for e in entries))
    primary_url = video_url

    if not primary_url and entries:
        primary_url = entries[0]['url']

    if not primary_url and main_shortcode:
        resolved_img = resolve_instagram_image_url(main_shortcode)
        if resolved_img:
            primary_url = resolved_img
            thumbnail = thumbnail or resolved_img
            entries.append({
                'id': main_shortcode,
                'slideNo': 1,
                'url': resolved_img,
                'thumbnail': resolved_img,
                'title': title,
                'uploader': uploader,
                'ext': 'jpg',
                'is_video': False
            })

    if not primary_url and not entries:
        if last_err:
            raise last_err
        raise Exception("Could not extract media info from the provided URL.")

    ext = 'mp4' if is_video else 'jpg'

    res_data = {
        'status': 'success',
        'url': primary_url,
        'title': title,
        'uploader': uploader,
        'thumbnail': thumbnail or (entries[0]['thumbnail'] if entries else ''),
        'duration': info.get('duration_string') if info else None,
        'is_video': is_video,
        'ext': ext,
        'like_count': 0 if (info and info.get('extractor') == 'Instagram' and not cookie_file) else (info.get('like_count') if info else 0),
        'comment_count': 0 if (info and info.get('extractor') == 'Instagram' and not cookie_file) else (info.get('comment_count') if info else 0),
        'entries': entries,
        'entry_count': len(entries),
        'totalEntries': len(entries),
        'is_carousel': len(entries) > 1
    }
    if info and 'user_highlight_trays' in info:
        res_data['user_highlight_trays'] = info['user_highlight_trays']

    return res_data

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No URL or Username provided"}))
        sys.exit(1)
        
    target_input = sys.argv[1]
    cookie_path = sys.argv[2] if len(sys.argv) > 2 and sys.argv[2].strip() else None

    try:
        data = extract(target_input, cookie_path)
        print(json.dumps(data))
    except Exception as e:
        err_msg = str(e)
        err_lower = err_msg.lower()
        if "this account is private" in err_lower or "private account" in err_lower:
            print(json.dumps({
                "status": "error",
                "is_private": True,
                "isPrivate": True,
                "error_type": "private_account",
                "error": "🔒 Private Account Detected: This Instagram profile or highlight is from a Private account. Media cannot be downloaded without permission.",
                "detail": err_msg
            }))
        else:
            print(json.dumps({
                "status": "error",
                "is_private": False,
                "isPrivate": False,
                "error_type": "cookie_required",
                "error": "🔑 Instagram Cookie / Authentication Required: Instagram requires login to extract Highlights. Please paste your sessionid=... cookie below to download this highlight!",
                "detail": err_msg
            }))
