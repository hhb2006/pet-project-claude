// Pure client-side filtering for the pet log. Keeping this separate from the
// page makes the behavior easy to verify without touching IndexedDB or the UI.
(function exposePetLogFilter(root) {
  const DAY_MS = 24 * 60 * 60 * 1000;

  function filterEntries(entries, options = {}) {
    const query = String(options.query || "").trim().toLocaleLowerCase();
    const filter = options.filter || "all";
    const now = Number.isFinite(options.now) ? options.now : Date.now();
    const searchText = typeof options.searchText === "function"
      ? options.searchText
      : defaultSearchText;

    return (Array.isArray(entries) ? entries : []).filter(entry => {
      if (query && !String(searchText(entry)).toLocaleLowerCase().includes(query)) return false;
      if (filter === "last7" && !withinDays(entry.logged_at, 7, now)) return false;
      if (filter === "last30" && !withinDays(entry.logged_at, 30, now)) return false;
      const intensity = Number(entry.intensity);
      if (filter === "high" && (!Number.isFinite(intensity) || intensity < 7)) return false;
      if (filter === "trigger" && !String(entry.trigger || "").trim()) return false;
      return true;
    });
  }

  function withinDays(value, days, now) {
    const timestamp = Date.parse(value);
    return Number.isFinite(timestamp) && timestamp >= now - days * DAY_MS && timestamp <= now;
  }

  function defaultSearchText(entry) {
    return [
      entry.behavior_type,
      entry.trigger,
      entry.timestamp,
      entry.duration,
      entry.intensity,
      entry.recovery_period,
      entry.logged_at,
    ].filter(value => value !== null && value !== undefined).join(" ");
  }

  root.PetLogFilter = Object.freeze({ filterEntries });
})(globalThis);
