import source from "./source.js?raw";

const trimmed = source.trim();
const inner = trimmed.replace(/;$/, "");
const code = trimmed.startsWith("(") ? source : "(" + inner + ")";
export const bookmarkletUrl = "javascript:" + encodeURIComponent(code);
export const bookmarkletSource = source;
