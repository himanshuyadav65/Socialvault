# SocialVault — All-In-One Media Downloader & Forensic Intelligence Suite

SocialVault is a high-performance web platform built for vloggers, creators, and digital marketers to extract, analyze, and save high-definition media (Instagram, Facebook, and YouTube) with zero watermark and complete privacy.

---

## 🚀 Quick Start

### 1. Install Dependencies
`ash
npm install
`

### 2. Configure Environment (Optional)
Ensure your .env contains:
`env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=instatrack_db
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
`

### 3. Start the Server
`ash
npm start
`
Or:
`ash
node server.js
`
Open **http://localhost:3000** in your browser.

---

## 📁 Project Architecture

`
socialvault/
├── backend/                  # Server-side APIs & Services
│   ├── config/               # Database & environment configurations
│   ├── routes/               # API route handlers (analysis, auth, etc.)
│   ├── services/             # Media extraction & scraper helpers
│   ├── server.js             # Primary Express application server
│   └── socialvault_db.sql    # Database schema & setup script
│
├── frontend/                 # Client-Side Application
│   ├── assets/               # High-res frames, showcases, and icons
│   ├── index.html            # Main platform homepage & suites
│   ├── reel-downloader.html  # Instagram Reel Downloader
│   ├── hashtag-scraper.html  # Instagram Hashtag Scraper
│   ├── comment-scraper.html  # Instagram Comment Scraper
│   ├── facebook-scraper.html # Facebook Hashtag Scraper
│   ├── facebook-reel-downloader.html # Facebook Post & Reel Downloader
│   ├── youtube-video-downloader.html # YouTube 4K & MP3 Downloader
│   ├── youtube-shorts-downloader.html # YouTube Shorts 60fps Downloader
│   ├── youtube-thumbnail-downloader.html # YouTube 4K Thumbnail Saver
│   ├── faq.html              # Frequently Asked Questions
│   ├── features.html         # All Features directory
│   ├── pricing.html          # Pricing & access plans
│   ├── style.css             # Unified CSS Design System
│   └── auth-shared.js        # Google Auth & Theme toggle engine
│
├── package.json              # Project dependencies & scripts
├── server.js                 # Root entrypoint delegating to backend/server.js
└── README.md                 # Project documentation
`

---

## ✨ Features Included

- **Instagram Creator Suite**:
  - Full HD 1080p Instagram Reels & Post Downloader
  - Story & Highlights extraction
  - Hashtag Reach & Competitor Analytics Scraper
  - Public Comment & Sentiment Scraper
- **Facebook Creator Suite**:
  - Facebook Reel & Watch video downloader (MP4 1080p)
  - Facebook Hashtag trend explorer
  - Facebook Story downloader
- **YouTube Creator Suite**:
  - YouTube 4K & 1080p Video Downloader with 320kbps MP3 audio conversion
  - YouTube Shorts Downloader (60fps vertical video)
  - YouTube Thumbnail Downloader (HQ / 4K JPG)
- **Design & Performance**:
  - Dynamic Dual-Theme Engine (Light Mode & Dark Mode)
  - Ambient Vlogger Glow background aesthetics
  - Animated Ken-Burns video showcases on all tool cards
  - Real user reviews & testimonials grid
  - Responsive mobile-first layout

---

## 🔒 License & Credits
Developed for creators, digital marketers, and social media researchers.
© 2026 SocialVault Systems Inc. All rights reserved.
