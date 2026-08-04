// Pet avatars. A photo never leaves the browser: it is resized into a square
// on a local canvas and saved locally. Without a photo, the selected species'
// emoji is shown immediately as the default avatar.

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = src;
  });
}

async function fileToSquareDataUrl(file, size = 240) {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const canvas = document.createElement("canvas");
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext("2d");
    const scale = Math.max(size / img.width, size / img.height);
    const w = img.width * scale, h = img.height * scale;
    ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
    return canvas.toDataURL("image/jpeg", 0.88);
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Builds the default / uploaded-photo picker into `mountEl` and returns a
// small controller. `getSpecies()` supplies the default emoji live.
function createAvatarPicker(mountEl, { getSpecies } = {}) {
  mountEl.innerHTML = `
    <div class="avatar-picker">
      <div class="avatar-preview" data-role="preview" aria-live="polite"></div>
      <div class="avatar-controls">
        <div class="avatar-source-options">
          <button type="button" data-source="default">🐾 <span data-i18n="avatar_default"></span></button>
          <button type="button" data-source="photo">📷 <span data-i18n="avatar_upload"></span></button>
        </div>
        <input type="file" accept="image/*" data-role="file" hidden />
        <p class="hint avatar-hint" data-i18n="avatar_hint"></p>
      </div>
    </div>`;

  const preview = mountEl.querySelector('[data-role="preview"]');
  const fileInput = mountEl.querySelector('[data-role="file"]');
  const defaultBtn = mountEl.querySelector('[data-source="default"]');
  const photoBtn = mountEl.querySelector('[data-source="photo"]');

  let original = null;
  let kind = "emoji";

  function renderPreview() {
    if (kind === "photo" && original) {
      preview.innerHTML = `<img src="${original}" alt="" />`;
    } else {
      const species = getSpecies ? getSpecies() : "";
      preview.textContent = (typeof emojiFor === "function") ? emojiFor(species) : "🐾";
    }
    defaultBtn.classList.toggle("active", kind === "emoji");
    photoBtn.classList.toggle("active", kind === "photo");
  }

  defaultBtn.addEventListener("click", () => {
    original = null;
    kind = "emoji";
    fileInput.value = "";
    renderPreview();
  });
  photoBtn.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", async () => {
    const file = fileInput.files[0];
    fileInput.value = "";
    if (!file) return;
    photoBtn.disabled = true;
    try {
      original = await fileToSquareDataUrl(file);
      kind = "photo";
      renderPreview();
    } catch {
      original = null;
      kind = "emoji";
      renderPreview();
    } finally {
      photoBtn.disabled = false;
    }
  });

  renderPreview();

  return {
    refreshEmoji() { if (kind === "emoji") renderPreview(); },
    getAvatar() {
      return {
        avatar_kind: kind,
        avatar_original: original,
        avatar_cartoon: null,
      };
    },
    setValues(pet) {
      if (pet && (pet.avatar_original || pet.avatar_cartoon)) {
        // Preserve the currently displayed legacy cartoon, but treat it as a
        // regular uploaded image from now on.
        original = pet.avatar_kind === "cartoon" && pet.avatar_cartoon
          ? pet.avatar_cartoon
          : pet.avatar_original || pet.avatar_cartoon;
        kind = "photo";
      } else {
        original = null;
        kind = "emoji";
      }
      renderPreview();
    },
    reset() {
      original = null;
      kind = "emoji";
      fileInput.value = "";
      renderPreview();
    },
  };
}
