// Shared helpers for all three tools. One log, stored privately in the browser,
// is read and written by the Logger, the Analyzer, and Ame's Journal alike.

const STORAGE_KEY = "pet_behavior_log";

function loadLog() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function saveLog(log) { localStorage.setItem(STORAGE_KEY, JSON.stringify(log)); }
function addEntry(entry) { const log = loadLog(); log.push(entry); saveLog(log); return log; }
function entryCount() { return loadLog().length; }

function downloadJSON() {
  const blob = new Blob([JSON.stringify(loadLog(), null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "pet_behavior_log.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

function fmt(v) { return (v === null || v === undefined || v === "") ? "not recorded" : v; }

// Render the shared top navigation into any element with id="nav".
function renderNav() {
  const el = document.getElementById("nav");
  if (!el) return;
  const here = location.pathname.replace(/\/$/, "") || "/index.html";
  const links = [
    ["/index.html", "Home"],
    ["/log.html", "Log"],
    ["/analyze.html", "Analyze"],
    ["/journal.html", "Journal"],
  ];
  el.className = "tabs";
  el.innerHTML = links.map(([href, label]) => {
    const active = here.endsWith(href) || (here === "/" && href === "/index.html");
    return `<a href="${href}" class="${active ? "active" : ""}">${label}</a>`;
  }).join("");
}

document.addEventListener("DOMContentLoaded", renderNav);
