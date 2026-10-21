// Theme is applied immediately, to prevent flashing on page load
(() => {
 
  window.applyTheme = applyTheme;
  applyTheme(themeid);

  const PROXY_KEY = "proxy";
  const ALLOWED = ["uv", "sj"];
  const DEFAULT = "sj";

  function initProxy() {
    const current = store.get(PROXY_KEY);
    if (current === null) {
      store.set(PROXY_KEY, DEFAULT);
      return DEFAULT;
    }
    if (ALLOWED.includes(current)) {
      return current;
    }
    store.set(PROXY_KEY, DEFAULT);
    return DEFAULT;
  }

  window.resolveProxyChoice = initProxy;
  window.resolveProxyChoice();
})();

for (const cloakKey of ["name", "CustomName"]) {
  if (store.get(cloakKey) === "Home") store.set(cloakKey, "Нome");
}

window.backgroundUrlFor = key => (key && window.BACKGROUND_LIBRARY[key]?.url) || "";

Object.defineProperty(window, "isInTabMode", { get: () => Boolean(document.getElementById("frame-container")) });

function inShell() {
  return document.body?.dataset.shell === "true";
}

function reconstructSafeUrl(raw) {
  if (!raw || typeof raw !== "string") return null;
  try {
    const parsed = new URL(raw);
    const allowed = ["https:", "http:", "data:"];
    if (!allowed.includes(parsed.protocol)) return null;
    return parsed.href;
  } catch {
    if (typeof raw === "string" && !raw.includes(":")) return raw;
    return null;
  }
}

const zeroWidth = ["​", "‌", "‍", "⁠", "﻿"];
const titleHomoglyphs = {
  a: "а", c: "с", e: "е", i: "і", j: "ј", o: "о", p: "р", s: "ѕ", x: "х", y: "у",
  A: "А", B: "В", C: "С", E: "Е", H: "Н", I: "І", J: "Ј", K: "К", M: "М", O: "О", P: "Р", S: "Ѕ", T: "Т", X: "Х", Y: "Ү",
};
function laceTitle(text, homoglyphs = true) {
  const points = Array.from(text || "");
  const pick = () => zeroWidth[Math.floor(Math.random() * zeroWidth.length)];
  let out = "";
  for (let i = 0; i < points.length; i++) {
    const swap = homoglyphs && titleHomoglyphs[points[i]] && Math.random() < 0.3;
    out += swap ? titleHomoglyphs[points[i]] : points[i];
    if (i < points.length - 1) {
      out += pick();
      if (Math.random() < 0.35) out += pick();
    }
  }
  return out;
}
window.laceTitle = laceTitle;

const NAV_WRAPPERS = ["span", "x-a", "x-b", "ab-x", "s-p", "n-a", "r-e", "d-l", "q-x"];
const NAV_ZERO_WIDTH = ["​", "‌", "‍", "⁠"];
const NAV_HOMOGLYPHS = { a: "а", c: "с", e: "е", i: "і", k: "к", m: "м", o: "о", p: "р", s: "ѕ", t: "т", x: "х", y: "у" };

function navEntities(text) {
  let out = "";
  for (const ch of text) out += `&#${ch.codePointAt(0)};`;
  return out;
}

function navWrap(inner) {
  const tag = NAV_WRAPPERS[Math.floor(Math.random() * NAV_WRAPPERS.length)];
  return `<${tag}>${inner}</${tag}>`;
}

function obfuscateNav(text) {
  const points = [...text];
  let out = "";
  let first = true;
  for (let i = 0; i < points.length; ) {
    const size = 1 + Math.floor(Math.random() * 2);
    const chunk = points
      .slice(i, i + size)
      .map(ch => {
        const glyph = NAV_HOMOGLYPHS[ch.toLowerCase()];
        return glyph && Math.random() < 0.6 ? glyph : ch;
      })
      .join("");
    i += size;
    if (!first) out += navWrap(navEntities(NAV_ZERO_WIDTH[Math.floor(Math.random() * NAV_ZERO_WIDTH.length)]));
    out += navWrap(navEntities(chunk));
    first = false;
  }
  return out;
}

document.addEventListener("DOMContentLoaded", () => {
  const blockedHostnames = ["gointerstellar.app"];

  if (!blockedHostnames.includes(window.location.hostname)) {
    const script = document.createElement("script");
    script.type = "text/javascript";
    document.body.appendChild(script);
 

  const nav = document.querySelector(".nav-bar");

  if (nav) {
    
    const html = `
      <div id="icon-container">
        <a class="icon" href="/home"><img alt="nav" id="nav-logo" src="${LogoUrl}"/></a>
      </div>
      <div class="nav-bar-right">
      <select id="pChange">
                  <option value="sj">Scramjet (Default)</option>
                  <option value="uv">Ultraviolet</option>
                </select>
      </div>`;
    nav.innerHTML = html;
  }

  // Favicon and Name Logic.
  const icon = document.getElementById("tab-favicon");
  const title = document.getElementById("page-title");
  const defaultTitle = title?.textContent ?? "";
  const defaultIcon = icon?.getAttribute("href") ?? "";
  function applyCloak() {
    const cloakName = store.get("CustomName") || store.get("name");
    const cloakIcon = store.get("CustomIcon") || store.get("icon");
    if (title) title.textContent = laceTitle(cloakName || defaultTitle);
    const safeIcon = cloakIcon ? reconstructSafeUrl(cloakIcon) : null;
    if (icon) icon.setAttribute("href", safeIcon || defaultIcon);
  }
  applyCloak();
  if (inShell()) window.addEventListener("storage", applyCloak);

  const DEFAULT_PANIC_KEYS = ["`"];
  const DEFAULT_PANIC_LINK = "https://google.com";

  let panicKeysRaw;
  let panicKeys = DEFAULT_PANIC_KEYS;
  function currentPanicKeys() {
    const raw = store.get("eventKey");
    if (raw !== panicKeysRaw) {
      panicKeysRaw = raw;
      let parsed = null;
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = null;
      }
      panicKeys = Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_PANIC_KEYS;
    }
    return panicKeys;
  }

  function currentPanicLink() {
    return reconstructSafeUrl(store.get("pLink") || DEFAULT_PANIC_LINK) ?? DEFAULT_PANIC_LINK;
  }

  const panicAnchor = document.createElement("a");
  panicAnchor.style.display = "none";
  document.body.appendChild(panicAnchor);

  let pressedKeys = [];
  document.addEventListener("keydown", event => {
    const keys = currentPanicKeys();
    pressedKeys.push(event.key);
    if (pressedKeys.length > keys.length) pressedKeys = pressedKeys.slice(-keys.length);
    if (pressedKeys.length === keys.length && keys.every((key, i) => key === pressedKeys[i])) {
      panicAnchor.href = currentPanicLink();
      panicAnchor.target = "_top";
      panicAnchor.click();
      pressedKeys = [];
    }
  });

  const savedBackgroundImage = store.get("backgroundImage");
  const isTabsPage = Boolean(document.getElementById("frame-container"));
  const storedMode = store.get("backgroundMode");
  const legacyCustom = storedMode === "custom" || (!storedMode && savedBackgroundImage && savedBackgroundImage !== "none");
  const backgroundMode = legacyCustom ? "default" : storedMode || (savedBackgroundImage === "none" ? "none" : "gradient");
  const storedImageMode = store.get("backgroundImageMode");
  const imageMode = legacyCustom || storedImageMode === "custom" ? "custom" : storedImageMode === "all" ? "all" : "none";
  const backgroundBlur = Math.max(0, Math.min(100, Number(store.get("backgroundBlur")) || 0));
  document.body.style.setProperty("--background-blur", backgroundBlur);

  if (backgroundMode === "gradient") {
    document.body.dataset.background = "gradient";
    document.body.dataset.gradient = store.get("gradientStyle") || "multi";
  } else if (backgroundMode === "none") {
    document.body.dataset.background = "solid";
  }

  const libraryBackground = imageMode === "all" ? backgroundUrlFor(store.get("backgroundKey")) : "";
  if (!isTabsPage && ((imageMode === "custom" && savedBackgroundImage && savedBackgroundImage !== "none") || libraryBackground)) {
    const safeBackground = libraryBackground || reconstructSafeUrl(savedBackgroundImage);
    if (safeBackground) {
      document.body.dataset.customBackground = "true";
      document.body.style.setProperty("--custom-background-image", `url('${safeBackground}')`);
    }
  }

  if (!inShell() && !document.querySelector('script[src="/assets/js/particles.js"]')) {
    const particleScript = document.createElement("script");
    particleScript.src = "/assets/js/particles.js";
    document.head.appendChild(particleScript);
  }

  // Pointer Effects — cursor.js is only loaded when an effect is active
  
