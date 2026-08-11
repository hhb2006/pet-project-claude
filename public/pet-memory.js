// Builds a compact, serializable snapshot of locally stored pet records for
// chat personalization. Blobs and image pixels are intentionally never copied;
// only the vision model's bounded text note can become album memory.
(function exposePetMemory(root) {
  function build({ entries = [], documents = [], attachments = [] } = {}) {
    const logEntries = newest(entries, "logged_at").slice(0, 24).map(entry => ({
      logged_at: text(entry.logged_at, 40),
      behavior: text(entry.behavior_type, 180),
      trigger: text(entry.trigger, 180),
      when: text(entry.timestamp, 180),
      duration: text(entry.duration, 120),
      intensity: finiteNumber(entry.intensity),
      recovery: text(entry.recovery_period, 180),
    }));

    const archiveDocuments = newest(documents, "created_at").slice(0, 14).map(document => ({
      kind: document.kind === "report" ? "report" : "note",
      title: text(document.title, 240),
      body: text(document.body, 1200),
      created_at: text(document.created_at, 40),
      edited_at: text(document.edited_at, 40),
    }));

    const archiveFiles = newest(attachments, "created_at")
      .filter(attachment => !isPhoto(attachment))
      .slice(0, 16)
      .map(attachment => ({
        name: text(attachment.name, 240),
        description: text(attachment.caption, 400),
        type: text(attachment.type, 120),
        created_at: text(attachment.created_at, 40),
        edited_at: text(attachment.edited_at, 40),
      }));

    const albumPhotos = newest(attachments, "created_at")
      .filter(attachment => isPhoto(attachment) && attachment.ai_description)
      .slice(0, 16)
      .map(attachment => ({
        taken_at: text(attachment.taken_at || attachment.created_at, 40),
        owner_caption: text(attachment.caption, 400),
        visual_note: text(attachment.ai_description, 1200),
        analyzed_at: text(attachment.ai_analyzed_at, 40),
      }));

    return {
      log_entries: fitToBudget(logEntries, 6500),
      archive_documents: fitToBudget(archiveDocuments, 7500),
      archive_files: fitToBudget(archiveFiles, 1800),
      album_photos: fitToBudget(albumPhotos, 7500),
    };
  }

  function newest(items, dateField) {
    return (Array.isArray(items) ? items : []).slice().sort((a, b) =>
      String(b && b[dateField] || "").localeCompare(String(a && a[dateField] || "")));
  }

  function isPhoto(attachment) {
    return attachment && (attachment.kind === "photo" ||
      (!attachment.kind && String(attachment.type || "").startsWith("image/")));
  }

  function text(value, maxLength) {
    if (value === null || value === undefined) return "";
    return String(value).trim().slice(0, maxLength);
  }

  function finiteNumber(value) {
    if (value === null || value === undefined || String(value).trim() === "") return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function fitToBudget(items, maxChars) {
    const result = [];
    let used = 0;
    for (const item of items) {
      const size = JSON.stringify(item).length;
      if (used + size > maxChars) continue;
      result.push(item);
      used += size;
    }
    return result;
  }

  root.PetMemory = Object.freeze({ build });
})(globalThis);
