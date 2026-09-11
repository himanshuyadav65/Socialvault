const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

function resolveRealProfile(username) {
  return new Promise((resolve) => {
    const cleanUser = username.replace(/^@/, '').trim();
    const scriptPath = path.join(__dirname, '..', 'test_search_ig.py');
    const pyScript = `
import requests, re, urllib.parse, json, sys

username = sys.argv[1] if len(sys.argv) > 1 else "${cleanUser}"
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'}
q = urllib.parse.quote(f'site:instagram.com "{username}"')
url = f'https://html.duckduckgo.com/html/?q={q}'

profile = {"found": False, "username": username, "displayName": username, "followers": "0", "following": "0", "posts": "0", "bio": ""}
try:
    r = requests.get(url, headers=headers, timeout=9)
    snippets = re.findall(r'<a class="result__snippet[^>]*>(.*?)</a>', r.text, re.S)
    for s in snippets:
        clean = re.sub(r'<[^>]+>', '', s).strip()
        m = re.search(r'([\\d,\\.KkMm]+)\\s*Followers?[,\\s]+([\\d,\\.KkMm]+)\\s*Following[,\\s]+([\\d,\\.KkMm]+)\\s*Posts?', clean, re.I)
        if m:
            profile["found"] = True
            profile["followers"] = m.group(1)
            profile["following"] = m.group(2)
            profile["posts"] = m.group(3)
            name_m = re.search(r'Posts\\s*-\\s*([^(]+)\\s*\\(@' + re.escape(username) + r'\\)', clean, re.I)
            if name_m:
                profile["displayName"] = name_m.group(1).strip()
            bio_m = re.search(r'on Instagram:\\s*&quot;(.*?)&quot;', clean, re.I)
            if not bio_m:
                bio_m = re.search(r'on Instagram:\\s*"(.*?)"', clean, re.I)
            if bio_m:
                profile["bio"] = bio_m.group(1).strip()
            break
except Exception as e:
    pass

print(json.dumps(profile, ensure_ascii=False))
`;

    const runnerFile = path.join(__dirname, `_dyn_search_${Date.now()}.py`);
    fs.writeFileSync(runnerFile, pyScript, 'utf-8');

    let pyPath = 'python';
    const specificPy = 'C:\\Users\\himanshu yadav\\AppData\\Local\\Programs\\Python\\Python311\\python.exe';
    if (fs.existsSync(specificPy)) pyPath = specificPy;

    execFile(pyPath, [runnerFile, cleanUser], { timeout: 12000, encoding: 'utf-8' }, (err, stdout) => {
      try { fs.unlinkSync(runnerFile); } catch(e) {}
      if (err || !stdout || !stdout.trim()) {
        return resolve(null);
      }
      try {
        const parsed = JSON.parse(stdout.trim());
        resolve(parsed.found ? parsed : null);
      } catch (e) {
        resolve(null);
      }
    });
  });
}

module.exports = { resolveRealProfile };
