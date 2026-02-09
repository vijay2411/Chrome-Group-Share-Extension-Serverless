# 🔗 GroupShare

**Share your Chrome Tab Groups as a single link. Recipients open all tabs instantly.**

GroupShare is a Chrome extension that takes all the tabs inside a Chrome Tab Group, compresses them into one shareable link, and lets anyone on the other end reconstruct that exact group — same tabs, same group name, same color — with a single click.

---

## 📖 Table of Contents

- [What It Does](#-what-it-does)
- [What It Does NOT Do](#-what-it-does-not-do)
- [How It Works — Under the Hood](#-how-it-works--under-the-hood)
- [Two Modes of Operation](#-two-modes-of-operation)
- [Mode 1: Extension-to-Extension (Serverless)](#-mode-1-extension-to-extension-serverless)
- [Mode 2: GitHub Pages (Web Decoder)](#-mode-2-github-pages-web-decoder)
- [Which Mode Should You Use?](#-which-mode-should-you-use)
- [Project Structure](#-project-structure)
- [Technical Details](#-technical-details)
- [Troubleshooting](#-troubleshooting)

---

## ✅ What It Does

- 📦 **Bundles a Tab Group into a link** — Select any Chrome Tab Group and generate a single URL containing all the tabs
- 🚀 **Opens all tabs from a link** — Paste a GroupShare link into the extension and it opens every tab, organized into a new Chrome Tab Group
- 🎨 **Preserves metadata** — The group name and color are encoded in the link and restored on the receiving end
- 🌐 **Works without the extension too** — Links can be opened in a browser via a decoder web page (see [Mode 2](#-mode-2-github-pages-web-decoder))
- 🔒 **Fully serverless** — No data is sent to any server. Everything is encoded directly in the URL itself

## 🚫 What It Does NOT Do

- ❌ **No cloud storage** — Links are not stored anywhere. If you lose the link, it's gone
- ❌ **No account or login** — There is no user system, no sign-up, no tracking
- ❌ **No tab syncing** — This is a one-time snapshot, not a live sync. If the sender adds new tabs after sharing, the link doesn't update
- ❌ **No cross-browser support** — Chrome Tab Groups are a Chrome-specific feature. This extension only works in Chromium-based browsers (Chrome, Brave, Edge)
- ❌ **No URL shortening** — The generated links can be long if the group has many tabs (each URL is encoded into the link)

---

## ⚙️ How It Works — Under the Hood

### The Algorithm

GroupShare uses a simple **encode → share → decode** pipeline with zero server involvement:

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌─────────────┐
│  Chrome Tab  │     │  JSON Object │     │  Base64URL   │     │  Shareable  │
│    Group     │ ──▶ │  { t, c, u } │ ──▶ │   Encoded    │ ──▶ │    Link     │
│  (n tabs)    │     │              │     │   String     │     │             │
└─────────────┘     └──────────────┘     └──────────────┘     └─────────────┘
```

#### Step-by-Step Data Flow

**🔵 Sending (Generating a Link):**

1. User clicks the extension and selects a Tab Group
2. Extension calls `chrome.tabGroups.query()` to get the group's **name** and **color**
3. Extension calls `chrome.tabs.query({ groupId })` to get **all tab URLs** in that group
4. This data is packed into a compact JSON object:
   ```json
   {
     "t": "My Research",
     "c": "blue",
     "u": ["https://example.com", "https://docs.google.com/...", "..."]
   }
   ```
   > Keys are shortened (`t` = title, `c` = color, `u` = URLs) to minimize link length
5. The JSON string is encoded using **Base64URL** (a URL-safe variant of Base64 that replaces `+/=` with `-_`)
6. The encoded string is appended as a **hash fragment** to a base URL:
   ```
   https://your-site.github.io/your-repo/share/#eyJ0IjoiTXkgUmVzZ...
   ```
7. User copies this link and shares it via any channel (Slack, email, text, etc.)

**🟢 Receiving (Opening a Link):**

1. Recipient pastes the link into the GroupShare extension popup
2. Extension extracts the `#hash` fragment from the URL
3. Decodes the Base64URL string back into JSON
4. Validates each URL (only `http:` and `https:` protocols are allowed)
5. Opens each URL using `chrome.tabs.create()` with `active: false` (tabs open in background)
6. Groups all new tabs together using `chrome.tabs.group()`
7. Applies the original group name and color using `chrome.tabGroups.update()`

### Why Base64URL in the Hash Fragment?

| Decision | Reason |
|----------|--------|
| **Base64URL encoding** | URL-safe, no special characters that break URLs, works everywhere |
| **Hash fragment (`#`)** | The hash is never sent to the server — it stays entirely in the browser. This means the GitHub Pages server never sees the tab data |
| **No compression** | Keeps the extension zero-dependency. Base64 adds ~33% overhead but avoids needing external libraries |
| **Compact JSON keys** | `t`, `c`, `u` instead of `title`, `color`, `urls` — saves bytes in every link |

---

## 🔀 Two Modes of Operation

GroupShare can be used in two different ways depending on your needs:

| | **Mode 1: Extension-to-Extension** | **Mode 2: GitHub Pages** |
|---|---|---|
| 🏷️ **Name** | Serverless / Pure Extension | Web Decoder |
| 📤 **Sender needs** | GroupShare extension installed | GroupShare extension installed |
| 📥 **Receiver needs** | GroupShare extension installed | Just a web browser (no extension) |
| 🖥️ **Hosting required** | None | GitHub Pages (free) |
| ⚡ **Receiver experience** | Tabs open in a Chrome Tab Group instantly | Decoder page shows links; user clicks to open |
| 👥 **Best for** | Teams where everyone has the extension | Sharing with anyone, even non-technical users |

---

## 📦 Mode 1: Extension-to-Extension (Serverless)

> **Best for:** Teams, friends, or groups where both sender and receiver have the extension installed.
> **Hosting required:** None.

In this mode, both parties have the GroupShare extension. The sender generates a link, and the receiver pastes it directly into their extension. Tabs open instantly in a proper Chrome Tab Group with the correct name and color.

### 🛠️ Installation

Both the sender and receiver need to install the extension:

1. **Download the code**
   ```bash
   git clone https://github.com/vijay2411/Chrome-Group-Share-Extension-Serverless.git
   ```
   Or download and extract the ZIP from the GitHub repo page.

2. **Open Chrome's extension manager**
   - Navigate to `chrome://extensions` in your address bar

3. **Enable Developer Mode**
   - Toggle the **Developer mode** switch in the top-right corner of the page

4. **Load the extension**
   - Click **Load unpacked**
   - Navigate to the downloaded folder and select the `extension/` subfolder
   - ⚠️ Select the `extension/` folder specifically, **not** the root project folder

5. **Pin the extension**
   - Click the puzzle piece icon 🧩 in Chrome's toolbar
   - Find **GroupShare** and click the pin 📌 icon
   - The GroupShare icon now appears in your toolbar for quick access

### 📤 Sending a Link (Sharing Your Tabs)

1. **Create a Tab Group in Chrome** (if you don't have one already)
   - Right-click any tab → **Add tab to new group**
   - Give the group a name and color
   - Drag more tabs into the group as needed

2. **Open GroupShare**
   - Click the GroupShare icon in your toolbar

3. **Select your group**
   - The dropdown lists all Tab Groups in your current window
   - Select the one you want to share
   - A preview of the tabs in that group will appear below

4. **Generate the link**
   - Click **Generate Link**
   - A shareable URL appears in the output field

5. **Copy and share**
   - Click **Copy** to copy the link to your clipboard
   - Send it to your recipient via Slack, email, text, or any messaging platform

### 📥 Receiving a Link (Opening Shared Tabs)

1. **Copy the GroupShare link** that was sent to you

2. **Open GroupShare**
   - Click the GroupShare icon in your toolbar

3. **Paste and open**
   - Paste the link into the **"Open Shared Group"** input field
   - Click **Open** (or press Enter)

4. **Done!**
   - All tabs open in the background
   - They're automatically grouped into a Chrome Tab Group
   - The group has the same name and color the sender used

---

## 🌐 Mode 2: GitHub Pages (Web Decoder)

> **Best for:** Sharing tab bundles with anyone — the receiver does NOT need the extension.
> **Hosting required:** GitHub Pages (free).

In this mode, the sender hosts a simple static decoder page on GitHub Pages. When someone opens a GroupShare link in their browser, they land on this page which displays all the shared URLs. They can click individual links or use "Open All Tabs".

This is ideal for sharing with people who haven't installed the extension — they just need a browser.

### 🛠️ Setup (Sender Only — One-Time)

The sender needs the extension installed (see [Mode 1 installation](#%EF%B8%8F-installation) above) **plus** a GitHub Pages site:

#### Step 1: Push to GitHub

If you cloned the repo, push it to your own GitHub:
```bash
git remote set-url origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

Or simply **fork** the repository on GitHub.

#### Step 2: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** in the top menu bar
3. In the left sidebar, click **Pages** (under "Code and automation")
4. Under **Build and deployment → Source**, select **Deploy from a branch**
5. Under **Branch**, select `main` and set the folder to `/docs`
6. Click **Save**
7. Wait 1–2 minutes. GitHub will display your site URL at the top:
   ```
   ✅ Your site is live at https://<your-username>.github.io/<your-repo-name>/
   ```

#### Step 3: Update the Extension's Base URL

The extension needs to know your GitHub Pages URL so generated links point to your decoder page:

1. Open the file `extension/popup.js` in any text editor
2. Edit **line 3** — change the `BASE_URL` constant to your GitHub Pages URL:
   ```js
   const BASE_URL = "https://<your-username>.github.io/<your-repo-name>/share/";
   ```
   > ⚠️ Make sure it ends with `/share/` — this points to the decoder page, not the landing page
3. Save the file
4. Go to `chrome://extensions` and click the **🔄 reload** icon on the GroupShare card

#### Step 4: Verify Everything Works

1. Open `https://<your-username>.github.io/<your-repo-name>/` in your browser — you should see the GroupShare landing page
2. Generate a link from the extension — it should start with your GitHub Pages URL
3. Open that link in a browser tab — the decoder page should display all the shared URLs

### 📤 Sending a Link (Same as Mode 1)

The sending process is identical — use the extension to select a group and generate a link. The only difference is that the generated link now points to your GitHub Pages decoder instead of being a raw encoded string.

### 📥 Receiving a Link (No Extension Needed!)

1. **Click or paste the GroupShare link** in any browser
2. The **decoder page** loads, showing:
   - The group name and color
   - A list of all tabs with their domains
   - An **"Open All Tabs"** button
   - A **"Copy All URLs"** button (as fallback)
3. Click **Open All Tabs** to open everything
   > 💡 Your browser may block popups on the first attempt. If so, click the blocked-popup icon in the address bar, select "Always allow popups from this site," and click Open All Tabs again.

---

## 🤔 Which Mode Should You Use?

| Scenario | Recommended Mode |
|----------|-----------------|
| Sharing with your team (everyone has the extension) | ✅ **Mode 1** — Extension-to-Extension |
| Sharing with a friend who doesn't have the extension | ✅ **Mode 2** — GitHub Pages |
| Sharing research links publicly (blog, social media) | ✅ **Mode 2** — GitHub Pages |
| Quick sharing between your own devices | ✅ **Mode 1** — Extension-to-Extension |
| Maximum reliability (no popup blocker issues) | ✅ **Mode 1** — Extension-to-Extension |

> 💡 **Tip:** You can use both modes simultaneously. If the receiver has the extension, they paste the link into it for the best experience. If they don't, the same link works as a web page.

---

## 📂 Project Structure

```
GroupShareExtension/
│
├── 📁 extension/              ← Chrome Extension (load this folder)
│   ├── manifest.json          ← Manifest V3 configuration
│   ├── popup.html             ← Extension popup UI
│   ├── popup.css              ← Styles (Inter font, dark theme)
│   ├── popup.js               ← Core logic (encode/decode, Chrome APIs)
│   └── 📁 icons/
│       ├── icon16.png         ← Toolbar icon
│       ├── icon48.png         ← Extensions page icon
│       └── icon128.png        ← Web Store / install icon
│
├── 📁 docs/                   ← GitHub Pages site (decoder + landing)
│   ├── index.html             ← Landing page
│   └── 📁 share/
│       └── index.html         ← Decoder page (reads hash, shows tabs)
│
└── README.md
```

---

## 🔧 Technical Details

| Property | Value |
|----------|-------|
| **Manifest version** | V3 (latest Chrome standard) |
| **Dependencies** | Zero — pure vanilla JavaScript |
| **Font** | [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts |
| **Encoding** | Base64URL (RFC 4648 §5) |
| **Data transport** | URL hash fragment (`#`) — never touches a server |
| **Permissions** | `tabs` (read tab URLs), `tabGroups` (read group names/colors) |
| **Storage** | None — no local storage, no cookies, no external calls |
| **Data collected** | None — your tab URLs never leave your browser |

---

## ❓ Troubleshooting

**"No tab groups found"**
> You need at least one Chrome Tab Group in your current window. Right-click a tab → Add tab to new group.

**Generated link is very long**
> Each tab URL is encoded into the link. More tabs = longer link. This is by design (no server). For very large groups, some messaging apps may truncate the link — try using a URL shortener like [tinyurl.com](https://tinyurl.com).

**"Open All Tabs" doesn't work on the decoder page**
> Your browser is blocking popups. Click the blocked-popup icon (🚫) in the address bar → "Always allow popups from this site" → try again. Alternatively, use the **Copy All URLs** button.

**Extension icon doesn't appear after loading**
> Click the puzzle piece icon (🧩) in Chrome's toolbar → find GroupShare → click the pin (📌) icon.

**Tabs open but aren't grouped**
> Make sure you're using Google Chrome (or a Chromium-based browser). Tab Groups are not available in all browsers. Also ensure the extension has the `tabGroups` permission — reload it from `chrome://extensions`.
