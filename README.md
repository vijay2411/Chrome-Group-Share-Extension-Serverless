# 🔗 GroupShare

**Turn any Chrome Tab Group into a single shareable link 🔗.**

🙋🏼‍♂️ You're researching something. You've got 8 tabs open, neatly organized in a Chrome Tab Group called "Project Research." Now you want to share all of those tabs with a coworker. What do you do — copy-paste 8 URLs one by one? Screenshot the tabs? Send a bookmark export?

👉🏻 GroupShare solves this. It takes all the tabs in a Chrome Tab Group and encodes them into a single link. You send that link to anyone. They open it, and every tab comes back — organized in a group with the same name and color you gave it.

✅ No accounts. No servers. No data collection. Just a link - a merged link containing all information.


## 🧩 What It Does

GroupShare does two things:

1. **Share** a Chrome Tab Group as a single link — select a group, generate a URL, send it to anyone
2. **Receive** a Chrome Tab Group from a link — paste the URL, all tabs open in a group with the original name and color

That's it. Nothing else.

## ⚡ Features

- 📦 Bundles all tabs in a Chrome Tab Group into one shareable URL
- 🎨 Preserves the group name and color across sender and receiver
- 🔒 Zero data collection — your URLs never leave your browser, everything is encoded directly in the link
- 🌐 Two ways to share — extension-to-extension (instant) or via a web page (receiver doesn't need the extension)
- ⚙️ Zero dependencies, no sign-up, no backend, no database

## 🚧 Limitations

- **Chromium-only** — Works in Chrome, Brave, and Edge. Not Firefox or Safari (they don't support Tab Groups)
- **Links can be long** — Each tab URL is encoded into the link. A group with 10+ tabs produces a long URL. Use a URL shortener if needed
- **Snapshot, not sync** — The link captures tabs at the moment you generate it. If the sender adds or removes tabs after sharing, the link doesn't update
- **No storage** — If you lose the link, it's gone. Nothing is saved anywhere

---

## 🛠️ Quick Start

### 📥 Install the Extension

Both sender and receiver need this for Option A. Only the sender needs this for Option B.

```bash
git clone https://github.com/vijay2411/Chrome-Group-Share-Extension-Serverless.git
```

1. Open `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked** → select the `extension/` folder
4. Pin the extension — click 🧩 in toolbar → pin 📌 **GroupShare**

---

### 🅰️ Option A: Extension ↔ Extension 

Who for: "When both parties shares links to each other OR when link sharing is between less number of parties and is 2 way"
> Both people have GroupShare installed. No website needed, no popup blocker issues. Best for teams, friends, or sharing between your own devices.

#### Send a Link

1. Right-click a tab → **Add tab to new group** (if you don't have a group yet)
2. Click the **GroupShare** icon in your toolbar
3. Select your tab group from the dropdown
4. Click **Generate Link** → **Copy**
5. Send the link to anyone

#### Receive a Link

1. Click the **GroupShare** icon in your toolbar
2. Paste the link into the **"Open Shared Group"** field
3. Click **Open**
4. All tabs open in a new Chrome Tab Group with the original name and color

---

### 🅱️ Option B: Extension → Web Page
Who for: "When the sender is a POWER USER - shares links to many people. When link sharing(sending) is among many people and receivers(customers) don't want hassle to install extension"
> Only the sender needs the extension. The receiver just opens a link in any browser. Best for sharing with anyone who hasn't installed GroupShare.

#### One-Time Setup (Sender Only)

Before you can generate links that work as web pages, you need to host a free decoder page:

1. Fork or push this repo to your own GitHub
2. Go to repo **Settings → Pages** → Source: **Deploy from a branch** → Branch: `main`, Folder: `/docs` → **Save**
3. Edit `extension/popup.js` line 3 — set `BASE_URL` to your Pages URL in your local repo(which is used to load extension) and push that to your own forked repo as well:
   ```js
   const BASE_URL = "https://<your_github_username>.github.io/<repo_name>/share/";
   ```
4. Reload the extension in `chrome://extensions`

#### Send a Link

Same as Option A — select a group, generate a link, copy and share. The only difference is the generated link now points to your decoder web page.

#### Receive a Link (No Extension Needed)

1. Open the GroupShare link in any browser
2. The decoder page shows the group name, color, and all tabs
3. Click **Open All Tabs** or click individual links
4. **Copy All URLs** is available as a fallback

> 💡 Your browser may block popups on the first attempt. Click the blocked-popup icon in the address bar → "Always allow popups from this site" → try again.

---

## 📄 License

MIT — free to use, modify, and distribute. See [LICENSE](LICENSE) for details.

---
---

# 📚 Deep Dive — Full Documentation

*Everything below is the detailed reference. You don't need to read this to use GroupShare — the Quick Start above is enough. This section is for contributors, curious developers, and anyone who wants to understand the internals.*

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

### Step-by-Step Data Flow

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

### Technical Decisions

| Decision | Reason |
|----------|--------|
| **Base64URL encoding** | URL-safe, no special characters that break URLs, works everywhere |
| **Hash fragment (`#`)** | The hash is never sent to the server — it stays entirely in the browser. The GitHub Pages server never sees the tab data |
| **No compression** | Keeps the extension zero-dependency. Base64 adds ~33% overhead but avoids needing external libraries |
| **Compact JSON keys** | `t`, `c`, `u` instead of `title`, `color`, `urls` — saves bytes in every link |

---

## 🔀 Mode Details

### Option A: Extension-to-Extension (Serverless) — In Depth

Both the sender and receiver install the extension. No hosting, no web page, no popup blocker issues.

#### Full Installation Walkthrough

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

#### Sending a Link

1. **Create a Tab Group in Chrome** (if you don't have one already)
   - Right-click any tab → **Add tab to new group**
   - Give the group a name and color
   - Drag more tabs into the group as needed

2. **Open GroupShare** — Click the GroupShare icon in your toolbar

3. **Select your group** — The dropdown lists all Tab Groups in your current window. Select the one you want to share. A preview of the tabs appears below.

4. **Generate the link** — Click **Generate Link**. A shareable URL appears in the output field.

5. **Copy and share** — Click **Copy** to copy the link to your clipboard. Send it via Slack, email, text, or any messaging platform.

#### Receiving a Link

1. **Copy the GroupShare link** that was sent to you
2. **Open GroupShare** — Click the GroupShare icon in your toolbar
3. **Paste and open** — Paste the link into the **"Open Shared Group"** input field → click **Open** (or press Enter)
4. **Done!** — All tabs open in the background, automatically grouped into a Chrome Tab Group with the sender's original name and color

---

### Option B: GitHub Pages (Web Decoder) — In Depth

The sender hosts a static decoder page on GitHub Pages. When someone opens a GroupShare link, they land on this page which displays all the shared URLs. The receiver can click individual links or "Open All Tabs."

#### Full Setup Walkthrough (Sender Only — One-Time)

##### Step 1: Push to GitHub

```bash
git remote set-url origin https://github.com/<your_github_username>/<repo_name>.git
git push -u origin main
```

Or simply **fork** the repository on GitHub.

##### Step 2: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** in the top menu bar
3. In the left sidebar, click **Pages** (under "Code and automation")
4. Under **Build and deployment → Source**, select **Deploy from a branch**
5. Under **Branch**, select `main` and set the folder to `/docs`
6. Click **Save**
7. Wait 1–2 minutes. GitHub will display your site URL at the top:
   ```
   ✅ Your site is live at https://<your_github_username>.github.io/<repo_name>/
   ```

##### Step 3: Update the Extension's Base URL

1. Open `extension/popup.js` in any text editor
2. Edit **line 3** — set `BASE_URL` to your GitHub Pages URL:
   ```js
   const BASE_URL = "https://<your_github_username>.github.io/<repo_name>/share/";
   ```
   > ⚠️ Must end with `/share/` — this points to the decoder page, not the landing page
3. Save the file
4. Go to `chrome://extensions` and click the **🔄 reload** icon on the GroupShare card

##### Step 4: Verify

1. Open your GitHub Pages URL — you should see the GroupShare landing page
2. Generate a link from the extension — it should start with your Pages URL
3. Open that link in a browser — the decoder page should display all the shared URLs

#### Receiving via the Web Page

1. **Click or paste the GroupShare link** in any browser
2. The **decoder page** loads, showing the group name, color, and all tabs with their domains
3. Click **Open All Tabs** to open everything, or click individual links
4. **"Copy All URLs"** is available as a fallback

> 💡 Your browser may block popups on the first attempt. Click the blocked-popup icon in the address bar → "Always allow popups from this site" → try again.

---

## 🤔 Which Option Should You Use?

| Scenario | Recommendation |
|----------|---------------|
| Sharing with your team (everyone has the extension) | ✅ **Option A** — Extension-to-Extension |
| Sharing with a friend who doesn't have the extension | ✅ **Option B** — GitHub Pages |
| Sharing research links publicly (blog, social media) | ✅ **Option B** — GitHub Pages |
| Quick sharing between your own devices | ✅ **Option A** — Extension-to-Extension |
| Maximum reliability (no popup blocker issues) | ✅ **Option A** — Extension-to-Extension |

> 💡 You can use both simultaneously. If the receiver has the extension, they paste the link into it. If they don't, the same link works as a web page.

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
├── LICENSE
└── README.md
```

---

## 🔧 Technical Specs

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
> Each tab URL is encoded into the link. More tabs = longer link. This is by design (no server). For very large groups, some messaging apps may truncate the link — use a URL shortener like [tinyurl.com](https://tinyurl.com).

**"Open All Tabs" doesn't work on the decoder page**
> Your browser is blocking popups. Click the blocked-popup icon (🚫) in the address bar → "Always allow popups from this site" → try again. Alternatively, use the **Copy All URLs** button.

**Extension icon doesn't appear after loading**
> Click the puzzle piece icon (🧩) in Chrome's toolbar → find GroupShare → click the pin (📌) icon.

**Tabs open but aren't grouped**
> Make sure you're using Google Chrome (or a Chromium-based browser). Tab Groups are not available in all browsers. Also ensure the extension has the `tabGroups` permission — reload it from `chrome://extensions`.
