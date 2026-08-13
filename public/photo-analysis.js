// Prepares a privacy-conscious, resized copy for one-shot server-side visual
// analysis. The original image remains in IndexedDB and is not sent.
(function exposePhotoAnalysis(root) {
  async function prepare(file, { maxDimension = 1280, quality = 0.82 } = {}) {
    if (!file || !String(file.type || "").startsWith("image/")) {
      throw new Error("invalid_image");
    }
    const url = URL.createObjectURL(file);
    try {
      const image = await load(url);
      const { width, height } = scaledDimensions(
        image.naturalWidth, image.naturalHeight, maxDimension);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("canvas_unavailable");
      context.fillStyle = "#fff";
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      return {
        media_type: "image/jpeg",
        data: dataUrl.slice(dataUrl.indexOf(",") + 1),
        width,
        height,
      };
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  function load(url) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("image_decode_failed"));
      image.src = url;
    });
  }

  function scaledDimensions(sourceWidth, sourceHeight, maxDimension) {
    const width = Number(sourceWidth);
    const height = Number(sourceHeight);
    const limit = Number(maxDimension);
    if (!(width > 0) || !(height > 0) || !(limit > 0)) throw new Error("invalid_dimensions");
    const scale = Math.min(1, limit / Math.max(width, height));
    return {
      width: Math.max(1, Math.round(width * scale)),
      height: Math.max(1, Math.round(height * scale)),
    };
  }

  root.PhotoAnalysis = Object.freeze({ prepare, scaledDimensions });
})(globalThis);
