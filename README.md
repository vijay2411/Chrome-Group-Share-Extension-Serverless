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

### Deploy the Decoder Page (Optional)

The decoder page lets recipients view shared tabs even without the extension installed.

1. Push this repo to GitHub
2. Go to **Settings → Pages** in your GitHub repo
3. Set source to **Deploy from a branch**, select `main` branch, and set folder to `/docs`
4. Your decoder page will be live at `https://<username>.github.io/GroupShareExtension/share/`
5. Update the `BASE_URL` in `extension/popup.js` to match your GitHub Pages URL

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
