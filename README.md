# GroupShare

**Share Chrome Tab Groups as a single link. End-to-end encrypted. Completely serverless.**

You're researching something. You've got 8 tabs open, neatly organized in a Chrome Tab Group called "Project Research." Now you want to share all those tabs with a coworker. What do you do — copy-paste 8 URLs one by one?

GroupShare solves this. Select a Tab Group, generate a link, send it. The recipient opens it, and every tab comes back — organized in a group with the same name and color. One link, all tabs. 100% Open-Souce. Fully Transparent.

---

## Zero Trust Architecture

GroupShare is built so that **nobody — not even the developer — can see what you share.**

| Principle | How |
|-----------|-----|
| **No servers** | There is no backend. No database. No API. Nothing to hack, nothing to subpoena. |
| **No middleman** | Tab data is encoded directly into the URL hash fragment (`#`). The hash fragment is **never sent to any server** — not even the hosting server. It stays entirely in your browser. |
| **End-to-end encrypted** | When you enable password protection, your tabs are encrypted with **AES-256-GCM** using a key derived via **PBKDF2** (100,000 iterations, SHA-256). The encryption and decryption happen entirely in your browser. The password never leaves your device. |
| **Zero data collection** | No analytics. No telemetry. No cookies. No fingerprinting. No accounts. No tracking of any kind. |
| **Open source** | Every line of code is auditable. There is nothing hidden. |

**In practice:** when you share an encrypted link, the only way to see the tabs inside is to know the password. The hosting server (GitHub Pages) never receives the data. The developer has no access. There is no "admin panel" or "backend database" where your tabs are stored. They exist only in the URL itself, encrypted.

---

## Features

**Core**
- Share all tabs in a Chrome Tab Group as a single URL
- Preserves group name and color for the recipient
- Two sharing modes: extension-to-extension (instant) or via web page (no extension needed)
- Links never expire and there's no limit on how many you can create

**Privacy Sharing (NEW)**
- Optional password protection with AES-256-GCM encryption
- Set your own password or let GroupShare auto-generate a strong one
- Password is displayed after link generation with a one-click copy button
- Recipients enter the password to unlock — wrong password shows a clear error
- Passwords are cached locally so you only enter them once per link
- If a cached password stops working, you're prompted to re-enter it

**Zero Footprint**
- No servers, no databases, no accounts, no sign-up
- No data collection, no analytics, no cookies
- Completely open source (MIT license)
- Zero dependencies — pure vanilla JavaScript

---

## Quick Start

### Install

```bash
git clone https://github.com/vijay2411/Chrome-Group-Share-Extension-Serverless.git
```

1. Open `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked** and select the `extension/` folder
4. Pin the extension from the puzzle piece icon in the toolbar

### Share a Tab Group

1. Right-click a tab and choose **Add tab to new group** (if you don't have a group yet)
2. Click the **GroupShare** icon in your toolbar
3. Select your tab group from the dropdown
4. (Optional) Toggle **Password protect** on — enter a password or leave blank to auto-generate
5. Click **Generate Link** and copy it
6. Send the link via Slack, email, Discord, or any messenger

### Open a Shared Link

**With the extension:**
1. Click the GroupShare icon
2. Paste the link into "Open Shared Group"
3. Click **Open** (if password-protected, enter the password when prompted)
4. All tabs open in a new Chrome Tab Group

**Without the extension:**
1. Open the link in any browser
2. The web decoder shows the group name, color, and all tabs
3. If password-protected, enter the password to unlock
4. Click **Open All Tabs** or click individual links

---

## Sharing Modes

### Option A: Extension to Extension

Both sender and receiver have GroupShare installed. The receiver pastes the link into the extension popup. All tabs open instantly in a Chrome Tab Group. No popup blocker issues, no web page needed.

**Best for:** teams, friends, sharing between your own devices.

### Option B: Extension to Web Page

Only the sender needs the extension. The generated link points to a hosted decoder page. The receiver opens it in any browser and sees all tabs listed. No extension required on the receiver's end.

**Best for:** sharing with anyone who hasn't installed GroupShare, public sharing, blog posts.

Both modes support password protection. The same link works in both modes.

---

## How It Works

### The Encoding Pipeline

```
Chrome Tab Group → JSON { title, color, urls[] } → Base64URL encode → URL hash fragment
```

The encoded data lives entirely in the `#hash` of the URL. Hash fragments are **never sent to the server** by any browser — this is part of the HTTP specification. The GitHub Pages server that hosts the decoder page never receives your tab data.

### The Encryption Pipeline (when password-protected)

```
Password → PBKDF2 (SHA-256, 100k iterations) → AES-256-GCM key
JSON payload → AES-GCM encrypt with random salt + IV → enc.SALT.IV.CIPHERTEXT
```

- **Salt** (16 bytes, random per link) — prevents rainbow table attacks
- **IV** (12 bytes, random per link) — ensures identical data produces different ciphertext
- **AES-256-GCM** — authenticated encryption, tamper-proof
- **PBKDF2 100k iterations** — computationally expensive key derivation, resists brute-force

The encrypted payload replaces the Base64URL data in the hash fragment. Links with `enc.` prefix are encrypted; all others are plain (backward compatible).

### Password Caching

- **Extension:** uses `chrome.storage.local` (keyed by a hash of the ciphertext)
- **Web decoder:** uses `localStorage`
- On successful decrypt, the password is cached. On failure, the cache is cleared and you're prompted again.

---

## Limitations

- **Saved tab groups are not visible to extensions** — Chrome's "saved tab groups" feature (introduced in Chrome 120) stores groups internally when you close them. Unfortunately, Chrome does **not expose saved tab groups to any extension API** — not through `chrome.tabGroups`, `chrome.sessions`, `chrome.bookmarks`, or any other API. This is a [known limitation](https://issues.chromium.org/issues/323982812) acknowledged by the Chrome team but not yet resolved. **Workaround:** open your saved tab group first (right-click it in the tab strip or bookmarks bar → "Open group"), and it will immediately appear in GroupShare's dropdown. Collapsed groups that are still open in a window work fine — only fully closed/saved groups are invisible to extensions.
- **Chromium-only** — works in Chrome, Brave, and Edge. Firefox and Safari don't support Tab Groups.
- **Links can be long** — each tab URL is encoded into the link. 10+ tabs = long URL. Use a URL shortener if needed.
- **Snapshot, not sync** — the link captures tabs at the moment you generate it. Later changes to the group aren't reflected.
- **No revocation** — once a link is generated, it can't be revoked or updated. If you need to stop sharing, change the password.

---

## Project Structure

```
GroupShareExtension/
├── extension/                  ← Chrome Extension (load this folder)
│   ├── manifest.json           ← Manifest V3 config
│   ├── popup.html              ← Extension popup UI
│   ├── popup.css               ← Styles (Geist Sans, dark theme)
│   ├── popup.js                ← Core logic (encode/decode, crypto, Chrome APIs)
│   └── icons/                  ← Extension icons (16, 32, 48, 128px)
│
├── docs/                       ← GitHub Pages (decoder + landing + privacy)
│   ├── index.html              ← Landing page
│   ├── share/index.html        ← Web decoder page
│   └── privacy/index.html      ← Privacy policy
│
├── store-listing.md            ← Chrome Web Store listing content
├── LICENSE                     ← MIT
└── README.md
```

---

## Technical Specs

| Property | Value |
|----------|-------|
| Manifest version | V3 |
| Dependencies | Zero — pure vanilla JavaScript |
| Font | Geist Sans (by Vercel) |
| Encoding | Base64URL (RFC 4648) |
| Encryption | AES-256-GCM + PBKDF2-SHA256 (100k iterations) |
| Data transport | URL hash fragment — never touches a server |
| Permissions | `tabs`, `tabGroups`, `storage` |
| Data collected | None |

---

## Privacy Policy

Full policy: [https://vijay2411.github.io/Chrome-Group-Share-Extension-Serverless/privacy/](https://vijay2411.github.io/Chrome-Group-Share-Extension-Serverless/privacy/)

**TL;DR:** GroupShare collects zero data. Tab URLs stay in the URL hash (never sent to any server). Passwords are used for client-side encryption only. Password cache is stored locally on your device. No analytics, no tracking, no cookies, no accounts.

---

## License

MIT — free to use, modify, and distribute. See [LICENSE](LICENSE).
