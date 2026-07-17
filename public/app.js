// Small shared helpers. Data access lives in db.js.

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

// Falls back to the translated "not recorded" when a field was never captured.
function fmt(v) {
  if (v !== null && v !== undefined && v !== "") return v;
  return typeof t === "function" ? t("not_recorded") : "not recorded";
}

function fileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function download(content, filename, type) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: type || "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
