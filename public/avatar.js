// Pet avatars. A photo never leaves the browser: it's resized into a square
// on a local canvas, and the "cartoon" option is a pixel filter (posterize +
// edge darkening) computed on-device — a stylised look, not generated art.

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

// Flattens colors into bands and darkens strong edges (Sobel) — a quick
// cartoon-ish stylisation that runs entirely on-device.
async function cartoonifyDataUrl(dataUrl, size = 240) {
  const img = await loadImage(dataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, size, size);
  const imageData = ctx.getImageData(0, 0, size, size);
  const { data, width, height } = imageData;

  const gray = new Float32Array(width * height);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    gray[p] = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
  }

  const levels = 6;
  const step = 255 / (levels - 1);
  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      data[i + c] = Math.min(255, Math.round(Math.round(data[i + c] / step) * step) * 1.05);
    }
  }

  const gx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const gy = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let sx = 0, sy = 0, k = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const v = gray[(y + dy) * width + (x + dx)];
          sx += v * gx[k]; sy += v * gy[k]; k++;
        }
      }
      if (Math.sqrt(sx * sx + sy * sy) > 90) {
        const idx = (y * width + x) * 4;
        data[idx] *= 0.35; data[idx + 1] *= 0.35; data[idx + 2] *= 0.35;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/jpeg", 0.88);
}

// Builds the upload / original / cartoon picker into `mountEl` and returns
// a small controller. `getSpecies()` supplies the fallback emoji live as the
// species field changes.
function createAvatarPicker(mountEl, { getSpecies } = {}) {
  mountEl.innerHTML = `
    <div class="avatar-picker">
      <div class="avatar-preview" data-role="preview"></div>
      <div class="avatar-controls">
        <div class="avatar-controls-row">
          <button type="button" class="ghost avatar-btn" data-role="upload">📷 <span data-i18n="avatar_upload"></span></button>
          <button type="button" class="linkbtn avatar-remove" data-role="remove" hidden data-i18n="avatar_remove"></button>
        </div>
        <input type="file" accept="image/*" data-role="file" hidden />
        <div class="avatar-style-toggle" data-role="toggle" hidden>
          <button type="button" data-style="original" data-i18n="avatar_original"></button>
          <button type="button" data-style="cartoon" data-role="cartoonBtn">✨ <span data-i18n="avatar_cartoon"></span></button>
        </div>
        <p class="hint avatar-hint" data-i18n="avatar_hint"></p>
      </div>
    </div>`;

  const preview = mountEl.querySelector('[data-role="preview"]');
  const uploadBtn = mountEl.querySelector('[data-role="upload"]');
  const fileInput = mountEl.querySelector('[data-role="file"]');
  const toggle = mountEl.querySelector('[data-role="toggle"]');
  const removeBtn = mountEl.querySelector('[data-role="remove"]');
  const originalBtn = toggle.querySelector('[data-style="original"]');
  const cartoonBtn = toggle.querySelector('[data-style="cartoon"]');

  let original = null;
  let cartoon = null;
  let kind = "emoji";

  function renderPreview() {
    if (kind === "cartoon" && cartoon) {
      preview.innerHTML = `<img src="${cartoon}" alt="" />`;
    } else if (original) {
      preview.innerHTML = `<img src="${original}" alt="" />`;
    } else {
      const species = getSpecies ? getSpecies() : "";
      preview.textContent = (typeof emojiFor === "function") ? emojiFor(species) : "🐾";
    }
  }

  function setStyleActive() {
    originalBtn.classList.toggle("active", kind !== "cartoon");
    cartoonBtn.classList.toggle("active", kind === "cartoon");
  }

  uploadBtn.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", async () => {
    const file = fileInput.files[0];
    fileInput.value = "";
    if (!file) return;
    uploadBtn.disabled = true;
    try {
      original = await fileToSquareDataUrl(file);
      cartoon = await cartoonifyDataUrl(original);
      kind = "photo";
      toggle.hidden = false;
      removeBtn.hidden = false;
      setStyleActive();
      renderPreview();
    } catch {
      original = null; cartoon = null;
    } finally {
      uploadBtn.disabled = false;
    }
  });

  originalBtn.addEventListener("click", () => {
    if (!original) return;
    kind = "photo";
    setStyleActive();
    renderPreview();
  });
  cartoonBtn.addEventListener("click", () => {
    if (!cartoon) return;
    kind = "cartoon";
    setStyleActive();
    renderPreview();
  });
  removeBtn.addEventListener("click", () => {
    original = null; cartoon = null; kind = "emoji";
    toggle.hidden = true; removeBtn.hidden = true;
    setStyleActive();
    renderPreview();
  });

  return {
    refreshEmoji() { if (!original) renderPreview(); },
    getAvatar() {
      return {
        avatar_kind: kind,
        avatar_original: original,
        avatar_cartoon: cartoon,
      };
    },
    setValues(pet) {
      if (pet && (pet.avatar_original || pet.avatar_cartoon)) {
        original = pet.avatar_original || null;
        cartoon = pet.avatar_cartoon || null;
        kind = pet.avatar_kind === "cartoon" && cartoon ? "cartoon" : "photo";
        toggle.hidden = false;
        removeBtn.hidden = false;
      } else {
        original = null; cartoon = null; kind = "emoji";
        toggle.hidden = true; removeBtn.hidden = true;
      }
      setStyleActive();
      renderPreview();
    },
    reset() {
      original = null; cartoon = null; kind = "emoji";
      toggle.hidden = true; removeBtn.hidden = true;
      fileInput.value = "";
      setStyleActive();
      renderPreview();
    },
  };
}
