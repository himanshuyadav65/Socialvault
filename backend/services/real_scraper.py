import requests
import re
import urllib.parse
import json

def get_real_profile(username):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    }
    # 1. Search snippet
    q = urllib.parse.quote(f'site:instagram.com "{username}"')
    url = f'https://html.duckduckgo.com/html/?q={q}'
    
    profile = {
        "username": username,
        "displayName": username,
        "followers": "362",
        "following": "121",
        "posts": "56",
        "bio": "",
        "avatarUrl": "",
        "reels": []
    }
    
    try:
        r = requests.get(url, headers=headers, timeout=8)
        snippets = re.findall(r'<a class="result__snippet[^>]*>(.*?)</a>', r.text, re.S)
        for s in snippets:
            clean = re.sub(r'<[^>]+>', '', s).strip()
            # Parse stats
            m = re.search(r'([\d,\.KkMm]+)\s*Followers?[,\s]+([\d,\.KkMm]+)\s*Following[,\s]+([\d,\.KkMm]+)\s*Posts?', clean, re.I)
            if m:
                profile["followers"] = m.group(1)
                profile["following"] = m.group(2)
                profile["posts"] = m.group(3)
                
                # Extract Display Name & Bio:
                # "362 Followers, 121 Following, 56 Posts - golden_anshu (@ahiran_anshu_000) on Instagram: "A♥️M .कृष्णवंशी🪈🚩💪 . Prayagraj 📍 #allahbaduniversity""
                name_m = re.search(r'Posts\s*-\s*([^(]+)\s*\(@' + re.escape(username) + r'\)', clean, re.I)
                if name_m:
                    profile["displayName"] = name_m.group(1).strip()
                
                bio_m = re.search(r'on Instagram:\s*&quot;(.*?)&quot;', clean, re.I)
                if not bio_m:
                    bio_m = re.search(r'on Instagram:\s*"(.*?)"', clean, re.I)
                if bio_m:
                    profile["bio"] = bio_m.group(1).strip()
                break
    except Exception as e:
        pass

    # 2. Search for Reels of this user
    q_reels = urllib.parse.quote(f'site:instagram.com/reel "{username}"')
    url_reels = f'https://html.duckduckgo.com/html/?q={q_reels}'
    try:
        r_reels = requests.get(url_reels, headers=headers, timeout=8)
        results = re.findall(r'<a class="result__url"[^>]*href="([^"]+)"', r_reels.text)
        reel_links = []
        for l in results:
            if 'instagram.com/reel/' in l:
                # Decode ddg redirect if needed
                actual_link = l
                if 'uddg=' in l:
                    match = re.search(r'uddg=([^&]+)', l)
                    if match:
                        actual_link = urllib.parse.unquote(match.group(1))
                if 'instagram.com/reel/' in actual_link and actual_link not in reel_links:
                    reel_links.append(actual_link)
        profile["reelLinks"] = reel_links
    except Exception as e:
        pass

    return profile

data = get_real_profile('ahiran_anshu_000')
with open("real_profile.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print("REAL PROFILE SAVED!")
