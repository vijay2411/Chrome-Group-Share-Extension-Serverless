# GroupShare

Share Chrome Tab Groups as a single link. Recipients open all tabs with one click.

## How It Works

1. **Share**: Click the extension icon → select a Tab Group → generate a shareable link
2. **Open**: Paste a GroupShare link into the extension → all tabs open in a new group with the original name and color
3. **Fallback**: Links also work in a browser without the extension — a decoder page displays all URLs

No server required. All data is encoded directly in the link.

## Installation

### Load as Unpacked Extension (Developer Mode)

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (toggle in the top-right corner)
4. Click **Load unpacked**
5. Select the `extension/` folder from this repo
6. The GroupShare icon appears in your toolbar — pin it for easy access

### Deploy the Decoder Page (Optional but Recommended)

The decoder page lets recipients view and open shared tabs even without the extension installed. It also provides a landing page for your project.

#### Step 1: Fork & Push to GitHub

```bash
# If you cloned this repo, just push to your own GitHub:
git remote set-url origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

Or simply **fork** this repository on GitHub.

#### Step 2: Enable GitHub Pages

1. Go to your repo on GitHub
2. Click **Settings** (top menu bar)
3. In the left sidebar, click **Pages** (under "Code and automation")
4. Under **Source**, select **Deploy from a branch**
5. Under **Branch**, select `main` and set the folder to `/docs`
6. Click **Save**
7. Wait 1-2 minutes — GitHub will show your site URL at the top of the Pages settings:
   ```
   https://<your-username>.github.io/<your-repo-name>/
   ```

#### Step 3: Update the Extension's Base URL

The extension needs to know your GitHub Pages URL so the shareable links point to your decoder page.

1. Open `extension/popup.js`
2. Edit line 3 — change the `BASE_URL` to match your GitHub Pages URL:
   ```js
   const BASE_URL = "https://<your-username>.github.io/<your-repo-name>/share/";
   ```
3. Reload the extension in `chrome://extensions` (click the refresh icon on the GroupShare card)

#### Step 4: Verify

1. Open your GitHub Pages URL in a browser — you should see the GroupShare landing page
2. Generate a shareable link from the extension — the link should start with your GitHub Pages URL
3. Open that link in a browser — the decoder page should display all the shared tabs

## Usage

### Sharing a Tab Group

1. Create a Tab Group in Chrome (right-click a tab → Add to new group)
2. Click the GroupShare extension icon
3. Select your group from the dropdown
4. Click **Generate Shareable Link**
5. Click **Copy** and share the link with anyone

### Opening a Shared Group

1. Click the GroupShare extension icon
2. Paste the GroupShare link in the input field
3. Click **Open** — all tabs open in a new group

## Project Structure

```
GroupShareExtension/
├── extension/          # Chrome Extension (load this folder)
│   ├── manifest.json   # Manifest V3
│   ├── popup.html      # Extension popup
│   ├── popup.css       # Styles
│   ├── popup.js        # Core logic
│   └── icons/          # Extension icons
├── docs/               # GitHub Pages decoder site
│   ├── index.html      # Landing page
│   └── share/
│       └── index.html  # Decoder page
└── README.md
```

## Technical Details

- **Manifest V3** Chrome extension
- **Zero dependencies** — pure vanilla JavaScript
- **Serverless** — URLs encoded as base64 in the link hash fragment
- **Permissions**: `tabs` (read tab URLs) and `tabGroups` (read group names/colors)
- Group name and color are preserved in the shareable link
