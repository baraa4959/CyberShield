import { experiences } from "./catalog.js";
import { getStory } from "./stories.js";
import { posterCopy } from "./single-infographic.js";
import { measurePosterLayout } from "./poster-layout.js";
import { locales, getLocale } from "./locales/index.js";
import { infographicIcon } from "./poster-icons.js";
import { createQRCodeURL } from "./qr-generator.js";

const app = document.getElementById("app");
const safe = (x) =>
  String(x ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const configURL = new URL("../config.json", import.meta.url);
const qrURL = new URL("../qr.svg", import.meta.url);
const state = {
  config: null,
  language: null,
  mode: "language",
  presenting: false,
  posterIndex: 0,
  posterHistory: [],
  posterCursor: 0,
  posterQueue: [],
  paused: false,
  posterDeadline: 0,
  posterRemaining: 0,
  experienceId: null,
  nodeId: "start",
  decisions: [],
  lastActive: Date.now(),
  orientation: "auto",
  commandOpen: false,
  posterEnteredAt: 0,
};
const content = () =>
  getLocale(state.language || state.config?.defaultLanguage || "ar");
const ui = () => content().ui;
const label = (ar, en) => (state.language === "ar" ? ar : en);
const nextLanguage = () => {
  const codes = Object.keys(locales);
  return codes[(codes.indexOf(state.language) + 1) % codes.length];
};
const isKioskExperience = () =>
  state.presenting && ["hub", "experience", "complete"].includes(state.mode);
function shareURL() {
  if (state.config?.publicSiteUrl) return state.config.publicSiteUrl;
  try {
    const url = new URL(globalThis.location?.href || "");
    if (
      url.protocol === "https:" &&
      !["localhost", "127.0.0.1"].includes(url.hostname)
    ) {
      url.hash = "";
      url.search = "";
      return url.href;
    }
  } catch {}
  return "";
}
const canQR = () =>
  state.presenting &&
  state.config.showQR &&
  state.config.visitorEnabled &&
  !!shareURL();
const logo = () =>
  state.config.showUniversityLogo
    ? `<div class="university-logo"><img src="${safe(state.config.universityLogoPath)}" alt="${safe(label("شعار الجامعة", "University logo"))}"/></div>`
    : "";
const logoText = () =>
  `${logo()}${state.config.showBrandName ? `<div class="brand-name">${safe(state.config.siteName)}</div>` : ""}`;
function setLanguage(lang) {
  if (!locales[lang]) return;
  state.language = lang;
  document.documentElement.lang = lang;
  document.documentElement.dir = content().dir;
  render();
  if (
    new URLSearchParams(globalThis.location?.search || "").has("controls") &&
    state.config.presentationEnabled &&
    !state.commandOpen
  )
    openCommandBar();
}
function colorVars() {
  document.documentElement.style.setProperty("--primary", state.config.primary);
  document.documentElement.style.setProperty(
    "--secondary",
    state.config.secondary,
  );
}
function getCurrentExperience() {
  return content().experiences[state.experienceId];
}
function resetExperienceSession() {
  state.experienceId = null;
  state.nodeId = "start";
  state.decisions = [];
}
function setMode(mode) {
  state.mode = mode;
  state.lastActive = Date.now();
  render();
}
function openHub() {
  resetExperienceSession();
  setMode("hub");
}
function openExperience(id) {
  if (!experiences.some((e) => e.id === id)) return;
  state.experienceId = id;
  state.nodeId = "start";
  state.decisions = [];
  setMode("experience");
}
function chooseAnswer(index) {
  if (state.mode !== "experience") return;
  const scene = getStory(state.language, state.experienceId)?.scenes[
    state.nodeId
  ];
  if (!scene || !scene.actions[index]) return;
  const selected = scene.actions[index];
  state.decisions.push({ node: state.nodeId, index });
  if (selected.next === "end") {
    setMode("complete");
    return;
  }
  state.nodeId = selected.next;
  setMode("experience");
}
function qrPanel(variant = "side") {
  if (!canQR()) return "";
  const link = shareURL();
  let img = qrURL.href;
  try {
    img = createQRCodeURL(link);
  } catch (e) {
    console.warn("QR generator error", e);
  }
  return `<section class="qr-panel ${variant}"><div class="qr-picture"><img src="${safe(img)}" alt="${safe(ui().qrcodeAlt)}" loading="eager" /></div><div class="qr-copy"><strong>${safe(ui().qrTitle)}</strong><p>${safe(ui().qrSub)}</p><a href="${safe(link)}" target="_blank" rel="noopener noreferrer" dir="ltr">${safe(link)}</a></div></section>`;
}
function languageScreen() {
  return `<main class="language-gate"><div class="language-content">
 ${state.config.showUniversityLogo || state.config.showBrandName ? `<div class="language-brand">${logoText()}</div>` : ""}
 <h1>اختر اللغة <span class="gate-separator">/</span> Choose a language</h1>
 <p>تجارب توعوية تفاعلية <span class="gate-separator">/</span> Interactive security experiences</p>
 <div class="language-buttons">${Object.values(locales)
   .map(
     (l) =>
       `<button data-action="language" data-lang="${safe(l.code)}" class="language-choice"><strong>${safe(l.language)}</strong><span>${l.dir === "rtl" ? "←" : "→"}</span></button>`,
   )
   .join("")}</div></div></main>`;
}
function standardHeader() {
  return `<header class="header"><div class="brand-lockup">${logoText()}</div><button class="language-switch" data-action="switchLanguage" aria-label="${safe(ui().switchLang)}">${safe(locales[nextLanguage()].language)}</button></header>`;
}
function hubScreen() {
  const t = ui();
  return `${standardHeader()}<main class="hub-main"><section class="hub-intro"><h1>${safe(t.chooseExperience)}</h1><p>${safe(t.visitorLead)}</p></section>
 <section class="experience-grid" aria-label="${safe(t.chooseExperience)}">${experiences
   .map((e) => {
     const x = content().experiences[e.id];
     return `<button class="experience-card" data-action="experience" data-id="${e.id}"><h2>${safe(x.title)}</h2><p>${safe(x.description)}</p><span class="card-link">${safe(t.enter)} <span aria-hidden="true">${content().dir === "rtl" ? "←" : "→"}</span></span></button>`;
   })
   .join(
     "",
   )}</section>${state.presenting ? `<div class="hub-qr-section">${qrPanel("compact")}</div>` : ""}</main>`;
}

function phoneNativeContent(scene) {
  const body = safe(scene.body),
    title = safe(scene.title),
    address = safe(scene.address || "");
  const svg = (name) => infographicIcon(name, "native-icon");
  switch (scene.kind) {
    case "messages":
      return `<div class="native-chat"><div class="native-date">${safe(label("اليوم، 9:41 ص", "Today, 9:41 AM"))}</div><div class="native-bubble">${body}${address ? `<span class="native-url" dir="ltr">${address}</span>` : ""}</div><div class="native-compose" aria-hidden="true">${safe(label("رسالة نصية", "Text message"))}<span>＋</span></div></div>`;
    case "call":
      return `<div class="native-call"><div class="native-avatar">${svg("phone")}</div><span class="native-eyebrow">${safe(label("مكالمة واردة", "Incoming call"))}</span><h2>${title}</h2><small>${address || safe(label("رقم غير محفوظ", "Unknown caller"))}</small><div class="native-speech">${body}</div><div class="native-waves"><i></i><i></i><i></i><i></i><i></i></div></div>`;
    case "browser":
      return `<div class="native-browser"><div class="native-address" dir="ltr">⌁ ${address || "example.org"}</div><div class="native-web-card"><span class="native-eyebrow">${safe(scene.app)}</span><h2>${title}</h2><p>${body}</p><div class="native-placeholder-line"></div><div class="native-placeholder-line short"></div></div></div>`;
    case "scanner":
      return `<div class="native-scanner"><div class="native-scanframe">${svg("qr")}<div class="scan-beam"></div></div><p>${body}</p><small dir="ltr">${address}</small></div>`;
    case "permission":
      return `<div class="native-permission"><div class="native-app-symbol">${svg("apps")}</div><div class="native-modal"><h2>${title}</h2><p>${body}</p></div></div>`;
    case "wifi":
      return `<div class="native-wifi"><h2>${title}</h2><p>${body}</p><div class="native-wifi-row">${svg("wifi")}<span>Cafe_Guest</span><span>⌁</span></div><div class="native-wifi-row">${svg("wifi")}<span>Cafe_Guest_Free</span><span>⌁</span></div></div>`;
    case "settings":
      return `<div class="native-settings"><h2>${title}</h2><p>${body}</p><div class="native-settings-row">${svg("shield")}<span>${safe(label("الخصوصية والأمان", "Privacy & security"))}</span><span>›</span></div><div class="native-settings-row">${svg("refresh")}<span>${safe(label("تحديث النظام", "Software update"))}</span><span>›</span></div></div>`;
    case "notification":
      return `<div class="native-notification"><div class="native-clock">9:41</div><div class="native-date">${safe(label("السبت، 10 أكتوبر", "Saturday, October 10"))}</div><div class="native-alert"><strong>${safe(scene.app)}</strong><p>${body}</p></div></div>`;
    case "signin":
      return `<div class="native-signin"><div class="native-app-symbol">${svg("lock")}</div><h2>${title}</h2><p>${body}</p><div class="native-textfield">${safe(label("البريد الإلكتروني", "Email address"))}</div><div class="native-textfield">••••••••••</div></div>`;
    case "passkey":
      return `<div class="native-signin"><div class="native-app-symbol">${svg("key")}</div><div class="native-modal"><h2>${title}</h2><p>${body}</p><div class="native-faceid">◎</div></div></div>`;
    default:
      return `<div class="native-browser"><h2>${title}</h2><p>${body}</p></div>`;
  }
}
function phoneScreen() {
  const story = getStory(state.language, state.experienceId),
    scene = story.scenes[state.nodeId];
  const actions = scene.actions
    .map(
      (a, i) =>
        `<button class="native-action" data-action="answer" data-index="${i}">${safe(a.label)}</button>`,
    )
    .join("");
  return `<div class="real-phone" role="region" aria-label="${safe(label("الهاتف", "Phone"))}"><div class="real-phone-screen" dir="${content().dir}">
 <div class="real-status" dir="ltr"><time>9:41</time><span>●●● ▰</span></div><div class="real-camera" aria-hidden="true"></div>
 <div class="real-app-header"><strong>${safe(scene.app)}</strong><span>${safe(scene.title)}</span></div>
 <div class="real-phone-content" aria-live="polite">${phoneNativeContent(scene)}</div>
 <div class="real-phone-actions">${actions}</div><div class="real-home-indicator"></div></div></div>`;
}
function experienceScreen() {
  return `<main class="phone-only-view"><button class="exit-phone" data-action="hub" aria-label="${safe(label("إغلاق", "Close"))}" title="${safe(label("إغلاق", "Close"))}"><span aria-hidden="true">×</span></button>${phoneScreen()}</main>`;
}
function completedScreen() {
  const story = getStory(state.language, state.experienceId),
    t = ui();
  const decisions = state.decisions
    .map((d, i) => {
      const node = story.scenes[d.node],
        choice = node.actions[d.index];
      const positive = choice.good === true;
      return `<li class="review-item ${positive ? "review-good" : "review-risk"}"><div class="review-status"><span class="review-number" dir="ltr">${String(i + 1).padStart(2, "0")}</span><span class="review-verdict">${safe(positive ? label("قرار سليم", "Good decision") : label("قرار محفوف بالمخاطر", "Risky decision"))}</span></div><strong class="review-choice">${safe(choice.label)}</strong><p class="review-reason">${safe(choice.reason)}</p></li>`;
    })
    .join("");
  const right = state.decisions.reduce(
    (n, d) => n + (story.scenes[d.node].actions[d.index].good ? 1 : 0),
    0,
  );
  const total = state.decisions.length;
  const tip =
    securityTips[state.language]?.[state.experienceId] ||
    securityTips.en[state.experienceId];
  const qrMarkup = state.presenting ? qrPanel("large") : "";
  const qrNote =
    state.presenting && state.config.showQR && !canQR()
      ? `<section class="qr-setup"><strong>${safe(label("متابعة التجارب عبر الهاتف", "Continue on your phone"))}</strong><p>${safe(state.config.visitorEnabled ? label("لإظهار رمز QR محليًا، اضبط PUBLIC_SITE_URL على رابط يمكن لهاتف الزائر فتحه. وعلى موقع HTTPS منشور، يستخدم التطبيق رابط الصفحة تلقائيًا.", "To display QR locally, set PUBLIC_SITE_URL to a URL reachable from phones. On a public HTTPS deployment, the page URL is used automatically.") : label("فعّل ENABLE_VISITOR_MODE وأضف PUBLIC_SITE_URL لعرض الرمز.", "Enable ENABLE_VISITOR_MODE and configure PUBLIC_SITE_URL to display the QR code."))}</p></section>`
      : "";
  return `${standardHeader()}<main class="review-screen"><button class="review-back" data-action="hub">${safe(label("← جميع المواقف", "← All scenarios"))}</button><div class="review-lead"><div class="review-overline">${safe(label("انتهى الموقف", "Scenario complete"))}</div><h1>${safe(label("مراجعة قراراتك", "Your decisions, explained"))}</h1><p>${safe(story.summary)}</p><div class="review-count">${safe(label(`القرارات السليمة: ${right} من ${total}`, `Safer decisions: ${right} of ${total}`))}</div></div><h2 class="review-section-heading">${safe(label("ماذا اخترت؟ ولماذا؟", "What did you choose, and why?"))}</h2><ol class="review-list">${decisions}</ol><section class="security-tip"><span>${safe(label("نصيحة أمنية", "Security tip"))}</span><p>${safe(tip)}</p></section>${qrMarkup}${qrNote}<button class="review-more" data-action="hub">${safe(label("تجربة موقف آخر", "Try another scenario"))}</button></main>`;
}
const securityTips = {
  ar: {
    sms: "عندما تصلك رسالة شحنة، افتح تطبيق شركة التوصيل بنفسك ولا تتبع رابط الرسالة.",
    qr: "افحص عنوان الرابط قبل الدفع عبر QR، وتأكد من عدم وضع ملصق فوق الرمز الأصلي.",
    permissions:
      "امنح التطبيق الصلاحيات التي يحتاجها فقط، وراجع الأذونات الحساسة دوريًا.",
    wifi: "تأكد من اسم الشبكة مع الموظف ولا تدخل كلمة مرور بريدك في صفحة شبكة عامة.",
    otp: "لا تشارك رمز التحقق مع أحد، حتى لو ادعى أنه موظف البنك.",
    update:
      "حمّل تحديثات النظام من إعدادات الجهاز أو الجهة المصنّعة، لا من إعلان في متصفح.",
    zeroClick:
      "حدّث هاتفك بانتظام؛ لا يمكن الحكم على وجود اختراق من إشعار واحد.",
    passkeys:
      "استخدم مفتاح مرور حيثما توفر، وتأكد دائمًا من أنك على الموقع الصحيح.",
    support:
      "لا تمنح التحكم بالشاشة أو الصلاحيات لمتصل مجهول. تواصل مع الدعم من التطبيق الرسمي.",
    friend:
      "عند طلب المال بصورة عاجلة، اتصل بصديقك على رقم تعرفه مسبقًا للتحقق من الطلب.",
  },
  en: {
    sms: "Open the delivery company’s official app yourself rather than trusting a link in a text message.",
    qr: "Inspect the destination before paying with a QR code, especially if the code looks like a sticker.",
    permissions:
      "Grant only permissions an app needs, and regularly review sensitive access.",
    wifi: "Confirm the network name with staff, and never enter your email password into a public Wi-Fi portal.",
    otp: "Never share a verification code, even with someone claiming to work for your bank.",
    update:
      "Get software updates from device settings or the manufacturer, not from browser advertisements.",
    zeroClick:
      "Install security updates regularly. A notification alone is not proof of compromise.",
    passkeys:
      "Use passkeys where available and always check that you are signing into the intended service.",
    support:
      "Never grant remote-control permissions to an unknown caller. Contact support through the official app.",
    friend:
      "Verify urgent payment requests by calling your friend at a number you already know.",
  },
};
function posterScreen() {
  const d = posterCopy[state.language === "en" ? "en" : "ar"];
  const iconFiles = {
    envelope: "envelope.svg",
    apps: "mobile-screen-button.svg",
    phone: "phone-volume.svg",
    wifi: "wifi.svg",
  };
  const title = (i, text) =>
    `<div class="sheet-title"><span class="sheet-count" dir="ltr"><span>${String(i).padStart(2, "0")}</span></span><h2>${safe(text)}</h2></div>`;
  const first = `<section class="sheet-section sheet-threats">${title(1, d.sections[0].title)}<div class="sheet-threat-grid">${d.sections[0].cards.map(([heading, body, icon]) => `<article class="sheet-threat"><div class="sheet-icon"><img src="assets/icons/${iconFiles[icon] || iconFiles.envelope}" alt=""/></div><div><h3>${safe(heading)}</h3><p>${safe(body)}</p></div></article>`).join("")}</div></section>`;
  const second = `<section class="sheet-section sheet-warnings">${title(2, d.sections[1].title)}<div class="sheet-warning-grid">${d.sections[1].bullets.map((b) => `<div class="sheet-warning"><i></i><span>${safe(b)}</span></div>`).join("")}</div></section>`;
  const third = `<section class="sheet-section sheet-protection">${title(3, d.sections[2].title)}<div class="sheet-protect-grid">${d.sections[2].cards.map(([heading, body]) => `<div class="sheet-protect"><img src="assets/icons/circle-check.svg" alt=""/><div><strong>${safe(heading)}</strong><span>${safe(body)}</span></div></div>`).join("")}</div></section>`;
  const fourth = `<section class="sheet-section sheet-response">${title(4, d.sections[3].title)}<div class="sheet-action-grid">${d.sections[3].bullets.map((b) => `<div class="sheet-action"><i></i><span>${safe(b)}</span></div>`).join("")}</div></section>`;
  return `<div class="poster-stage" aria-label="${safe(label("إنفوجرافيك السلامة الرقمية", "Digital safety infographic"))}"><main class="poster-sheet" id="poster-sheet" dir="${content().dir}"><div class="sheet-logo">${state.config.showUniversityLogo ? `<img src="${safe(state.config.posterLogoPath)}" alt="${safe(label("شعار الجامعة", "University logo"))}" onerror="this.style.display='none'"/>` : ""}</div><header class="sheet-hero"><h1>${safe(d.heading[0])}<br>${safe(d.heading[1])}</h1></header><div class="sheet-main"><div class="sheet-main-content">${first}${second}${third}${fourth}</div></div><footer class="sheet-footer"><h2>${safe(d.footer)}</h2><p>${safe(d.footnote)}</p></footer></main></div>`;
}
let posterObserver = null;
let posterFrame = 0;
function fitPortraitPosterText(sheet, landscape) {
  const content = sheet.querySelector(".sheet-main-content");
  if (!content) return;
  // Recheck natural text height after resizing, switching language, or loading fonts.
  content.style.removeProperty("width");
  content.style.removeProperty("transform");
  if (landscape) return;
  const main = sheet.querySelector(".sheet-main");
  const computed = getComputedStyle(main);
  const available =
    main.clientHeight -
    (parseFloat(computed.paddingTop) || 0) -
    (parseFloat(computed.paddingBottom) || 0) -
    1;
  if (available <= 0 || content.scrollHeight <= available) return;

  // Scale both axes equally, allowing text to rewrap in the wider layout box.
  // Unlike clipped fixed-height cards, every section remains visible.
  const applyScale = (scale) => {
    content.style.width = 100 / scale + "%";
    content.style.transform = "scale(" + scale + ")";
  };
  // Layout coordinates also work when the whole kiosk stage is rotated.
  let low = 0.1;
  let high = 1;
  for (let i = 0; i < 14; i++) {
    const candidate = (low + high) / 2;
    applyScale(candidate);
    if (content.scrollHeight * candidate <= available) low = candidate;
    else high = candidate;
  }
  applyScale(low);
}
function fitPoster() {
  const sheet = document.getElementById("poster-sheet");
  if (!sheet) return;
  const outer = sheet.parentElement;
  const availableW = outer.clientWidth,
    availableH = outer.clientHeight;
  // Never measure the artboard's own overflowing content as the viewport.
  // A zero-size first layout is retried when the observer gets its real size.
  if (availableW <= 0 || availableH <= 0) return;
  const layout = measurePosterLayout(availableW, availableH, state.orientation);
  if (!layout) return;
  sheet.classList.toggle("sheet-landscape", layout.landscape);
  sheet.classList.toggle("sheet-portrait", !layout.landscape);
  sheet.style.width = `${layout.artboardWidth}px`;
  sheet.style.height = `${layout.artboardHeight}px`;
  sheet.style.transform = `translate(-50%,-50%) scale(${layout.scale})`;
  fitPortraitPosterText(sheet, layout.landscape);
}
function schedulePosterFit() {
  if (state.mode !== "poster") return;
  if (typeof requestAnimationFrame !== "function") {
    fitPoster();
    return;
  }
  if (posterFrame) cancelAnimationFrame(posterFrame);
  posterFrame = requestAnimationFrame(() => {
    posterFrame = 0;
    fitPoster();
  });
}
function updatePosterObservation() {
  posterObserver?.disconnect();
  posterObserver = null;
  if (state.mode !== "poster") return;
  const outer = document.querySelector?.(".poster-stage");
  if (outer && typeof ResizeObserver === "function") {
    posterObserver = new ResizeObserver(schedulePosterFit);
    posterObserver.observe(outer);
  }
  // The first portrait frame can precede font loading and mobile viewport stabilization.
  schedulePosterFit();
}
function errorScreen(text) {
  return `<div class="error-screen"><p>${safe(text)}</p></div>`;
}
function getPage() {
  if (!state.language) return languageScreen();
  if (!state.config.visitorEnabled && !state.config.presentationEnabled)
    return errorScreen(ui().noModes);
  if (state.mode === "poster") return posterScreen();
  if (state.mode === "hub") return hubScreen();
  if (state.mode === "experience") return experienceScreen();
  if (state.mode === "complete") return completedScreen();
  return hubScreen();
}
function render() {
  app.innerHTML = `<div class="stage ${state.orientation === "landscape" ? "force-landscape" : state.orientation === "portrait" ? "force-portrait" : state.orientation === "upside-down" ? "flip-180" : ""}"><div class="app-shell ${state.mode === "poster" ? "shell-poster" : ""} ${state.mode === "language" ? "shell-language" : ""}">${getPage()}</div></div>`;
  if (state.commandOpen) renderCommandBar();
  updatePosterObservation();
}
function showToast(text) {
  const old = document.getElementById("toast");
  if (old) old.remove();
  const node = document.createElement("div");
  node.className = "toast";
  node.id = "toast";
  node.textContent = text;
  document.body.append(node);
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => node.remove(), 3500);
}
function renderCommandBar() {
  document.getElementById("command-palette")?.remove();
  const bar = document.createElement("form");
  bar.id = "command-palette";
  bar.className = "command-palette";
  bar.setAttribute("role", "dialog");
  bar.setAttribute("aria-label", ui().commandLabel);
  bar.innerHTML = `<span class="command-prefix">&gt;_</span><input id="command-input" type="text" placeholder="${safe(ui().command)}" autocomplete="off" spellcheck="false" aria-label="${safe(ui().commandLabel)}"/><span class="command-esc">Esc</span>`;
  bar.addEventListener("submit", (e) => {
    e.preventDefault();
    const cmd = bar.querySelector("input").value;
    closeCommandBar();
    runCommand(cmd);
  });
  document.body.appendChild(bar);
  bar.querySelector("input").focus();
}
function openCommandBar() {
  if (!state.language || !state.config.presentationEnabled) return;
  state.commandOpen = true;
  renderCommandBar();
}
function closeCommandBar() {
  state.commandOpen = false;
  document.getElementById("command-palette")?.remove();
}
function resetPosterTimer() {
  state.posterRemaining = state.config.posterDurationSeconds * 1000;
  state.posterDeadline = Date.now() + state.posterRemaining;
}
function nextPoster() {
  if (!state.presenting) return;
  resetPosterTimer();
  state.posterEnteredAt = Date.now();
  setMode("poster");
}
function previousPoster() {
  if (!state.presenting) return;
  resetPosterTimer();
  state.posterEnteredAt = Date.now();
  setMode("poster");
}
function startPresentation() {
  if (!state.config.presentationEnabled) {
    showToast(ui().presentationOff);
    return;
  }
  state.presenting = true;
  state.paused = false;
  resetExperienceSession();
  nextPoster();
}
function returnToPosters() {
  if (!state.presenting) {
    openHub();
    return;
  }
  resetExperienceSession();
  resetPosterTimer();
  state.posterEnteredAt = Date.now();
  setMode("poster");
}
function stopPresentation() {
  if (!state.presenting) return;
  if (!state.config.visitorEnabled) {
    showToast(ui().visitorOff);
    return;
  }
  state.presenting = false;
  state.paused = false;
  resetExperienceSession();
  setMode("hub");
}
function pausePoster() {
  if (!state.presenting || state.paused) return;
  state.posterRemaining = Math.max(0, state.posterDeadline - Date.now());
  state.paused = true;
  render();
}
function resumePoster() {
  if (!state.presenting || !state.paused) return;
  state.paused = false;
  state.posterDeadline = Date.now() + state.posterRemaining;
  render();
}
function setOrientation(value) {
  state.orientation = value;
  render();
}
function toggleFullScreen() {
  try {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else
      document.documentElement
        .requestFullscreen?.()
        .catch(() => showToast("Fullscreen requires a supported browser."));
  } catch {}
}
function runCommand(raw) {
  const command = raw.trim().toLowerCase();
  if (!command) return;
  switch (command) {
    case "present":
      startPresentation();
      return;
    case "back":
      if (state.presenting) {
        if (state.mode === "poster") previousPoster();
        else returnToPosters();
      } else if (state.mode === "experience" || state.mode === "complete")
        openHub();
      return;
    case "pause":
      pausePoster();
      return;
    case "resume":
      resumePoster();
      return;
    case "next":
      if (state.presenting) nextPoster();
      return;
    case "stop":
      stopPresentation();
      return;
    case "landscape":
      setOrientation("landscape");
      return;
    case "portrait":
      setOrientation("portrait");
      return;
    case "normal":
      setOrientation("auto");
      return;
    case "rotate-left":
      setOrientation("portrait");
      return;
    case "rotate-right":
      setOrientation("landscape");
      return;
    case "rotate-180":
    case "flip":
      setOrientation("upside-down");
      return;
    case "en":
    case "ar":
      setLanguage(command);
      return;
    case "fullscreen":
      toggleFullScreen();
      return;
    case "home":
      if (state.presenting) returnToPosters();
      else openHub();
      return;
    case "help":
      showToast(ui().help);
      return;
    default:
      if (locales[command]) {
        setLanguage(command);
        return;
      }
      showToast(ui().invalidCommand);
      return;
  }
}
function recordActivity() {
  if (isKioskExperience()) state.lastActive = Date.now();
}
function enterInteractiveMode(force = false) {
  if (state.mode !== "poster" || !state.presenting || state.commandOpen) return;
  if (!force && Date.now() - state.posterEnteredAt < 320) return;
  openHub();
}
function tick() {
  if (state.commandOpen || !state.language) return;
  if (
    isKioskExperience() &&
    Date.now() - state.lastActive >= state.config.experienceIdleSeconds * 1000
  ) {
    returnToPosters();
    return;
  }
  if (
    state.presenting &&
    state.mode === "poster" &&
    !state.paused &&
    Date.now() >= state.posterDeadline
  ) {
    resetPosterTimer();
  }
}
app.addEventListener("click", (event) => {
  const node = event.target.closest("[data-action]");
  if (!node) return;
  recordActivity();
  const { action } = node.dataset;
  switch (action) {
    case "language":
      setLanguage(node.dataset.lang);
      if (state.config.visitorEnabled) openHub();
      else startPresentation();
      return;
    case "switchLanguage":
      setLanguage(nextLanguage());
      return;
    case "experience":
      openExperience(node.dataset.id);
      return;
    case "hub":
      openHub();
      return;
    case "answer":
      chooseAnswer(Number(node.dataset.index));
      return;
  }
});
window.addEventListener("keydown", (event) => {
  const target = event.target;
  const typing =
    target &&
    (target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
  const opener =
    (event.altKey &&
      !event.ctrlKey &&
      !event.metaKey &&
      event.code === "KeyK") ||
    event.key === "F2" ||
    (event.ctrlKey && !event.shiftKey && event.code === "Slash");
  if (opener && (!typing || state.commandOpen)) {
    event.preventDefault();
    state.commandOpen ? closeCommandBar() : openCommandBar();
    return;
  }
  if (state.commandOpen) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeCommandBar();
    }
    return;
  }
  if (!state.language) return;
  recordActivity();
  if (event.key === "Escape") {
    if (state.mode === "experience" || state.mode === "complete") openHub();
    else if (state.mode === "hub" && state.presenting) returnToPosters();
    return;
  }
  if (state.presenting && state.mode === "poster") {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      state.language === "ar" ? nextPoster() : previousPoster();
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      state.language === "ar" ? previousPoster() : nextPoster();
    }
    if (event.key.toLowerCase() === "e") openHub();
  }
});
// First real mouse movement or touch during signage opens experiences. No CTA is necessary.
window.addEventListener(
  "pointermove",
  (event) => {
    if (event.pointerType === "mouse") {
      if (state.presenting && state.mode === "poster") enterInteractiveMode();
      else recordActivity();
    }
  },
  { passive: true },
);
window.addEventListener(
  "pointerdown",
  (event) => {
    if (state.presenting && state.mode === "poster" && !state.commandOpen) {
      enterInteractiveMode(true);
      return;
    }
    recordActivity();
  },
  { passive: true },
);
window.addEventListener(
  "touchstart",
  () => {
    if (state.presenting && state.mode === "poster") enterInteractiveMode(true);
    else recordActivity();
  },
  { passive: true },
);
window.addEventListener("resize", schedulePosterFit);
window.visualViewport?.addEventListener?.("resize", schedulePosterFit);
if (document.fonts?.ready) document.fonts.ready.then(schedulePosterFit);
window.addEventListener("visibilitychange", () => {
  if (
    document.visibilityState === "visible" &&
    state.presenting &&
    state.mode === "poster" &&
    !state.paused
  )
    resetPosterTimer();
});
async function boot() {
  try {
    const response = await fetch(configURL, { cache: "no-store" });
    if (!response.ok) throw Error("Config not found");
    state.config = await response.json();
    colorVars();
    state.language = null;
    render();
    setInterval(tick, 200);
  } catch (err) {
    console.error(err);
    app.innerHTML = errorScreen(
      "Could not load config.json. Run npm run dev, or deploy the generated dist/ folder.",
    );
  }
}
boot();
