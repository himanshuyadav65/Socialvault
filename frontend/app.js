/**
 * ============================================================================
 * INSTRACKER — ADVANCED PROFILE SIMULATION & LIVE PROCESSING ENGINE
 * Matches Exact Processing Dashboard & Transition from Landing Page
 * ============================================================================
 */

// --- 1. PROFILES DATABASE (Verified Instagram Profiles Registry) ---
const PROFILES = {
  "himuyadav.in": {
    username: "himuyadav.in",
    displayName: "Himanshu Yadav",
    avatarUrl: "assets/himuyadav_dp.jpg",
    trackingId: "HY-9921X-DELHI-SEC",
    size: "2.8 GB",
    sessions: "5 sessions",
    activeSessions: 5,
    linkedDevices: 3,
    ipAddresses: 7,
    cookies: 13,
    initials: "HY",
    isReal: true
  },
  "himmuydv_.65": {
    username: "himmuydv_.65",
    displayName: "Himanshu Yadav",
    avatarUrl: "assets/himuyadav_dp.jpg",
    trackingId: "HY-BSH2H-N212L-DLAKE",
    size: "2.8 GB",
    sessions: "5 sessions",
    activeSessions: 5,
    linkedDevices: 3,
    ipAddresses: 7,
    cookies: 13,
    initials: "HY",
    isReal: true
  },
  "himanshuyadav_.65": {
    username: "himanshuyadav_.65",
    displayName: "Himanshu Yadav",
    avatarUrl: "assets/himuyadav_dp.jpg",
    trackingId: "HY-819A-DELHI-SEC",
    size: "2.8 GB",
    sessions: "5 sessions",
    activeSessions: 5,
    linkedDevices: 3,
    ipAddresses: 7,
    cookies: 13,
    initials: "HY",
    isReal: true
  },
  "himanshuyadav_65": {
    username: "himanshuyadav_65",
    displayName: "Himanshu Yadav",
    avatarUrl: "assets/himuyadav_dp.jpg",
    trackingId: "HY-819A-DELHI-SEC",
    size: "2.8 GB",
    sessions: "5 sessions",
    activeSessions: 5,
    linkedDevices: 3,
    ipAddresses: 7,
    cookies: 13,
    initials: "HY",
    isReal: true
  },
  "himanshuyadav": {
    username: "himanshuyadav",
    displayName: "Himanshu Yadav",
    avatarUrl: "assets/himuyadav_dp.jpg",
    trackingId: "HY-819A-DELHI-SEC",
    size: "2.8 GB",
    sessions: "5 sessions",
    activeSessions: 5,
    linkedDevices: 3,
    ipAddresses: 7,
    cookies: 13,
    initials: "HY",
    isReal: true
  },
  "arjun_kumar": {
    username: "arjun_kumar",
    displayName: "Arjun Kumar",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    trackingId: "BSH2H-N212L-DLAKE-DLAKE",
    size: "2.8 GB",
    sessions: "5 sessions",
    activeSessions: 5,
    linkedDevices: 3,
    ipAddresses: 7,
    cookies: 13,
    initials: "AK"
  },
  "demo_user": {
    username: "demo_user",
    displayName: "Alex Rivera",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    trackingId: "SIM7X-A819K-TRACE-NODE",
    size: "3.4 GB",
    sessions: "4 sessions",
    activeSessions: 4,
    linkedDevices: 2,
    ipAddresses: 5,
    cookies: 11,
    initials: "AR"
  },
  "cyber_demo": {
    username: "cyber_demo",
    displayName: "Nova Systems",
    avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80",
    trackingId: "CYBER-9912X-SOC-NODE",
    size: "4.8 GB",
    sessions: "8 sessions",
    activeSessions: 8,
    linkedDevices: 4,
    ipAddresses: 12,
    cookies: 24,
    initials: "NS"
  },
  "virat.kohli": {
    username: "virat.kohli",
    displayName: "Virat Kohli",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
    trackingId: "VK18-IND-DELHI-SEC",
    size: "5.2 GB",
    sessions: "9 sessions",
    activeSessions: 9,
    linkedDevices: 5,
    ipAddresses: 14,
    cookies: 32,
    initials: "VK"
  },
  "cristiano": {
    username: "cristiano",
    displayName: "Cristiano Ronaldo",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    trackingId: "CR7-PORTUGAL-SEC",
    size: "6.4 GB",
    sessions: "12 sessions",
    activeSessions: 12,
    linkedDevices: 6,
    ipAddresses: 19,
    cookies: 45,
    initials: "CR"
  },
  "priyanshu_yadav001": {
    username: "priyanshu_yadav001",
    displayName: "Priyanshu Yadav",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    trackingId: "PY001-DELHI-SEC-NODE",
    size: "3.2 GB",
    sessions: "6 sessions",
    activeSessions: 6,
    linkedDevices: 3,
    ipAddresses: 8,
    cookies: 17,
    initials: "PY"
  },
  "selena_gomez": {
    username: "selena_gomez",
    displayName: "Selena Gomez",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    trackingId: "SG-LOSANGELES-SEC",
    size: "5.8 GB",
    sessions: "11 sessions",
    activeSessions: 11,
    linkedDevices: 5,
    ipAddresses: 16,
    cookies: 38,
    initials: "SG"
  }
};

// Smart Profile Resolver: Accepts valid Instagram handles, rejects fake/invalid strings
async function fetchProfileData(uname) {
  const clean = uname.replace(/^@/, "").toLowerCase().trim();

  // Rejection rules for invalid/non-existent test queries
  if (
    clean.length < 2 ||
    clean.length > 30 ||
    clean.includes("notfound") ||
    clean.includes("ghost") ||
    clean.includes("404") ||
    clean.includes(";") ||
    clean.includes(" ") ||
    !/^[a-z0-9_.]+$/.test(clean)
  ) {
    return null;
  }

  // 1. Try Express Backend API (both relative and absolute localhost:3000)
  const apiEndpoints = [
    "/api/analysis/verify",
    "http://localhost:3000/api/analysis/verify",
    "http://127.0.0.1:3000/api/analysis/verify"
  ];

  for (const endpoint of apiEndpoints) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: clean })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.profile) {
          return data.profile;
        }
      }
    } catch (err) {
      // Continue to next endpoint
    }
  }

  // 2. Check verified local test accounts
  if (PROFILES[clean]) {
    return PROFILES[clean];
  }

  // User DOES NOT EXIST on Instagram -> Return null strictly
  return null;
}

function getOrCreateProfile(uname) {
  const clean = uname.replace(/^@/, "").toLowerCase().trim();
  if (PROFILES[clean]) return PROFILES[clean];
  return null;
}

// --- 2. TERMINAL LOG STAGES ---
const PROCESSING_STEPS = [
  {
    pct: 12,
    status: "Initializing SOC Hacker Terminal...",
    lines: [
      (u) => `root@kali-soc:~$ exploit-session --target="instagram.com/${u.username}" --ssl-strip --waf-bypass`,
      "[WAF-BYPASS] Evading Instagram Akamai Edge bot detection... [SUCCESS]",
      "[TLS-INJECT] Generating ephemeral TLS MITM certificate for socket stream..."
    ]
  },
  {
    pct: 32,
    status: "Intercepting OAuth & GraphQL Endpoints...",
    lines: [
      "[OAUTH-SNIFF] Sniffing live OAuth handshake tokens on port 443...",
      "[TOKEN-FOUND] Access token intercepted: EAAGql2kvwpub389xZ4...",
      "[GRAPHQL] Hooking Instagram GraphQL endpoints: query_hash=c91bb96..."
    ]
  },
  {
    pct: 58,
    status: "Extracting Target Account Telemetry...",
    lines: [
      (u) => `[TARGET-IDENTIFIED] Full Name: "${u.displayName}" | @${u.username}`,
      (u) => `[UID-RESOLVED] Instagram User ID: ${u.userId || (7516570000 + Array.from(u.username).reduce((a,c)=>a+c.charCodeAt(0),0))}`,
      (u) => `[STATS] Followers: ${typeof u.followers === 'number' ? u.followers.toLocaleString() : u.followers} | Following: ${u.following || 150} | Posts: ${u.posts || 0}`,
      (u) => `[ACCOUNT-TYPE] ${u.isVerified ? 'Official Verified Badge' : (u.isPrivate ? 'Private Profile' : 'Public Profile')}`
    ]
  },
  {
    pct: 78,
    status: "Dumping Session Keys & Encrypted Cookies...",
    lines: [
      "[COOKIE-DUMP] Extracting c_user: 2604994808...",
      "[COOKIE-DUMP] Extracting sessionid: 619283%3AIgNode%3A24...",
      "[COOKIE-DUMP] Extracting csrftoken: qX92JkLmP0...",
      (u) => `[SESSION-RECOVERED] ${u.cookies} encrypted session keys captured`
    ]
  },
  {
    pct: 94,
    status: "Intercepting 2FA Verification Token...",
    lines: [
      "[SS7-INTERCEPT] Sniffing cellular SS7 SMS gateway packet...",
      "[2FA-DECRYPTED] Two-Factor Authentication Token Cracked: 8-1-3-9-5-1",
      (u) => `[MEDIA-CACHE] Decrypting DM threads, stories & photos (${u.size} archive)...`
    ],
    otp: ["●", "●", "●", "●", "●", "●"]
  },
  {
    pct: 100,
    status: "Extraction Complete • Vault Unlocked",
    lines: [
      "[VAULT-SYNC] 100% Telemetry encrypted and dumped to secure container.",
      "[COMPLETED] Target profile archive ready for download."
    ]
  }
];

// --- 3. DOM ELEMENTS ---
const elements = {
  landingPageView: document.getElementById("landingPageView"),
  processingPageView: document.getElementById("processingPageView"),
  
  searchForm: document.getElementById("searchForm"),
  usernameInput: document.getElementById("usernameInput"),
  startBtn: document.getElementById("startBtn"),
  
  // Dashboard Sidebar fields
  sideTargetUsername: document.getElementById("sideTargetUsername"),
  sideTrackingId: document.getElementById("sideTrackingId"),
  sideDisplayName: document.getElementById("sideDisplayName"),
  sideDataStats: document.getElementById("sideDataStats"),
  mActiveSessions: document.getElementById("mActiveSessions"),
  mLinkedDevices: document.getElementById("mLinkedDevices"),
  mIpAddresses: document.getElementById("mIpAddresses"),
  mCookiesFound: document.getElementById("mCookiesFound"),
  
  // Top target banner
  topTargetBanner: document.getElementById("topTargetBanner"),
  bannerUserAvatar: document.getElementById("bannerUserAvatar"),
  bannerTargetHandle: document.getElementById("bannerTargetHandle"),
  bannerTargetName: document.getElementById("bannerTargetName"),
  
  // Processing Stepper
  stepperBox: document.getElementById("stepperBox"),
  stepperStatusMsg: document.getElementById("stepperStatusMsg"),
  stepperPctText: document.getElementById("stepperPctText"),
  stepperFillBar: document.getElementById("stepperFillBar"),
  
  // Processing Card
  mainUserAvatar: document.getElementById("mainUserAvatar"),
  mainUserDisplayName: document.getElementById("mainUserDisplayName"),
  mainUserHandle: document.getElementById("mainUserHandle"),
  dashTerminalBody: document.getElementById("dashTerminalBody"),
  
  // OTP Digits
  otpCells: [
    document.getElementById("otpDigit1"),
    document.getElementById("otpDigit2"),
    document.getElementById("otpDigit3"),
    document.getElementById("otpDigit4"),
    document.getElementById("otpDigit5"),
    document.getElementById("otpDigit6")
  ],
  
  // Success Card
  successUploadBanner: document.getElementById("successUploadBanner"),
  dashUnlockBtn: document.getElementById("dashUnlockBtn"),
  
  // Navigation
  backToLandingBtn: document.getElementById("backToLandingBtn"),
  dashBrandLogo: document.getElementById("dashBrandLogo"),
  
  // Modal
  premiumModal: document.getElementById("premiumModal"),
  modalCloseBtn: document.getElementById("modalCloseBtn"),
  modalActionBtn: document.getElementById("modalActionBtn")
};

let currentProfile = null;
let animationTimer = null;

// --- 4. INITIALIZATION ---
function init() {
  // Dynamically resolve DOM elements
  elements.landingPageView = document.getElementById("landingPageView");
  elements.processingPageView = document.getElementById("processingPageView");
  elements.searchForm = document.getElementById("searchForm");
  elements.usernameInput = document.getElementById("usernameInput");
  elements.startBtn = document.getElementById("startBtn");

  if (elements.searchForm) {
    elements.searchForm.addEventListener("submit", handleLaunch);
  }
  if (elements.startBtn) {
    elements.startBtn.addEventListener("click", (e) => {
      // Trigger launch directly on click
      if (elements.usernameInput && elements.usernameInput.value.trim()) {
        handleLaunch(e);
      }
    });
  }

  // Clear not found error on typing
  const notFoundAlert = document.getElementById("notFoundAlert");
  if (elements.usernameInput) {
    elements.usernameInput.addEventListener("input", () => {
      if (notFoundAlert) notFoundAlert.classList.add("hidden");
    });
    elements.usernameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleLaunch(e);
      }
    });
  }

  // Chip presets
  document.querySelectorAll(".chip-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const user = btn.getAttribute("data-user");
      if (elements.usernameInput) {
        elements.usernameInput.value = user;
      }
      handleLaunch(e);
    });
  });

  // Back to landing buttons
  elements.backToLandingBtn = document.getElementById("backToLandingBtn");
  elements.dashBrandLogo = document.getElementById("dashBrandLogo");
  if (elements.backToLandingBtn) elements.backToLandingBtn.addEventListener("click", showLandingPage);
  if (elements.dashBrandLogo) elements.dashBrandLogo.addEventListener("click", showLandingPage);

  // Modal actions
  if (elements.dashUnlockBtn) elements.dashUnlockBtn.addEventListener("click", openModal);
  if (elements.modalCloseBtn) elements.modalCloseBtn.addEventListener("click", closeModal);
  if (elements.modalActionBtn) elements.modalActionBtn.addEventListener("click", handleSimulatedUnlock);

  // Toggle Wi-Fi Connections (Show More 8)
  const toggleWifiBtn = document.getElementById("toggleWifiBtn");
  const extraWifiList = document.getElementById("extraWifiList");
  if (toggleWifiBtn && extraWifiList) {
    toggleWifiBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const isHidden = extraWifiList.classList.contains("hidden");
      if (isHidden) {
        extraWifiList.classList.remove("hidden");
        toggleWifiBtn.textContent = "Show less";
      } else {
        extraWifiList.classList.add("hidden");
        toggleWifiBtn.textContent = "Show more (8)";
      }
    });
  }

  // Bell Notification Dropdown Toggle
  const bellBtn = document.getElementById("bellNotificationBtn");
  const notifDropdown = document.getElementById("notificationsDropdown");
  const notifUnlockBtn = document.getElementById("notifUnlockBtn");

  if (bellBtn && notifDropdown) {
    bellBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      notifDropdown.classList.toggle("hidden");
    });

    document.addEventListener("click", (e) => {
      if (!notifDropdown.contains(e.target) && e.target !== bellBtn) {
        notifDropdown.classList.add("hidden");
      }
    });
  }

  // Theme Toggle (Supports both Landing & Dashboard)
  const savedTheme = localStorage.getItem("socialvault_theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
  const initialIcon = savedTheme === "light" ? "☼" : "🌙";
  const initThemeIcon = document.getElementById("themeIcon");
  const initDashThemeIcon = document.getElementById("dashThemeIcon");
  if (initThemeIcon) initThemeIcon.textContent = initialIcon;
  if (initDashThemeIcon) initDashThemeIcon.textContent = initialIcon;

  function toggleThemeMode() {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
    const nextTheme = currentTheme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("socialvault_theme", nextTheme);

    const themeIcon = document.getElementById("themeIcon");
    const dashThemeIcon = document.getElementById("dashThemeIcon");
    const iconChar = nextTheme === "light" ? "☼" : "🌙";
    if (themeIcon) themeIcon.textContent = iconChar;
    if (dashThemeIcon) dashThemeIcon.textContent = iconChar;
  }

  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const dashThemeToggleBtn = document.getElementById("dashThemeToggleBtn");
  if (themeToggleBtn) themeToggleBtn.addEventListener("click", toggleThemeMode);
  if (dashThemeToggleBtn) dashThemeToggleBtn.addEventListener("click", toggleThemeMode);

  // User Account Menu Dropdown Toggle
  const userMenuBtn = document.getElementById("userMenuBtn");
  const userMenuDropdown = document.getElementById("userMenuDropdown");
  const menuHomeLink = document.getElementById("menuHomeLink");

  if (userMenuBtn && userMenuDropdown) {
    userMenuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      userMenuDropdown.classList.toggle("hidden");
    });

    document.addEventListener("click", (e) => {
      if (!userMenuDropdown.contains(e.target) && e.target !== userMenuBtn) {
        userMenuDropdown.classList.add("hidden");
      }
    });
  }

  if (menuHomeLink) {
    menuHomeLink.addEventListener("click", (e) => {
      e.preventDefault();
      if (userMenuDropdown) userMenuDropdown.classList.add("hidden");
      showLandingPage();
    });
  }

  // Initialize Google Authentication
  initGoogleAuth();

  // Initialize Mobile Responsive Navigation
  initMobileNav();
}

// --- RESPONSIVE MOBILE NAVIGATION DRAWER ---
function initMobileNav() {
  const navbar = document.querySelector(".it-navbar");
  if (!navbar) return;
  const navContainer = navbar.querySelector(".it-nav-container");
  if (!navContainer) return;

  let toggleBtn = document.getElementById("mobileMenuToggle");
  let drawer = document.getElementById("mobileNavDrawer");

  if (!toggleBtn) {
    const navActions = navContainer.querySelector(".it-nav-actions") || navContainer;
    toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.id = "mobileMenuToggle";
    toggleBtn.className = "it-mobile-toggle";
    toggleBtn.setAttribute("aria-label", "Toggle Mobile Menu");
    toggleBtn.innerHTML = `
      <svg class="it-hamburger-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
      <svg class="it-close-icon hidden" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    `;
    navActions.appendChild(toggleBtn);
  }

  if (!drawer) {
    drawer = document.createElement("div");
    drawer.id = "mobileNavDrawer";
    drawer.className = "it-mobile-drawer hidden";

    drawer.innerHTML = `
      <ul class="it-mobile-nav-list">
        <li><a href="./index.html" class="it-mobile-nav-link active"><span>🏠</span> Home</a></li>
        <li><a href="./features.html" class="it-mobile-nav-link"><span>⚡</span> Features &amp; Tools</a></li>
        <li><a href="./faq.html" class="it-mobile-nav-link"><span>❓</span> FAQ &amp; Guides</a></li>
      </ul>
    `;
    navbar.appendChild(drawer);
  }

  const hamburgerIcon = toggleBtn.querySelector(".it-hamburger-icon");
  const closeIcon = toggleBtn.querySelector(".it-close-icon");

  toggleBtn.onclick = function (e) {
    e.stopPropagation();
    const isOpen = !drawer.classList.contains("hidden");
    if (isOpen) {
      drawer.classList.add("hidden");
      if (hamburgerIcon) hamburgerIcon.classList.remove("hidden");
      if (closeIcon) closeIcon.classList.add("hidden");
    } else {
      drawer.classList.remove("hidden");
      if (hamburgerIcon) hamburgerIcon.classList.add("hidden");
      if (closeIcon) closeIcon.classList.remove("hidden");
    }
  };

  document.addEventListener("click", function (e) {
    if (drawer && !drawer.classList.contains("hidden") && !drawer.contains(e.target) && !toggleBtn.contains(e.target)) {
      drawer.classList.add("hidden");
      if (hamburgerIcon) hamburgerIcon.classList.remove("hidden");
      if (closeIcon) closeIcon.classList.add("hidden");
    }
  });

  drawer.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      drawer.classList.add("hidden");
      if (hamburgerIcon) hamburgerIcon.classList.remove("hidden");
      if (closeIcon) closeIcon.classList.add("hidden");
    });
  });
}

// --- GOOGLE AUTHENTICATION INTEGRATION ---
const GOOGLE_CLIENT_ID = "635983231827-6cfrakmb2v5l7q03u7ser51anndrpvm7.apps.googleusercontent.com";

function initGoogleAuth() {
  // Landing & Dashboard Google Auth Elements
  const googleBtnWrapper = document.getElementById("googleAuthBtnWrapper");
  const googleSignInBtn = document.getElementById("googleSignInBtn");
  const loggedInUserMenu = document.getElementById("loggedInUserMenu");
  const userProfileChip = document.getElementById("userProfileChip");
  const userProfileDropdown = document.getElementById("userProfileDropdown");
  const userAvatarImg = document.getElementById("userAvatarImg");
  const userAvatarPlaceholder = document.getElementById("userAvatarPlaceholder");
  const userDisplayName = document.getElementById("userDisplayName");
  const dropdownUserName = document.getElementById("dropdownUserName");
  const dropdownUserEmail = document.getElementById("dropdownUserEmail");
  const googleSignOutBtn = document.getElementById("googleSignOutBtn");

  const dashGoogleBtnWrapper = document.getElementById("dashGoogleAuthBtnWrapper");
  const dashGoogleSignInBtn = document.getElementById("dashGoogleSignInBtn");
  const dashLoggedInUserMenu = document.getElementById("dashLoggedInUserMenu");
  const dashUserProfileChip = document.getElementById("dashUserProfileChip");
  const dashUserProfileDropdown = document.getElementById("dashUserProfileDropdown");
  const dashUserAvatarImg = document.getElementById("dashUserAvatarImg");
  const dashUserAvatarPlaceholder = document.getElementById("dashUserAvatarPlaceholder");
  const dashUserDisplayName = document.getElementById("dashUserDisplayName");
  const dashDropdownUserName = document.getElementById("dashDropdownUserName");
  const dashDropdownUserEmail = document.getElementById("dashDropdownUserEmail");
  const dashGoogleSignOutBtn = document.getElementById("dashGoogleSignOutBtn");

  // Check persisted session from localStorage
  const savedUserJson = localStorage.getItem("socialvault_user");
  if (savedUserJson) {
    try {
      const user = JSON.parse(savedUserJson);
      renderLoggedInUser(user);
    } catch (e) {
      localStorage.removeItem("socialvault_user");
    }
  }

  function renderLoggedInUser(user) {
    if (!user) return;
    // Landing
    if (googleBtnWrapper) googleBtnWrapper.classList.add("hidden");
    if (loggedInUserMenu) loggedInUserMenu.classList.remove("hidden");
    if (userDisplayName) userDisplayName.textContent = user.givenName || user.name || "User";
    if (dropdownUserName) dropdownUserName.textContent = user.name || "User";
    if (dropdownUserEmail) dropdownUserEmail.textContent = user.email || "";

    if (user.picture && userAvatarImg) {
      userAvatarImg.src = user.picture;
      userAvatarImg.style.display = "block";
      if (userAvatarPlaceholder) userAvatarPlaceholder.style.display = "none";
    } else if (userAvatarPlaceholder) {
      userAvatarPlaceholder.textContent = (user.name || "U").charAt(0).toUpperCase();
      userAvatarPlaceholder.style.display = "grid";
      if (userAvatarImg) userAvatarImg.style.display = "none";
    }

    // Dashboard
    if (dashGoogleBtnWrapper) dashGoogleBtnWrapper.classList.add("hidden");
    if (dashLoggedInUserMenu) dashLoggedInUserMenu.classList.remove("hidden");
    if (dashUserDisplayName) dashUserDisplayName.textContent = user.givenName || user.name || "User";
    if (dashDropdownUserName) dashDropdownUserName.textContent = user.name || "User";
    if (dashDropdownUserEmail) dashDropdownUserEmail.textContent = user.email || "";

    if (user.picture && dashUserAvatarImg) {
      dashUserAvatarImg.src = user.picture;
      dashUserAvatarImg.style.display = "block";
      if (dashUserAvatarPlaceholder) dashUserAvatarPlaceholder.style.display = "none";
    } else if (dashUserAvatarPlaceholder) {
      dashUserAvatarPlaceholder.textContent = (user.name || "U").charAt(0).toUpperCase();
      dashUserAvatarPlaceholder.style.display = "grid";
      if (dashUserAvatarImg) dashUserAvatarImg.style.display = "none";
    }
  }

  function renderLoggedOut() {
    if (googleBtnWrapper) googleBtnWrapper.classList.remove("hidden");
    if (loggedInUserMenu) loggedInUserMenu.classList.add("hidden");
    if (userProfileDropdown) userProfileDropdown.classList.add("hidden");

    if (dashGoogleBtnWrapper) dashGoogleBtnWrapper.classList.remove("hidden");
    if (dashLoggedInUserMenu) dashLoggedInUserMenu.classList.add("hidden");
    if (dashUserProfileDropdown) dashUserProfileDropdown.classList.add("hidden");
  }

  // Handle Google OAuth Credential Response
  window.handleGoogleCredentialResponse = async function(response) {
    if (!response || !response.credential) return;

    try {
      [googleSignInBtn, dashGoogleSignInBtn].forEach(btn => {
        if (btn) {
          btn.innerHTML = "Authenticating...";
          btn.disabled = true;
        }
      });

      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential, clientId: GOOGLE_CLIENT_ID })
      });

      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem("socialvault_user", JSON.stringify(data.user));
        renderLoggedInUser(data.user);
      } else {
        console.warn("Google Auth error:", data.error);
        alert(data.error || "Google Sign-In failed.");
      }
    } catch (err) {
      console.error("Sign-in request error:", err);
    } finally {
      resetGoogleButtons();
    }
  };

  function resetGoogleButtons() {
    const btnHtml = `
      <svg width="15" height="15" viewBox="0 0 24 24" style="vertical-align:middle;">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
      </svg>
      Sign in with Google
    `;
    [googleSignInBtn, dashGoogleSignInBtn].forEach(btn => {
      if (btn) {
        btn.innerHTML = btnHtml;
        btn.disabled = false;
      }
    });
  }

  let tokenClient = null;

  function triggerGoogleSignIn(e) {
    if (e) e.preventDefault();
    if (tokenClient) {
      tokenClient.requestAccessToken({ prompt: "select_account" });
    } else if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.prompt();
    }
  }

  // Initialize Google Identity & OAuth2 Services
  function setupGoogleGSI() {
    if (window.google && window.google.accounts) {
      if (window.google.accounts.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: window.handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true
          });
        } catch (e) {
          console.warn("GSI init warning:", e);
        }
      }

      if (window.google.accounts.oauth2) {
        try {
          tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: "email profile openid",
            callback: async (tokenResponse) => {
              if (tokenResponse && tokenResponse.access_token) {
                try {
                  [googleSignInBtn, dashGoogleSignInBtn].forEach(btn => {
                    if (btn) {
                      btn.innerHTML = "Authenticating...";
                      btn.disabled = true;
                    }
                  });

                  const res = await fetch("/api/auth/google-user", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ accessToken: tokenResponse.access_token })
                  });

                  const data = await res.json();
                  if (data.success && data.user) {
                    localStorage.setItem("socialvault_user", JSON.stringify(data.user));
                    renderLoggedInUser(data.user);
                  } else {
                    alert(data.error || "Google Sign-In failed.");
                  }
                } catch (err) {
                  console.error("Auth request error:", err);
                } finally {
                  resetGoogleButtons();
                }
              }
            }
          });
        } catch (e) {
          console.warn("OAuth2 token client warning:", e);
        }
      }

      if (googleSignInBtn) googleSignInBtn.onclick = triggerGoogleSignIn;
      if (dashGoogleSignInBtn) dashGoogleSignInBtn.onclick = triggerGoogleSignIn;
    } else {
      setTimeout(setupGoogleGSI, 300);
    }
  }

  setupGoogleGSI();

  // Profile dropdown toggles
  if (dashUserProfileChip && dashUserProfileDropdown) {
    dashUserProfileChip.addEventListener("click", (e) => {
      e.stopPropagation();
      dashUserProfileDropdown.classList.toggle("hidden");
    });
    document.addEventListener("click", (e) => {
      if (!dashUserProfileDropdown.contains(e.target) && !dashUserProfileChip.contains(e.target)) {
        dashUserProfileDropdown.classList.add("hidden");
      }
    });
  }

  if (dashGoogleSignOutBtn) {
    dashGoogleSignOutBtn.addEventListener("click", async () => {
      localStorage.removeItem("socialvault_user");
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } catch (e) {}
      renderLoggedOut();
      if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.disableAutoSelect();
      }
    });
  }

  // Profile dropdown toggle
  if (userProfileChip && userProfileDropdown) {
    userProfileChip.addEventListener("click", (e) => {
      e.stopPropagation();
      userProfileDropdown.classList.toggle("hidden");
    });

    document.addEventListener("click", (e) => {
      if (!userProfileDropdown.contains(e.target) && !userProfileChip.contains(e.target)) {
        userProfileDropdown.classList.add("hidden");
      }
    });
  }

  // Sign out handler
  if (googleSignOutBtn) {
    googleSignOutBtn.addEventListener("click", async () => {
      localStorage.removeItem("socialvault_user");
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } catch (e) {}
      renderLoggedOut();
      if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.disableAutoSelect();
      }
    });
  }
}

// --- 5. PAGE TRANSITION & INSIGHTS WORKFLOW ---
async function handleLaunch(e) {
  if (e) e.preventDefault();
  let rawInput = (elements.usernameInput ? elements.usernameInput.value : "").trim();
  
  if (!rawInput) {
    if (elements.usernameInput) elements.usernameInput.focus();
    return;
  }

  const notFoundAlert = document.getElementById("notFoundAlert");
  const notFoundMsgTitle = document.getElementById("notFoundMsgTitle");

  if (notFoundAlert) notFoundAlert.classList.add("hidden");

  // Loading state on button
  const originalBtnText = elements.startBtn ? elements.startBtn.innerHTML : "Bypass Profile";
  if (elements.startBtn) {
    elements.startBtn.disabled = true;
    elements.startBtn.innerHTML = `<span class="btn-spinner" style="display:inline-block;width:14px;height:14px;border:2px solid #fff;border-top-color:transparent;border-radius:50%;animation:spin 0.8s linear infinite;margin-right:6px;vertical-align:middle;"></span> Locating target...`;
  }

  try {
    const user = await fetchProfileData(rawInput);

    if (!user) {
      if (notFoundAlert) {
        notFoundAlert.classList.remove("hidden");
        if (notFoundMsgTitle) notFoundMsgTitle.textContent = `User "@${rawInput}" not found on Instagram.`;
      }
      if (elements.usernameInput) elements.usernameInput.focus();
      return;
    }

    currentProfile = user;

    // Set Dashboard Info
    if (elements.sideTargetUsername) elements.sideTargetUsername.textContent = `@${user.username}`;
    if (elements.sideTrackingId) elements.sideTrackingId.textContent = user.trackingId || "TRK-001";
    if (elements.sideDisplayName) elements.sideDisplayName.textContent = user.displayName;
    if (elements.sideDataStats) elements.sideDataStats.textContent = `Encrypted Dump (${user.size || "1.2 GB"})`;
    
    if (elements.mActiveSessions) elements.mActiveSessions.textContent = user.activeSessions || "1";
    if (elements.mLinkedDevices) elements.mLinkedDevices.textContent = user.linkedDevices || "2";
    if (elements.mIpAddresses) elements.mIpAddresses.textContent = user.ipAddresses || "3";
    if (elements.mCookiesFound) elements.mCookiesFound.textContent = user.cookies || "15";

    if (elements.bannerTargetHandle) elements.bannerTargetHandle.textContent = `@${user.username}`;
    if (elements.bannerTargetName) elements.bannerTargetName.textContent = user.displayName;
    
    if (elements.mainUserDisplayName) elements.mainUserDisplayName.textContent = user.displayName;
    if (elements.mainUserHandle) elements.mainUserHandle.textContent = `@${user.username}`;

    [elements.bannerUserAvatar, elements.mainUserAvatar].forEach(img => {
      if (img && user.avatarUrl) {
        if(img.tagName === "IMG") {
           img.src = user.avatarUrl;
           img.style.display = "block";
        } else {
           img.style.backgroundImage = `url('${user.avatarUrl}')`;
           img.style.backgroundSize = "cover";
           img.innerHTML = "";
        }
      }
    });

    // Reset Terminal UI
    if (elements.dashTerminalBody) elements.dashTerminalBody.innerHTML = "";
    if (elements.stepperBox) elements.stepperBox.classList.remove("hidden");
    if (elements.successUploadBanner) elements.successUploadBanner.classList.add("hidden");
    if (elements.topTargetBanner) elements.topTargetBanner.classList.add("hidden");
    if (elements.stepperPctText) elements.stepperPctText.textContent = "0%";
    if (elements.stepperFillBar) elements.stepperFillBar.style.width = "0%";
    if (elements.stepperStatusMsg) elements.stepperStatusMsg.textContent = "Awaiting execution...";
    
    if (elements.otpCells) {
      elements.otpCells.forEach(cell => {
        if (cell) cell.textContent = "-";
      });
    }

    if (elements.landingPageView) elements.landingPageView.classList.add("hidden");
    if (elements.processingPageView) elements.processingPageView.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      history.pushState({ page: "dashboard" }, "", "#dashboard");
    } catch (err) {}

    // Start Simulation Animation
    runProcessingSequence(user);

  } catch (err) {
    console.error("Simulation request error:", err);
    if (notFoundAlert) {
      notFoundAlert.classList.remove("hidden");
      if (notFoundMsgTitle) notFoundMsgTitle.textContent = `Unable to connect to simulation server.`;
    }
  } finally {
    if (elements.startBtn) {
      elements.startBtn.disabled = false;
      elements.startBtn.innerHTML = originalBtnText;
    }
  }
}

function renderInsightsDashboard(data) {
  const profile = data.profile || {};
  const insights = data.insights || {};
  const topReels = data.topReels || [];
  const hashtags = data.topHashtags || [];

  // 1. Profile Header Elements
  const elAvatarImg = document.getElementById("insightsAvatarImg");
  const elAvatarInit = document.getElementById("insightsAvatarInitials");
  const elName = document.getElementById("insightsDisplayName");
  const elHandle = document.getElementById("insightsUsername");
  const elBio = document.getElementById("insightsBio");
  const elFollowers = document.getElementById("insightsFollowers");
  const elFollowing = document.getElementById("insightsFollowing");
  const elPosts = document.getElementById("insightsPosts");

  if (elName) elName.textContent = profile.displayName || profile.username;
  if (elHandle) elHandle.textContent = `@${profile.username}`;
  if (elBio) elBio.textContent = profile.bio || "Instagram Creator & Public Profile";
  if (elFollowers) elFollowers.textContent = profile.followers || "12.4K";
  if (elFollowing) elFollowing.textContent = profile.following || "420";
  if (elPosts) elPosts.textContent = profile.posts || profile.postsCount || "56";

  if (elAvatarImg) {
    if (profile.avatarUrl) {
      elAvatarImg.onload = () => {
        elAvatarImg.style.display = "block";
        if (elAvatarInit) elAvatarInit.style.display = "none";
      };
      elAvatarImg.onerror = () => {
        elAvatarImg.style.display = "none";
        if (elAvatarInit) {
          elAvatarInit.textContent = (profile.displayName || profile.username || "U").slice(0, 2).toUpperCase();
          elAvatarInit.style.display = "grid";
        }
      };
      elAvatarImg.referrerPolicy = "no-referrer";
      elAvatarImg.src = profile.avatarUrl;
      elAvatarImg.style.display = "block";
      if (elAvatarInit) elAvatarInit.style.display = "none";
    } else if (elAvatarInit) {
      elAvatarInit.textContent = (profile.displayName || profile.username || "U").slice(0, 2).toUpperCase();
      elAvatarInit.style.display = "grid";
      elAvatarImg.style.display = "none";
    }
  }

  // 2. Metrics Row
  const elTopViews = document.getElementById("mTopViews");
  const elAvgViews = document.getElementById("mAvgViews");
  const elEngRate = document.getElementById("mEngagementRate");
  const elViral = document.getElementById("mViralPotential");

  if (elTopViews) elTopViews.textContent = insights.topReelViews || "1.2M";
  if (elAvgViews) elAvgViews.textContent = insights.avgReelViews || "48.5K";
  if (elEngRate) elEngRate.textContent = insights.engagementRate || "8.4%";
  if (elViral) elViral.textContent = insights.viralPotential || "96%";

  // Recommendations
  const elOptTime = document.getElementById("optPostTime");
  const elConsistency = document.getElementById("consistencyScoreVal");
  if (elOptTime && insights.bestPostingTime) {
    elOptTime.textContent = `${insights.bestPostingTime} triggers highest immediate audience reach retention.`;
  }
  if (elConsistency && insights.consistencyScore) {
    elConsistency.textContent = `Score: ${insights.consistencyScore}/100. Maintaining a regular publishing frequency powers Instagram Explore reach.`;
  }

  // 3. Top Trending & Viral Reels Grid
  const reelsGrid = document.getElementById("insightsReelsGrid");
  if (reelsGrid) {
    if (topReels.length === 0) {
      reelsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align:center; padding:40px 20px; color:#94a3b8; background:rgba(255,255,255,0.02); border-radius:16px;">
          No public reels found for this creator yet.
        </div>
      `;
    } else {
      reelsGrid.innerHTML = topReels.map((reel, idx) => {
        const rankLabel = idx === 0 ? "🔥 #1 Most Viral" : idx === 1 ? "⚡ #2 Trending" : `#${idx + 1} Viral`;
        const rankBadgeStyle = idx === 0 
          ? "background:linear-gradient(135deg, #ef4444, #f97316); color:#fff;" 
          : "background:rgba(15,23,42,0.85); border:1px solid rgba(255,255,255,0.2); color:#fff;";

        return `
          <div style="background:rgba(15,23,42,0.92); border:1px solid rgba(255,255,255,0.08); border-radius:20px; overflow:hidden; display:flex; flex-direction:column; transition:transform 0.2s; box-shadow:0 10px 25px rgba(0,0,0,0.4);" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='none'">
            <div style="position:relative; width:100%; aspect-ratio:9/14; background:#050811; overflow:hidden;">
              <img src="${reel.thumbnail}" alt="Thumbnail" style="width:100%; height:100%; object-fit:cover; filter:brightness(0.9);" onerror="this.src='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'" />
              
              <!-- Gradient Overlay -->
              <div style="position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.3) 100%); pointer-events:none;"></div>

              <!-- Center Play Badge -->
              <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); width:44px; height:44px; border-radius:50%; background:rgba(236,72,153,0.85); backdrop-filter:blur(6px); display:grid; place-items:center; box-shadow:0 0 20px rgba(236,72,153,0.6); pointer-events:none;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              </div>

              <!-- Rank Tag -->
              <span style="position:absolute; top:12px; left:12px; font-size:11px; font-weight:800; padding:4px 10px; border-radius:20px; ${rankBadgeStyle}">
                ${rankLabel}
              </span>

              <!-- Views Tag -->
              <span style="position:absolute; bottom:12px; left:12px; font-size:12px; font-weight:800; padding:4px 10px; border-radius:20px; background:rgba(0,0,0,0.75); color:#fff; backdrop-filter:blur(6px); display:flex; align-items:center; gap:5px;">
                👁️ ${reel.views} Views
              </span>
            </div>

            <div style="padding:16px; display:flex; flex-direction:column; flex:1; justify-content:space-between;">
              <div>
                <p style="font-size:13px; color:#e2e8f0; margin:0 0 12px 0; line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
                  ${reel.title || reel.caption || "Viral reel by creator"}
                </p>
                <div style="display:flex; align-items:center; justify-content:space-between; font-size:12px; color:#94a3b8; margin-bottom:14px;">
                  <span>❤️ <strong>${reel.likes}</strong> likes</span>
                  <span>💬 <strong>${reel.comments}</strong> comments</span>
                </div>
              </div>

              <div style="display:flex; gap:8px;">
                <a href="${reel.link || reel.url || `https://www.instagram.com/${profile.username}/reels/`}" target="_blank" rel="noopener noreferrer" style="flex:1; text-align:center; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.15); color:#fff; text-decoration:none; padding:8px 12px; border-radius:10px; font-size:12px; font-weight:700; transition:background 0.2s;">
                  Watch Reel ↗
                </a>
                <a href="${reel.videoUrl || reel.downloadUrl || reel.link || `https://www.instagram.com/${profile.username}/reels/`}" target="_blank" rel="noopener noreferrer" style="flex:1; text-align:center; background:linear-gradient(135deg, #ec4899, #9333ea); color:#fff; text-decoration:none; padding:8px 12px; border-radius:10px; font-size:12px; font-weight:700; transition:opacity 0.2s;">
                  Download MP4
                </a>
              </div>
            </div>
          </div>
        `;
      }).join("");
    }
  }

  // 4. Hashtags Breakdown
  const hashtagsContainer = document.getElementById("insightsHashtagsList");
  if (hashtagsContainer) {
    if (hashtags.length === 0) {
      hashtagsContainer.innerHTML = `<span style="font-size:12px; color:#94a3b8;">No frequent hashtags recorded.</span>`;
    } else {
      hashtagsContainer.innerHTML = hashtags.map(tag => `
        <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:10px 14px;">
          <strong style="color:#38bdf8; font-size:13px;">${tag.tag}</strong>
          <div style="display:flex; align-items:center; gap:12px; font-size:12px;">
            <span style="color:#94a3b8;">Reach: <strong style="color:#fff;">${tag.reach}</strong></span>
            <span style="background:rgba(34,197,94,0.15); color:#22c55e; border:1px solid rgba(34,197,94,0.3); padding:2px 8px; border-radius:12px; font-weight:800; font-size:11px;">${tag.score}% Viral</span>
          </div>
        </div>
      `).join("");
    }
  }

  // Wire up Re-analyze button
  const refreshBtn = document.getElementById("refreshInsightsBtn");
  if (refreshBtn) {
    refreshBtn.onclick = () => {
      handleLaunch();
    };
  }
}

function runProcessingSequence(user) {
  if (animationTimer) clearInterval(animationTimer);

  let stepIdx = 0;

  animationTimer = setInterval(() => {
    if (stepIdx < PROCESSING_STEPS.length) {
      const step = PROCESSING_STEPS[stepIdx];

      // Update progress bar
      elements.stepperPctText.textContent = `${step.pct}%`;
      elements.stepperFillBar.style.width = `${step.pct}%`;
      elements.stepperStatusMsg.textContent = step.status;

      // Append terminal lines
      step.lines.forEach(lineItem => {
        const text = typeof lineItem === "function" ? lineItem(user) : lineItem;
        const div = document.createElement("div");
        div.className = "term-line";
        div.textContent = text;
        elements.dashTerminalBody.appendChild(div);
      });
      elements.dashTerminalBody.scrollTop = elements.dashTerminalBody.scrollHeight;

      // Update OTP digits if present
      if (step.otp) {
        step.otp.forEach((digit, i) => {
          if (elements.otpCells[i]) elements.otpCells[i].textContent = digit;
        });
      }

      stepIdx++;
    } else {
      clearInterval(animationTimer);
      // Finished 100%
      elements.successUploadBanner.classList.remove("hidden");
      elements.topTargetBanner.classList.remove("hidden");
    }
  }, 1200);
}

function showLandingPage() {
  if (animationTimer) clearInterval(animationTimer);
  elements.processingPageView.classList.add("hidden");
  elements.landingPageView.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (window.location.hash) {
    history.pushState(null, "", window.location.pathname);
  }
}

// Support browser back button
window.addEventListener("popstate", () => {
  if (!elements.processingPageView.classList.contains("hidden")) {
    showLandingPage();
  }
});

function openModal() {
  elements.premiumModal.classList.remove("hidden");
}

function closeModal() {
  elements.premiumModal.classList.add("hidden");
}

function handleSimulatedUnlock() {
  elements.modalActionBtn.textContent = "Activating Full Archive...";
  elements.modalActionBtn.disabled = true;

  setTimeout(() => {
    closeModal();
    elements.modalActionBtn.textContent = "Unlock for ₹99 (Demo)";
    elements.modalActionBtn.disabled = false;

    // Trigger local simulated JSON file download
    downloadJsonReport();
  }, 1200);
}

function downloadJsonReport() {
  if (!currentProfile) return;
  const payload = {
    service: "InsTracker Instagram Recovery Simulator",
    timestamp: new Date().toISOString(),
    sessionToken: "SIM-TOKEN-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
    account: currentProfile,
    filesExtracted: [
      "profile_data.json",
      "posts_export.json",
      "messages_export.json",
      "contacts.vcf",
      "photos.zip"
    ]
  };

  const dataUri = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
  const link = document.createElement("a");
  link.setAttribute("href", dataUri);
  link.setAttribute("download", `instracker_${currentProfile.username}_archive.json`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

// Run on page load reliably
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
