let inFrame;

try {
  inFrame = window !== top;
} catch (e) {
  inFrame = true;
}
if (!store.get("ab")) store.set("ab", true);
if (!inFrame && !navigator.userAgent.includes("Firefox") && store.get("ab") === "true") {
  const popup = open("about:blank", "_blank");
  if (popup && !popup.closed) {
    const doc = popup.document;
    const iframe = doc.createElement("iframe");
    const style = iframe.style;
    const link = doc.createElement("link");
    const script = doc.createElement("script");

    const name = store.get("name") || "My Drive - Google Drive";
    const icon = store.get("icon") || "https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png";

    doc.title = (window.laceTitle || (s => s))(name);
    link.rel = "icon";
    link.href = icon;

    iframe.src = location.href;
    style.position = "fixed";
    style.top = style.bottom = style.left = style.right = 0;
    style.border = style.outline = "none";
    style.width = style.height = "100%";

    script.textContent = `
      window.onbeforeunload = function (event) {
        const confirmationMessage = 'Leave Site?';
        (event || window.event).returnValue = confirmationMessage;
        return confirmationMessage;
      };
    `;

    doc.head.appendChild(link);
    doc.head.appendChild(script);
    doc.body.appendChild(iframe);

    const pLink = store.get("pLink") || getRandomUrl();
    location.replace(pLink);
  }
}

const SplashT = [
  "Bloat-free proxy",
  "No predatory tracking",
  "speed, guranteed",
  "follow me on X/twitter @silica_jello",
  "visit my website silicajello.com",
  "*weezer riff*",
  "visit my project Ternbook!",
  "zero interruptions guranteed",
  "meowwwwwwww :3",
];

let SplashI = Math.floor(Math.random() * SplashT.length);
const SplashE = document.getElementById("splash");

const laceSplash = window.laceTitle ? s => window.laceTitle(s, false) : s => s;
function paintSplash() {
  SplashE.innerText = laceSplash(SplashT[SplashI]);
}

function cycleSplash() {
  SplashI = (SplashI + 1) % SplashT.length;
  paintSplash();
  SplashE.style.animation = "none";
  void SplashE.offsetWidth;
  SplashE.style.animation = "";
}

paintSplash();
SplashE.addEventListener("click", cycleSplash);


function randRange(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

(function buildHeading() {
  const heading = document.querySelector("h1.title");
  if (!heading) return;
  const codes = [73, 110, 116, 101, 114, 115, 116, 101, 108, 108, 97, 114];
  const twins = { 116: "т", 101: "е", 115: "ѕ", 97: "а", 73: "І" };
  const invisible = ["​", "‌", "‍", "⁠"];
  const wrappers = ["span", "x-a", "x-b", "ab-x", "s-p", "n-a"];
  const rand = n => Math.floor(Math.random() * n);
  const frag = document.createDocumentFragment();
  for (let i = 0; i < codes.length; ) {
    const size = 1 + rand(3);
    let piece = "";
    for (const code of codes.slice(i, i + size)) piece += twins[code] && Math.random() < 0.4 ? twins[code] : String.fromCharCode(code);
    i += size;
    const node = document.createElement(wrappers[rand(wrappers.length)]);
    node.textContent = piece;
    frag.appendChild(node);
    if (i < codes.length) frag.appendChild(document.createTextNode(invisible[rand(invisible.length)]));
  }
  heading.replaceChildren(frag);
}
)
  
function popoutTab() {
  const activeIframe = document.querySelector("#frame-container iframe.active");
  if (!activeIframe) {
    console.error("No active iframe found");
    return;
  }

  const newWindow = window.open("about:blank", "_blank");
  if (!newWindow) return;

  const cloakName = store.get("name") || "My Drive - Google Drive";
  const cloakIcon = store.get("icon") || "https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png";

  newWindow.document.title = (window.laceTitle || addressBar.laceZeroWidth)(cloakName);

  const link = newWindow.document.createElement("link");
  link.rel = "icon";
  link.href = encodeURI(cloakIcon);
  newWindow.document.head.appendChild(link);

  const newIframe = newWindow.document.createElement("iframe");
  const style = newIframe.style;
  style.position = "fixed";
  style.top = style.bottom = style.left = style.right = 0;
  style.border = style.outline = "none";
  style.width = style.height = "100%";
  newIframe.src = activeIframe.src;

  newWindow.document.body.appendChild(newIframe);
}

();
