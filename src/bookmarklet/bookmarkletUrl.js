import source from "./source.js?raw";

const trimmed = source.trim();
const code = trimmed.startsWith("(") ? source : "(" + source + ")";
export const bookmarkletUrl = "javascript:" + encodeURIComponent(code);
export const bookmarkletSource = source;
