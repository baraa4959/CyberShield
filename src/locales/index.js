import ar from "./ar.js";
import en from "./en.js";

// Add a new locale here and create locales/<language-code>.js using the same keys.
export const locales = { ar, en };
export const getLocale = (code) => locales[code] ?? locales.ar;
