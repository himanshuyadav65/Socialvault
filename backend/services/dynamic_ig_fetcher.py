import sys
import os
import requests
import re
import html
import base64
import json

def get_env_var(key, default=""):
    try:
        env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
        if os.path.exists(env_path):
            with open(env_path, 'r', encoding='utf-8') as f:
                for line in f:
                    if line.startswith(f"{key}="):
                        return line.split('=', 1)[1].strip()
    except Exception:
        pass
    return default

def fetch_any_creator_dp(username):
    clean_user = username.replace('@', '').replace('https://www.instagram.com/', '').strip().split('/')[0].split('?')[0]
    
    session_id = get_env_var('INSTAGRAM_SESSION_ID', '23557786728%3A2J4sv3K9A5mqnr%3A26%3AAYm6YdQDkCwXQh6ztVndPF4GpE3DClVdK0TXv20Lww')
    ds_user_id = session_id.split('%3A')[0] if '%3A' in session_id else '23557786728'
    cookies = {
        'sessionid': session_id,
        'csrftoken': '0zOqFALAMd6w6yx5MEC9CiwHnDu4XiU7',
        'ds_user_id': ds_user_id,
        'mid': 'aokv9wALAAGrECN9DgD7TtiyU8Mg'
    }
    
    cookie_str = '; '.join([f'{k}={v}' for k, v in cookies.items() if v])
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Cookie': cookie_str,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
    }
    
    profile_data = {
        'username': clean_user,
        'avatarUrl': '',
        'displayName': '',
        'followers': '',
        'following': '',
        'posts': '',
        'bio': ''
    }
    
    try:
        url = f'https://www.instagram.com/{clean_user}/'
        r = requests.get(url, headers=headers, timeout=12)
        if r.status_code == 200:
            # 1. Extract Target Profile og:image
            og_m = re.search(r'<meta\s+property="og:image"\s+content="([^"]+)"', r.text)
            if og_m:
                raw_og = html.unescape(og_m.group(1))
                # Download and convert to Base64
                img_res = requests.get(raw_og, headers={
                    'User-Agent': headers['User-Agent'],
                    'Referer': url,
                    'Cookie': cookie_str
                }, timeout=10)
                if img_res.status_code == 200 and len(img_res.content) > 500:
                    b64 = base64.b64encode(img_res.content).decode('utf-8')
                    profile_data['avatarUrl'] = f"data:image/jpeg;base64,{b64}"
                    
            # 2. Extract Title / Display Name
            title_m = re.search(r'<title>([^<]+)</title>', r.text)
            if title_m:
                t_str = html.unescape(title_m.group(1))
                name_match = re.search(r'^(.*?)\s*\(@' + re.escape(clean_user) + r'\)', t_str)
                if name_match:
                    profile_data['displayName'] = name_match.group(1).strip()
                    
            # 3. Extract Meta Description (Followers, Following, Posts, Bio)
            desc_m = re.search(r'<meta\s+name="description"\s+content="([^"]+)"', r.text)
            if desc_m:
                desc_str = html.unescape(desc_m.group(1))
                stats_m = re.search(r'([\d,\.KkMm]+)\s*Followers?[,\s]+([\d,\.KkMm]+)\s*Following[,\s]+([\d,\.KkMm]+)\s*Posts?', desc_str, re.I)
                if stats_m:
                    profile_data['followers'] = stats_m.group(1)
                    profile_data['following'] = stats_m.group(2)
                    profile_data['posts'] = stats_m.group(3)
                    
                bio_m = re.search(r'on Instagram:\s*"(.*?)"', desc_str, re.I)
                if bio_m:
                    profile_data['bio'] = bio_m.group(1).strip()
    except Exception as e:
        pass
        
    return profile_data

if __name__ == '__main__':
    target = sys.argv[1] if len(sys.argv) > 1 else 'tyler_blunden'
    res = fetch_any_creator_dp(target)
    print(json.dumps(res, ensure_ascii=False))
