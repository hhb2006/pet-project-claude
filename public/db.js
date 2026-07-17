// Local data layer. Everything lives in this browser, in IndexedDB — which
// (unlike localStorage) can hold real files, so each pet can keep attachments
// alongside its logs and documents. Nothing is uploaded anywhere.
//
// Shape:
//   pets        { id, name, species, breed, owner, created_at }
//   entries     { id, pet_id, logged_at, behavior_type, trigger, timestamp,
//                 duration, intensity, recovery_period, time_of_day }
//   documents   { id, pet_id, kind: "report" | "note", title, body, created_at }
//   attachments { id, pet_id, name, type, size, blob, created_at }

const DB_NAME = "pet_journal";
const DB_VERSION = 1;
let _dbPromise = null;

function openDB() {
  if (_dbPromise) return _dbPromise;
  _dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("pets")) {
        db.createObjectStore("pets", { keyPath: "id" });
      }
      for (const name of ["entries", "documents", "attachments"]) {
        if (!db.objectStoreNames.contains(name)) {
          const store = db.createObjectStore(name, { keyPath: "id" });
          store.createIndex("pet_id", "pet_id", { unique: false });
        }
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return _dbPromise;
}

function tx(store, mode, fn) {
  return openDB().then(db => new Promise((resolve, reject) => {
    const t = db.transaction(store, mode);
    const s = t.objectStore(store);
    let result;
    try { result = fn(s); } catch (e) { reject(e); return; }
    t.oncomplete = () => resolve(result && result.__req ? result.__req.result : result);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  }));
}

function reqOf(request) { return { __req: request }; }

function uid() {
  return (crypto.randomUUID ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2));
}

function byIndex(store, petId) {
  return openDB().then(db => new Promise((resolve, reject) => {
    const t = db.transaction(store, "readonly");
    const req = t.objectStore(store).index("pet_id").getAll(petId);
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  }));
}

// ── Pets ────────────────────────────────────────────────────────────────────
async function listPets() {
  const pets = await tx("pets", "readonly", s => reqOf(s.getAll()));
  return (pets || []).sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));
}
async function getPet(id) { return tx("pets", "readonly", s => reqOf(s.get(id))); }
async function createPet({ name, species, breed, owner }) {
  const pet = {
    id: uid(), name: name.trim(), species: (species || "").trim(),
    breed: (breed || "").trim(), owner: (owner || "").trim(),
    created_at: new Date().toISOString(),
  };
  await tx("pets", "readwrite", s => s.put(pet));
  return pet;
}
async function updatePet(pet) { await tx("pets", "readwrite", s => s.put(pet)); return pet; }
async function deletePet(id) {
  // Remove the pet and everything belonging to it.
  for (const store of ["entries", "documents", "attachments"]) {
    const rows = await byIndex(store, id);
    await tx(store, "readwrite", s => rows.forEach(r => s.delete(r.id)));
  }
  await tx("pets", "readwrite", s => s.delete(id));
}

// ── Entries ─────────────────────────────────────────────────────────────────
async function listEntries(petId) {
  const rows = await byIndex("entries", petId);
  return rows.sort((a, b) => String(a.logged_at).localeCompare(String(b.logged_at)));
}
async function addEntry(petId, record) {
  const entry = {
    id: uid(), pet_id: petId,
    logged_at: new Date().toISOString(),
    behavior_type: record.behavior_type ?? null,
    trigger: record.trigger ?? null,
    timestamp: record.timestamp ?? null,
    duration: record.duration ?? null,
    intensity: record.intensity ?? null,
    recovery_period: record.recovery_period ?? null,
    time_of_day: record.time_of_day ?? null,
  };
  await tx("entries", "readwrite", s => s.put(entry));
  return entry;
}
async function deleteEntry(id) { await tx("entries", "readwrite", s => s.delete(id)); }

// ── Documents (saved reports + your own notes) ───────────────────────────────
async function listDocuments(petId) {
  const rows = await byIndex("documents", petId);
  return rows.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
}
async function addDocument(petId, { kind, title, body }) {
  const doc = {
    id: uid(), pet_id: petId, kind, title: title.trim(), body,
    created_at: new Date().toISOString(),
  };
  await tx("documents", "readwrite", s => s.put(doc));
  return doc;
}
async function deleteDocument(id) { await tx("documents", "readwrite", s => s.delete(id)); }

// ── Attachments (photos, vet paperwork — stored as real files) ───────────────
async function listAttachments(petId) {
  const rows = await byIndex("attachments", petId);
  return rows.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
}
async function addAttachment(petId, file) {
  const att = {
    id: uid(), pet_id: petId, name: file.name, type: file.type || "application/octet-stream",
    size: file.size, blob: file, created_at: new Date().toISOString(),
  };
  await tx("attachments", "readwrite", s => s.put(att));
  return att;
}
async function deleteAttachment(id) { await tx("attachments", "readwrite", s => s.delete(id)); }

// ── One-time migration from the old single-pet localStorage log ──────────────
async function migrateLegacyLog() {
  const raw = localStorage.getItem("pet_behavior_log");
  if (!raw) return null;
  let legacy;
  try { legacy = JSON.parse(raw); } catch { return null; }
  if (!Array.isArray(legacy) || legacy.length === 0) {
    localStorage.removeItem("pet_behavior_log");
    return null;
  }
  const pets = await listPets();
  if (pets.length > 0) return null; // Already set up; leave it alone.

  const pet = await createPet({ name: "Ame", species: "dog", owner: "hhb" });
  for (const rec of legacy) {
    const entry = { id: uid(), pet_id: pet.id, ...rec };
    entry.logged_at = rec.logged_at || new Date().toISOString();
    entry.time_of_day = rec.time_of_day ?? null;
    await tx("entries", "readwrite", s => s.put(entry));
  }
  localStorage.setItem("pet_behavior_log_migrated", raw);
  localStorage.removeItem("pet_behavior_log");
  return pet;
}
