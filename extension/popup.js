// --- Config ---
// Decoder page hosted on GitHub Pages — all generated links point here by default
const BASE_URL = "https://vijay2411.github.io/Chrome-Group-Share-Extension-Serverless/share/";

// --- DOM refs ---
const linkInput = document.getElementById("link-input");
const openBtn = document.getElementById("open-btn");
const openStatus = document.getElementById("open-status");
const groupSelect = document.getElementById("group-select");
const tabPreview = document.getElementById("tab-preview");
const generateBtn = document.getElementById("generate-btn");
const outputContainer = document.getElementById("output-container");
const outputLink = document.getElementById("output-link");
const copyBtn = document.getElementById("copy-btn");
const shareStatus = document.getElementById("share-status");
const noGroups = document.getElementById("no-groups");
const groupsContainer = document.getElementById("groups-container");
const passwordToggle = document.getElementById("password-toggle");
const passwordSection = document.getElementById("password-section");
const sharePassword = document.getElementById("share-password");
const passwordNotice = document.getElementById("password-notice");
const passwordDisplay = document.getElementById("password-display");
const copyPasswordBtn = document.getElementById("copy-password-btn");
const unlockSection = document.getElementById("unlock-section");
const unlockPassword = document.getElementById("unlock-password");
const unlockBtn = document.getElementById("unlock-btn");
const unlockStatus = document.getElementById("unlock-status");

// Chrome tab group color → hex mapping
const GROUP_COLORS = {
  grey: "#5f6368",
  blue: "#1a73e8",
  red: "#d93025",
  yellow: "#f9ab00",
  green: "#1e8e3e",
  pink: "#d01884",
  purple: "#a142f4",
  cyan: "#007b83",
  orange: "#e8710a",
};

// --- Encoding helpers ---
function toBase64Url(str) {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(b64) {
  let s = b64.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return decodeURIComponent(escape(atob(s)));
}

// --- Binary Base64URL helpers (for crypto byte arrays) ---
function bytesToBase64Url(bytes) {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(b64) {
  let s = b64.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const binary = atob(s);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// --- Crypto helpers ---
async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encryptPayload(jsonString, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const enc = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(jsonString)
  );
  return "enc." +
    bytesToBase64Url(salt) + "." +
    bytesToBase64Url(iv) + "." +
    bytesToBase64Url(new Uint8Array(ciphertext));
}

async function decryptPayload(encString, password) {
  const parts = encString.split(".");
  if (parts.length !== 4 || parts[0] !== "enc") {
    throw new Error("Invalid encrypted format");
  }
  const salt = base64UrlToBytes(parts[1]);
  const iv = base64UrlToBytes(parts[2]);
  const ciphertext = base64UrlToBytes(parts[3]);
  const key = await deriveKey(password, salt);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );
  return new TextDecoder().decode(decrypted);
}

function generatePassword() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const arr = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(arr, b => chars[b % chars.length]).join("");
}

function isEncryptedHash(hash) {
  return hash.startsWith("enc.");
}

function getCacheKey(hash) {
  const parts = hash.split(".");
  if (parts.length === 4) return "gs_pw_" + parts[3].substring(0, 16);
  return null;
}

// --- Password cache (chrome.storage.local) ---
async function cachePassword(hash, password) {
  const key = getCacheKey(hash);
  if (key) await chrome.storage.local.set({ [key]: password });
}

async function getCachedPassword(hash) {
  const key = getCacheKey(hash);
  if (!key) return null;
  const result = await chrome.storage.local.get(key);
  return result[key] || null;
}

async function clearCachedPassword(hash) {
  const key = getCacheKey(hash);
  if (key) await chrome.storage.local.remove(key);
}

// --- Status helpers ---
function showStatus(el, message, type) {
  el.textContent = message;
  el.className = `status ${type}`;
  el.hidden = false;
  if (type === "success") {
    setTimeout(() => (el.hidden = true), 3000);
  }
}

// --- Load tab groups into dropdown ---
async function loadGroups() {
  const groups = await chrome.tabGroups.query({});
  groupSelect.innerHTML = "";

  if (groups.length === 0) {
    noGroups.hidden = false;
    groupsContainer.querySelector("select").hidden = true;
    generateBtn.disabled = true;
    return;
  }

  noGroups.hidden = true;
  groupsContainer.querySelector("select").hidden = false;

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.disabled = true;
  placeholder.selected = true;
  placeholder.textContent = "Select a tab group...";
  groupSelect.appendChild(placeholder);

  for (const group of groups) {
    const opt = document.createElement("option");
    opt.value = group.id;
    const colorDot = GROUP_COLORS[group.color] ? `[${group.color}]` : "";
    opt.textContent = `${colorDot} ${group.title || "Unnamed Group"}`;
    groupSelect.appendChild(opt);
  }
}

// --- Show tab preview when a group is selected ---
async function showTabPreview(groupId) {
  const tabs = await chrome.tabs.query({ groupId });
  tabPreview.innerHTML = "";

  if (tabs.length === 0) {
    tabPreview.hidden = true;
    return;
  }

  tabPreview.hidden = false;
  for (const tab of tabs) {
    const div = document.createElement("div");
    div.className = "tab-item";
    div.textContent = tab.title || tab.url;
    div.title = tab.url;
    tabPreview.appendChild(div);
  }
}

// --- Generate shareable link ---
async function generateLink() {
  const groupId = parseInt(groupSelect.value);
  if (isNaN(groupId)) return;

  const groups = await chrome.tabGroups.query({});
  const group = groups.find((g) => g.id === groupId);
  if (!group) {
    showStatus(shareStatus, "Group not found. It may have been closed.", "error");
    return;
  }

  const tabs = await chrome.tabs.query({ groupId });
  if (tabs.length === 0) {
    showStatus(shareStatus, "No tabs found in this group.", "error");
    return;
  }

  const payload = {
    t: group.title || "Shared Group",
    c: group.color || "grey",
    u: tabs.map((tab) => tab.url),
  };

  const jsonString = JSON.stringify(payload);
  let hashData;
  let usedPassword = null;

  if (passwordToggle.checked) {
    usedPassword = sharePassword.value.trim() || generatePassword();
    sharePassword.value = usedPassword;
    try {
      hashData = await encryptPayload(jsonString, usedPassword);
    } catch {
      showStatus(shareStatus, "Encryption failed. Please try again.", "error");
      return;
    }
  } else {
    hashData = toBase64Url(jsonString);
  }

  const shareUrl = `${BASE_URL}#${hashData}`;

  outputLink.value = shareUrl;
  outputContainer.hidden = false;

  // Show password notice if encrypted
  if (usedPassword) {
    passwordDisplay.textContent = usedPassword;
    passwordNotice.hidden = false;
  } else {
    passwordNotice.hidden = true;
  }

  const pwNote = usedPassword ? " (password-protected)" : "";
  showStatus(shareStatus, `Link generated with ${tabs.length} tab(s)${pwNote}!`, "success");
}

// Pending encrypted hash waiting for password unlock
let pendingEncryptedHash = null;

// --- Open tabs from a shared link ---
async function openTabs() {
  const raw = linkInput.value.trim();
  if (!raw) {
    showStatus(openStatus, "Please paste a GroupShare link.", "error");
    return;
  }

  // Extract hash fragment
  let hash;
  try {
    const url = new URL(raw);
    hash = url.hash.slice(1);
  } catch {
    hash = raw.startsWith("#") ? raw.slice(1) : raw;
  }

  if (!hash) {
    showStatus(openStatus, "Invalid link. No data found.", "error");
    return;
  }

  // Check if encrypted
  if (isEncryptedHash(hash)) {
    // Try cached password first
    const cached = await getCachedPassword(hash);
    if (cached) {
      try {
        const jsonString = await decryptPayload(hash, cached);
        const payload = JSON.parse(jsonString);
        await openPayload(payload);
        return;
      } catch {
        await clearCachedPassword(hash);
      }
    }
    // Show password prompt
    pendingEncryptedHash = hash;
    unlockSection.hidden = false;
    unlockPassword.value = "";
    unlockStatus.hidden = true;
    unlockPassword.focus();
    return;
  }

  // Plain (unencrypted) link
  let payload;
  try {
    payload = JSON.parse(fromBase64Url(hash));
  } catch {
    showStatus(openStatus, "Could not decode link. It may be corrupted.", "error");
    return;
  }

  await openPayload(payload);
}

// --- Unlock encrypted link with password ---
async function unlockWithPassword() {
  const password = unlockPassword.value.trim();
  if (!password) {
    showStatus(unlockStatus, "Please enter a password.", "error");
    return;
  }

  if (!pendingEncryptedHash) return;

  try {
    const jsonString = await decryptPayload(pendingEncryptedHash, password);
    const payload = JSON.parse(jsonString);
    await cachePassword(pendingEncryptedHash, password);
    unlockSection.hidden = true;
    pendingEncryptedHash = null;
    await openPayload(payload);
  } catch {
    showStatus(unlockStatus, "Wrong password. Please try again.", "error");
    unlockPassword.value = "";
    unlockPassword.focus();
  }
}

// --- Open decoded payload as tabs ---
async function openPayload(payload) {
  if (!payload.u || !Array.isArray(payload.u) || payload.u.length === 0) {
    showStatus(openStatus, "No URLs found in this link.", "error");
    return;
  }

  const validUrls = payload.u.filter((u) => {
    try {
      const parsed = new URL(u);
      return ["http:", "https:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  });

  if (validUrls.length === 0) {
    showStatus(openStatus, "No valid URLs found in this link.", "error");
    return;
  }

  const tabIds = [];
  for (const url of validUrls) {
    const tab = await chrome.tabs.create({ url, active: false });
    tabIds.push(tab.id);
  }

  if (tabIds.length > 0) {
    const groupId = await chrome.tabs.group({ tabIds });
    const updateProps = {};
    if (payload.t) updateProps.title = payload.t;
    if (payload.c && GROUP_COLORS[payload.c]) updateProps.color = payload.c;
    if (Object.keys(updateProps).length > 0) {
      await chrome.tabGroups.update(groupId, updateProps);
    }
  }

  showStatus(
    openStatus,
    `Opened ${validUrls.length} tab(s) in group "${payload.t || "Shared Group"}"`,
    "success"
  );
  linkInput.value = "";
}

// --- Copy to clipboard ---
async function copyLink() {
  const text = outputLink.value;
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = "Copied!";
    setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
  } catch {
    outputLink.select();
    document.execCommand("copy");
    copyBtn.textContent = "Copied!";
    setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
  }
}

// --- Event listeners ---
openBtn.addEventListener("click", openTabs);
linkInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") openTabs();
});

groupSelect.addEventListener("change", () => {
  const groupId = parseInt(groupSelect.value);
  if (!isNaN(groupId)) {
    generateBtn.disabled = false;
    showTabPreview(groupId);
  }
});

generateBtn.addEventListener("click", generateLink);
copyBtn.addEventListener("click", copyLink);

// Password toggle — just show/hide the field, no auto-generate yet
passwordToggle.addEventListener("change", () => {
  passwordSection.hidden = !passwordToggle.checked;
  if (!passwordToggle.checked) {
    passwordNotice.hidden = true;
  }
});

// Copy password button
copyPasswordBtn.addEventListener("click", async () => {
  const pw = passwordDisplay.textContent;
  if (!pw) return;
  try {
    await navigator.clipboard.writeText(pw);
    copyPasswordBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';
    setTimeout(() => {
      copyPasswordBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
    }, 1500);
  } catch {}
});

// Unlock button + Enter key
unlockBtn.addEventListener("click", unlockWithPassword);
unlockPassword.addEventListener("keydown", (e) => {
  if (e.key === "Enter") unlockWithPassword();
});

// --- Init ---
loadGroups();
