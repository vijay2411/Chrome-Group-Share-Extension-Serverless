// --- Config ---
// Change this to your GitHub Pages URL after deploying the docs/ folder
const BASE_URL = "https://vedantvijay.github.io/GroupShareExtension/share/";

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

  const encoded = toBase64Url(JSON.stringify(payload));
  const shareUrl = `${BASE_URL}#${encoded}`;

  outputLink.value = shareUrl;
  outputContainer.hidden = false;
  showStatus(shareStatus, `Link generated with ${tabs.length} tab(s)!`, "success");
}

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
    // Maybe just the hash portion was pasted
    hash = raw.startsWith("#") ? raw.slice(1) : raw;
  }

  if (!hash) {
    showStatus(openStatus, "Invalid link. No data found.", "error");
    return;
  }

  let payload;
  try {
    payload = JSON.parse(fromBase64Url(hash));
  } catch {
    showStatus(openStatus, "Could not decode link. It may be corrupted.", "error");
    return;
  }

  if (!payload.u || !Array.isArray(payload.u) || payload.u.length === 0) {
    showStatus(openStatus, "No URLs found in this link.", "error");
    return;
  }

  // Validate URLs
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

  // Open tabs and group them
  const tabIds = [];
  for (const url of validUrls) {
    const tab = await chrome.tabs.create({ url, active: false });
    tabIds.push(tab.id);
  }

  // Create a tab group with the shared name and color
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
    // Fallback
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

// --- Init ---
loadGroups();
