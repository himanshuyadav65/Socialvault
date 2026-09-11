/**
 * Mock Database Service for SocialScope
 */

const mockProfiles = {
  "demo_user": {
    username: "demo_user",
    displayName: "Alex Rivera",
    bio: "Cybersecurity Analyst & Digital Forensics Enthusiast | 📍 SF, CA",
    followers: 12800,
    following: 684,
    posts: 247,
    accountType: "Public Verified Demo",
    profileScore: 87,
    activityLevel: "High",
    engagementLevel: "7.8%",
    content: { photos: 72, videos: 21, reels: 7 },
    device: { platform: "iOS 18.2 Demo Device", browser: "Safari Mobile Demo", session: "SIM-8F29A", location: "Demo Location — Mumbai, IN" }
  },
  "cyber_demo": {
    username: "cyber_demo",
    displayName: "Nova Cyber Systems",
    bio: "Simulated SOC Defense & Security Architecture Lab",
    followers: 48900,
    following: 312,
    posts: 532,
    accountType: "Public Organization",
    profileScore: 94,
    activityLevel: "Extreme",
    engagementLevel: "9.2%",
    content: { photos: 65, videos: 25, reels: 10 },
    device: { platform: "macOS Sonoma Demo", browser: "Chrome 131 Demo", session: "SIM-9C11D", location: "Demo Node — Bengaluru, IN" }
  }
};

function getProfile(username) {
  const clean = username.replace(/^@/, '').toLowerCase();
  if (clean === 'notfound' || clean === '404' || clean === 'ghost') {
    return null;
  }
  if (mockProfiles[clean]) {
    return mockProfiles[clean];
  }

  // Format real display name without (Simulated)
  const cleanParts = clean.replace(/([._]+)/g, ' ').trim().split(/\s+/);
  const formattedName = cleanParts.map(w => w ? w.charAt(0).toUpperCase() + w.slice(1) : '').join(' ') || (clean.charAt(0).toUpperCase() + clean.slice(1));
  const hash = Array.from(clean).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const initials = (cleanParts.length >= 2 ? (cleanParts[0][0] + cleanParts[1][0]) : clean.slice(0, 2)).toUpperCase();

  // Avatar fallback (high-res portrait or avatar service)
  const avatarUrl = `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80`;

  return {
    username: clean,
    displayName: formattedName,
    fullName: formattedName,
    avatarUrl: avatarUrl,
    initials: initials,
    trackingId: `TRK-${(hash * 17).toString(16).toUpperCase().padStart(5, "X")}-SEC-NODE`,
    size: `${(2.1 + (hash % 15) * 0.1).toFixed(1)} GB`,
    sessions: `${3 + (hash % 5)} sessions`,
    activeSessions: 3 + (hash % 5),
    linkedDevices: 2 + (hash % 3),
    ipAddresses: 4 + (hash % 7),
    cookies: 9 + (hash % 12),
    bio: `Digital profile for @${clean}`,
    followers: 4500 + (hash * 12),
    following: 280 + (hash % 150),
    posts: 42 + (hash % 80),
    accountType: "Public Profile",
    profileScore: 88,
    activityLevel: "High",
    engagementLevel: "7.2%",
    content: { photos: 60, videos: 18, reels: 9 },
    device: { platform: "Android 15 / iOS 18", browser: "Chrome Mobile", session: `SIM-${(hash * 13).toString(16).toUpperCase().slice(0, 5)}`, location: "Node — Delhi, IN" },
    isReal: true
  };
}

module.exports = {
  getProfile,
  mockProfiles
};
