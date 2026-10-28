# 🎵 Flipkart Music (VIP Studio Audio)

A modern, high-fidelity music streaming web application inspired by Spotify and YouTube Music, featuring real-time JioSaavn audio streaming, smooth seeking controls, verified email OTP authentication, and role-based authorization.

---

## ✨ Features

- **🎧 High-Fidelity Audio Streaming:**
  - Dynamic 320kbps / 160kbps audio bitrate selector.
  - Zero-jitter smooth audio seeking with dedicated scrubbing state.
  - Quick ±10s fast-forward / rewind controls and interactive volume slider.
  - Fullscreen expanded player modal with synchronized lyrics and queue display.

- **🏠 Modern Dashboard & Home Feed:**
  - Spotify-style greeting header and interactive mood chips (*Trending Hits, Bollywood Romance, Punjabi Pop, Workout Hype*).
  - Quick 6-tile jump-back grid for recently played tracks.
  - Dynamic spotlight hero banner highlighting top releases.
  - Today's Top 10 Indian Charts, Daily Mixes, and Popular Artists.

- **🔐 Authentication & Security:**
  - 6-digit OTP email verification gateway.
  - Interactive simulated Webmail Client (Gmail/Outlook style inbox) displaying official Flipkart Security emails.
  - Brute-force protection: 3 failed OTP attempts triggers a 60-second cooldown lockout.
  - Persistent user sessions via `localStorage`.

- **🛡️ Authorization & Privacy Controls:**
  - **Authorization (Entitlements):** Displays VIP Studio privileges (*320kbps HD Audio, Unlimited Skips, Zero Ads*).
  - **Security Tab:** Active session monitoring (device, OS, IP address, last active timestamp).
  - **Privacy Tab:** Private listening mode (incognito playback), history tracking toggles, and GDPR-compliant data export.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite 8, Vanilla CSS3 (Custom Design System, Dark Mode & Glassmorphism)
- **Audio Engine:** HTML5 Audio API with custom buffering & seek-stutter mitigation
- **Data & Streaming:** JioSaavn API endpoints with local catalog fallback
- **State Management:** React Context API (`PlayerContext`, `AuthContext`)
- **Deployment:** Vercel / Netlify ready with reverse-proxy rewrites (`vercel.json`, `public/_redirects`)

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/001tusharkardam/Filpkart-music.git
cd Filpkart-music
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```

### 4. Build for production
```bash
npm run build
```

---

## 📁 Project Structure

```
flipkart-music/
├── public/                 # Static assets & Netlify redirects
├── src/
│   ├── assets/             # Icons & media assets
│   ├── components/         # Reusable UI components
│   │   ├── AuthScreen.jsx        # Login & OTP verification screen
│   │   ├── EmailInboxModal.jsx   # Simulated webmail client modal
│   │   ├── ExpandedPlayer.jsx    # Fullscreen player with lyrics & queue
│   │   ├── HomeFeed.jsx          # Spotify-style curated home feed
│   │   ├── Navbar.jsx            # Header with search, profile & notifications
│   │   ├── PlayerBar.jsx         # Bottom audio player bar with scrubber
│   │   ├── ProfileModal.jsx      # User profile, authorization & privacy tabs
│   │   ├── Sidebar.jsx           # Navigation sidebar & playlists
│   │   └── SongList.jsx          # Search results grid & track cards
│   ├── context/            # React context providers
│   │   ├── AuthContext.jsx       # Authentication, OTP & session state
│   │   └── PlayerContext.jsx     # Audio playback, queue & volume state
│   ├── services/           # APIs & local music catalog
│   ├── App.jsx             # Root application & routing
│   └── App.css             # Unified styling and animations
├── vercel.json             # Vercel proxy configuration
├── vite.config.js          # Vite build config & dev proxy
└── README.md
```

---

## 📜 License
This project is for educational and portfolio purposes.
