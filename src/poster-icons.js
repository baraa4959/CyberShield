// Lightweight, first-party SVG icon library: one consistent stroke style, no external requests.
const paths = {
  phone:
    '<rect x="27" y="8" width="42" height="80" rx="9"/><path d="M42 18h12M44 76h8"/>',
  message:
    '<path d="M14 22h68v48H43L23 83V70h-9z"/><path d="M29 38h39M29 51h26"/>',
  scan: '<path d="M28 11H11v17M68 11h17v17M11 68v17h17M85 68v17H68"/><path d="M34 34h28v28H34zM42 42h12v12H42z"/>',
  key: '<circle cx="33" cy="43" r="20"/><path d="M53 43h32v11H72v11H60V54h-7M29 43h7"/>',
  apps: '<rect x="13" y="13" width="30" height="30" rx="5"/><rect x="53" y="13" width="30" height="30" rx="5"/><rect x="13" y="53" width="30" height="30" rx="5"/><rect x="53" y="53" width="30" height="30" rx="5"/>',
  wifi: '<path d="M12 36c20-19 52-19 72 0M25 51c13-12 33-12 46 0M39 64c5-5 13-5 18 0"/><circle cx="48" cy="77" r="4"/>',
  refresh:
    '<path d="M77 40c-4-17-14-25-30-25-13 0-23 7-29 18M18 18v17h18M19 55c4 17 14 25 30 25 13 0 23-7 29-18M78 78V61H60"/>',
  eye: '<path d="M8 48c11-18 25-27 40-27s29 9 40 27C77 66 63 75 48 75S19 66 8 48z"/><circle cx="48" cy="48" r="11"/>',
  shield:
    '<path d="M48 8 79 21v23c0 23-13 36-31 44C30 80 17 67 17 44V21L48 8z"/><path d="M35 48l9 9 18-20"/>',
  search: '<circle cx="40" cy="39" r="24"/><path d="m58 58 22 22"/>',
  layers:
    '<path d="m48 12 37 22-37 22L11 34 48 12zM11 49l37 22 37-22M11 64l37 22 37-22"/>',
  info: '<circle cx="48" cy="48" r="34"/><path d="M48 44v22M48 29v2"/>',
  lock: '<rect x="25" y="41" width="46" height="40" rx="7"/><path d="M34 41V30a14 14 0 0 1 28 0v11"/>',
  qr: '<path d="M10 10h32v32H10zM20 20h12v12H20zM54 10h32v32H54zM64 20h12v12H64zM10 54h32v32H10zM20 64h12v12H20zM54 54h13v13H54zM79 55v13M55 79h13M79 78v8"/>',
};
const posterMap = {
  zeroClick: "phone",
  smishing: "message",
  qr: "qr",
  otp: "key",
  permissions: "apps",
  wifi: "wifi",
  updates: "refresh",
  passkeys: "key",
  spyware: "eye",
  challenge: "shield",
};
export function infographicIcon(name, className = "info-icon") {
  return `<svg class="${className}" viewBox="0 0 96 96" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name] || paths.info}</svg>`;
}
export function posterIcon(id) {
  return infographicIcon(posterMap[id] || "shield", "poster-svg");
}
