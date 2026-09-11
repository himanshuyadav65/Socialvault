import os
import tempfile
import uvicorn
from typing import Optional, List, Any, Dict
from fastapi import FastAPI, HTTPException, Query, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
import yt_dlp
import requests

app = FastAPI(
    title="SocialVault Instagram Downloader API",
    description="Free Instagram Downloader Backend using yt-dlp & FastAPI",
    version="1.1.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DownloadRequest(BaseModel):
    url: str
    cookies: Optional[str] = None

class CookiesTextRequest(BaseModel):
    cookies: str

def prepare_cookie_file(cookies_input: Optional[str]) -> Optional[str]:
    """
    Parses either raw cookie string (e.g. sessionid=xxx; ds_user_id=yyy)
    or Netscape cookie file content and returns the file path.
    """
    if cookies_input and cookies_input.strip():
        cookie_str = cookies_input.strip()
        if "# Netscape HTTP Cookie File" in cookie_str or "\t" in cookie_str:
            content = cookie_str
        else:
            lines = ["# Netscape HTTP Cookie File", "# https://curl.haxx.se/rfc/cookie_spec.html", ""]
            parts = cookie_str.split(";")
            for p in parts:
                if "=" in p:
                    kv = p.strip().split("=", 1)
                    if len(kv) == 2:
                        name, val = kv
                        lines.append(f".instagram.com\tTRUE\t/\tTRUE\t2147483647\t{name.strip()}\t{val.strip()}")
            content = "\n".join(lines)
        
        temp_file = tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False, encoding='utf-8')
        temp_file.write(content)
        temp_file.close()
        return temp_file.name

    if os.path.exists("cookies.txt"):
        return os.path.abspath("cookies.txt")
    
    return None

def get_base_ydl_opts(custom_cookie_file: Optional[str] = None) -> dict:
    cookie_file = None
    if custom_cookie_file and os.path.exists(custom_cookie_file):
        cookie_file = custom_cookie_file
    elif os.path.exists("cookies.txt"):
        cookie_file = os.path.abspath("cookies.txt")

    opts = {
        'quiet': True,
        'no_warnings': True,
        'http_headers': {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9'
        }
    }

    if cookie_file:
        opts['cookiefile'] = cookie_file

    return opts

@app.get("/")
def read_root():
    has_cookies = os.path.exists("cookies.txt")
    return {
        "status": "online",
        "service": "SocialVault Instagram Downloader API (yt-dlp)",
        "version": "1.1.0",
        "has_cookies": has_cookies,
        "docs": "/docs"
    }

@app.get("/api/cookies-status")
def cookies_status():
    exists = os.path.exists("cookies.txt")
    size = os.path.getsize("cookies.txt") if exists else 0
    return {
        "status": "success",
        "has_cookies": exists,
        "size_bytes": size,
        "file_path": os.path.abspath("cookies.txt") if exists else None
    }

@app.post("/api/upload-cookies")
async def upload_cookies(file: UploadFile = File(...)):
    try:
        content = await file.read()
        text_content = content.decode("utf-8", errors="ignore")
        
        with open("cookies.txt", "w", encoding="utf-8") as f:
            f.write(text_content)
        
        return {
            "status": "success",
            "message": "cookies.txt uploaded and saved successfully! All 3 tools will now use this cookie file.",
            "size_bytes": len(content)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save cookies.txt: {str(e)}")

@app.post("/api/cookies-text")
def save_cookies_text(req: CookiesTextRequest):
    if not req.cookies or not req.cookies.strip():
        raise HTTPException(status_code=400, detail="Cookies text is empty.")
    
    temp_path = prepare_cookie_file(req.cookies)
    if temp_path and os.path.exists(temp_path):
        with open(temp_path, "r", encoding="utf-8") as src:
            content = src.read()
        with open("cookies.txt", "w", encoding="utf-8") as dst:
            dst.write(content)
        if tempfile.gettempdir() in temp_path:
            try:
                os.remove(temp_path)
            except Exception:
                pass

    return {
        "status": "success",
        "message": "cookies.txt saved successfully! All 3 tools will now use this cookie file."
    }

from services.yt_dlp_runner import extract as runner_extract

@app.post("/api/download")
def download_instagram_media(req: DownloadRequest):
    if not req.url or not req.url.strip():
        raise HTTPException(status_code=400, detail="Instagram URL is required.")

    target_url = req.url.strip()
    temp_cookie_file = prepare_cookie_file(req.cookies)

    try:
        data = runner_extract(target_url, temp_cookie_file)
        if data and data.get('status') == 'success':
            return data
        elif data and data.get('error'):
            return JSONResponse(status_code=400, content=data)
        else:
            raise Exception("Extractor returned empty response.")
    except Exception as e:
        err_msg = str(e)
        if "private" in err_msg.lower() or "login" in err_msg.lower() or "cookie" in err_msg.lower():
            return JSONResponse(
                status_code=403,
                content={
                    "status": "error",
                    "is_private": True,
                    "error": "🔒 Instagram Cookies Required: Instagram blocked this request. Please upload your cookies.txt file.",
                    "detail": err_msg
                }
            )
        return JSONResponse(
            status_code=400,
            content={
                "status": "error",
                "error": f"Failed to download media: {err_msg}",
                "detail": err_msg
            }
        )
    finally:
        if temp_cookie_file and tempfile.gettempdir() in temp_cookie_file and os.path.exists(temp_cookie_file):
            try:
                os.remove(temp_cookie_file)
            except Exception:
                pass

@app.get("/api/stream")
def stream_media(url: str = Query(...), filename: str = Query("instagram_media.mp4")):
    """
    Streams direct media file to client to bypass CORS / referrer checks when downloading.
    """
    try:
        is_jpg = filename.lower().endswith('.jpg') or filename.lower().endswith('.jpeg')
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Referer": "https://www.instagram.com/",
            "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8" if is_jpg else "*/*"
        }
        res = requests.get(url, headers=headers, stream=True, timeout=20)
        
        default_type = "image/jpeg" if is_jpg else "video/mp4"
        content_type = res.headers.get("content-type", default_type)
        
        return StreamingResponse(
            res.iter_content(chunk_size=65536),
            media_type=content_type,
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to stream media file: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
