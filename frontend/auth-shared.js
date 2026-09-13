/**
 * SocialVault Shared Authentication & Simple 2-Theme System (Dark 🌙 & Light ☀️)
 */

(function () {
  const GOOGLE_CLIENT_ID = "635983231827-6cfrakmb2v5l7q03u7ser51anndrpvm7.apps.googleusercontent.com";
  const USER_STORAGE_KEY = "socialvault_user";
  const THEME_STORAGE_KEY = "socialvault_theme";

  // --- 1. SIMPLE 2-THEME SYSTEM (DARK & LIGHT) ---
  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || "dark";
    applyTheme(savedTheme === "light" ? "light" : "dark");

    const themeToggleBtns = document.querySelectorAll("#themeToggleBtn, #dashThemeToggleBtn, .it-theme-toggle-btn");
    themeToggleBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const current = document.documentElement.getAttribute("data-theme") || "dark";
        const next = current === "light" ? "dark" : "light";
        applyTheme(next);
      });
    });
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);

    const icons = document.querySelectorAll("#themeIcon, #dashThemeIcon");
    const iconChar = theme === "light" ? "☼" : "🌙";
    icons.forEach((ic) => {
      ic.textContent = iconChar;
    });

    const themeButtons = document.querySelectorAll("#themeToggleBtn, #dashThemeToggleBtn, .it-theme-toggle-btn");
    themeButtons.forEach((btn) => {
      btn.title = theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode";
    });
  }

  // --- 2. GOOGLE AUTH & USER SESSION ---
  function initAuth() {
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

    // Restore saved session
    const savedUserJson = localStorage.getItem(USER_STORAGE_KEY);
    if (savedUserJson) {
      try {
        const user = JSON.parse(savedUserJson);
        renderLoggedInUser(user);
      } catch (e) {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }

    function renderLoggedInUser(user) {
      if (!user) return;
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
    }

    function renderLoggedOut() {
      if (googleBtnWrapper) googleBtnWrapper.classList.remove("hidden");
      if (loggedInUserMenu) loggedInUserMenu.classList.add("hidden");
      if (userProfileDropdown) userProfileDropdown.classList.add("hidden");
    }

    // Handle credential response
    window.handleGoogleCredentialResponse = async function (response) {
      if (!response || !response.credential) return;

      try {
        if (googleSignInBtn) {
          googleSignInBtn.innerHTML = "Authenticating...";
          googleSignInBtn.disabled = true;
        }

        const res = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: response.credential, clientId: GOOGLE_CLIENT_ID }),
        });

        const data = await res.json();
        if (data.success && data.user) {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
          renderLoggedInUser(data.user);
        } else {
          alert(data.error || "Google Sign-In failed.");
        }
      } catch (err) {
        console.error("Sign-in request error:", err);
      } finally {
        resetGoogleBtnText();
      }
    };

    let tokenClient = null;

    function resetGoogleBtnText() {
      if (googleSignInBtn) {
        googleSignInBtn.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" style="vertical-align:middle;">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          Sign in with Google
        `;
        googleSignInBtn.disabled = false;
      }
    }

    function setupGoogleGSI() {
      if (window.google && window.google.accounts) {
        if (window.google.accounts.id) {
          try {
            window.google.accounts.id.initialize({
              client_id: GOOGLE_CLIENT_ID,
              callback: window.handleGoogleCredentialResponse,
              auto_select: false,
              cancel_on_tap_outside: true,
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
                    if (googleSignInBtn) {
                      googleSignInBtn.innerHTML = "Authenticating...";
                      googleSignInBtn.disabled = true;
                    }

                    const res = await fetch("/api/auth/google-user", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ accessToken: tokenResponse.access_token }),
                    });

                    const data = await res.json();
                    if (data.success && data.user) {
                      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
                      renderLoggedInUser(data.user);
                    } else {
                      alert(data.error || "Google Sign-In failed.");
                    }
                  } catch (err) {
                    console.error("Auth request error:", err);
                  } finally {
                    resetGoogleBtnText();
                  }
                }
              },
            });
          } catch (e) {
            console.warn("OAuth2 token client warning:", e);
          }
        }

        if (googleSignInBtn) {
          googleSignInBtn.onclick = function (e) {
            e.preventDefault();
            if (tokenClient) {
              tokenClient.requestAccessToken({ prompt: "select_account" });
            } else if (window.google && window.google.accounts && window.google.accounts.id) {
              window.google.accounts.id.prompt();
            }
          };
        }
      } else {
        setTimeout(setupGoogleGSI, 300);
      }
    }

    setupGoogleGSI();

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
        localStorage.removeItem(USER_STORAGE_KEY);
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

  // --- 3. RESPONSIVE MOBILE NAVIGATION DRAWER ---
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

      const currentPath = window.location.pathname.toLowerCase();
      const isHome = currentPath.endsWith("index.html") || currentPath === "/" || currentPath === "" || currentPath.endsWith("/");
      const isFeatures = currentPath.includes("features.html");
      const isFaq = currentPath.includes("faq.html");

      drawer.innerHTML = `
        <ul class="it-mobile-nav-list">
          <li><a href="./index.html" class="it-mobile-nav-link ${isHome ? 'active' : ''}"><span>🏠</span> Home</a></li>
          <li><a href="./features.html" class="it-mobile-nav-link ${isFeatures ? 'active' : ''}"><span>⚡</span> Features &amp; Tools</a></li>
          <li><a href="./faq.html" class="it-mobile-nav-link ${isFaq ? 'active' : ''}"><span>❓</span> FAQ &amp; Guides</a></li>
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

  // Run on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initTheme();
      initAuth();
      initMobileNav();
    });
  } else {
    initTheme();
    initAuth();
    initMobileNav();
  }
})();
