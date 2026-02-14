# Chrome Web Store Listing — Reference

Copy-paste these into the Chrome Web Store Developer Dashboard fields.

---

## Name

GroupShare — Share Tab Groups

> CWS SEO: The name field is the #1 ranking signal. Including "Share Tab Groups"
> puts the main search keywords directly in the title. Users searching for
> "share tabs", "tab group share", "share tab group" will all match.

## Summary (max 200 chars)

Share Chrome Tab Groups as one link. End-to-end encrypted, serverless, zero tracking. Recipients open all tabs instantly — no sign-up needed.

> CWS SEO: Summary appears in search results. Front-loaded with "Share Chrome Tab Groups"
> which is the exact query users type. Includes differentiators (encrypted, serverless).

## Description

Share an entire Chrome Tab Group with a single link. Select your group, generate a URL, send it to anyone. Every tab reopens in a new group — same name, same color, zero hassle.

SHARE CHROME TAB GROUPS IN ONE CLICK
Whether you're sharing research, project tabs, onboarding links, or curated collections — GroupShare bundles all tabs into one link and the recipient gets them back exactly as you organized them.

HOW IT WORKS
1. Create a Tab Group in Chrome with the tabs you want to share
2. Click the GroupShare icon and select your tab group
3. Click "Generate Link" — copy and share via Slack, email, Discord, or any messenger
4. The recipient pastes the link to open all tabs in a named, color-coded group

TWO WAYS TO SHARE
- Extension-to-Extension: Both parties have GroupShare. Paste the link, tabs open instantly in a Chrome Tab Group. Best for teams and friends.
- Web Decoder: Recipients don't need the extension. The link opens a web page that lists all tabs. Best for sharing publicly or with anyone who hasn't installed GroupShare.

END-TO-END ENCRYPTED SHARING
Protect sensitive tabs with optional password protection. GroupShare uses AES-256-GCM encryption with PBKDF2 key derivation — military-grade encryption, entirely client-side. Not even the developer can see what you share. The password is never stored on any server.
- Set your own password or let GroupShare auto-generate one
- Recipients enter the password to unlock the tabs
- Passwords are cached locally so you only enter them once per link

COMPLETELY SERVERLESS & PRIVATE
GroupShare has zero backend. No servers, no databases, no accounts, no tracking. Your tab URLs are encoded directly into the URL hash fragment — a part of the URL that never leaves your browser and is never sent to any server. Your data is truly yours.

KEY FEATURES
- Share Chrome Tab Groups as a single shareable link
- Preserves tab group name and color for recipients
- Optional end-to-end encrypted password protection (AES-256)
- Works without the extension via web decoder page
- Links never expire — share once, open forever
- Unlimited links — no caps, no quotas
- Zero data collection, zero analytics, zero cookies
- Completely open source
- No sign-up, no accounts, no server

PERMISSIONS EXPLAINED
- "tabs": Read tab URLs to create shareable links and open shared tabs
- "tabGroups": Read and create tab groups to preserve names and colors
- "storage": Cache unlock passwords locally (never sent to any server)

PRIVACY
GroupShare collects zero user data. Full privacy policy: https://vijay2411.github.io/Chrome-Group-Share-Extension-Serverless/privacy/

Open source: https://github.com/vijay2411/Chrome-Group-Share-Extension-Serverless

> CWS SEO notes on this description:
> - "Share Chrome Tab Groups" appears multiple times naturally
> - Related keywords woven in: "share tabs", "tab group", "shareable link",
>   "share research", "share project tabs", "encrypted sharing"
> - Use-case keywords: "onboarding links", "curated collections", "teams", "Slack"
> - Structured with headers (CWS renders plain text but headers improve scannability)
> - Permission justifications inline (reduces reviewer friction → faster approval)
> - Privacy section at the bottom (required, builds trust)

## Single Purpose Field (max 1000 chars)

Tab group sharing — GroupShare enables users to share Chrome Tab Groups as encoded URL links. Users select a tab group, and the extension encodes the group name, color, and all tab URLs into a compact URL hash fragment. Recipients decode the link using the extension or a hosted web page to recreate the exact tab group. Optional password protection encrypts the payload with AES-256-GCM and PBKDF2 key derivation, ensuring only the intended recipient can view the tabs. All encoding, encryption, and decoding happens client-side. No data is transmitted to any server.

## Category

Productivity

## Language

English

---

## Permission Justifications

### tabs
Required to read the URLs of tabs within a selected Tab Group so they can be encoded into the shareable link. Also used to create new tabs when the recipient opens a shared link.

### tabGroups
Required to query available Tab Groups (name, color) for the user to select from, and to create/update Tab Groups when opening a shared link so the original group name and color are preserved.

### storage
Required to cache passwords locally for previously unlocked encrypted links, so the user doesn't need to re-enter the password each time they open the same link.

---

## Privacy Practices (Dashboard Checkboxes)

### Does your extension collect or use user data?
- Select: **No, this extension does not collect or use user data**

If forced to select yes, check these:
- Data NOT being transferred outside of the extension
- Data NOT being used for purposes unrelated to the extension's single purpose
- Data NOT being used for creditworthiness or lending

### Privacy Policy URL
https://vijay2411.github.io/Chrome-Group-Share-Extension-Serverless/privacy/

---

## Assets Needed (You Must Create These)

### Screenshots (1280 x 800 px, PNG or JPEG, up to 5)
Suggested screenshots:
1. Extension popup showing the "Share a Tab Group" section with a group selected and tab preview visible
2. Generated link output with the password notice card showing the auto-generated password
3. "Open Shared Group" section with the password unlock prompt
4. Web decoder page showing a shared group with tabs listed
5. Web decoder password gate screen

### Small Promotional Tile (440 x 280 px)
A marketing image with the GroupShare logo and a tagline like "Share Tab Groups. One Link. End-to-End Encrypted."

### Developer Account
- One-time $5 registration fee
- 2-Step Verification must be enabled on your Google account
- Register at: https://chrome.google.com/webstore/devconsole/register
