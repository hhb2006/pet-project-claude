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

// Picks the pet's active avatar image (cartoon or original), or null to fall
// back to the species emoji.
function activeAvatarSrc(pet) {
  if (!pet) return null;
  if (pet.avatar_kind === "cartoon" && pet.avatar_cartoon) return pet.avatar_cartoon;
  if (pet.avatar_original) return pet.avatar_original;
  return null;
}
function avatarHTML(pet) {
  const src = activeAvatarSrc(pet);
  return src ? `<img class="avatar-img" src="${esc(src)}" alt="" />` : emojiFor(pet.species);
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
