import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_DIMENSION,
  MAX_IMAGE_UPLOAD_SIZE_BYTES
} from "../config/security.js";

// Verifica que una URL de imagen sea segura para renderizarse en el frontend.
export function validateImageUrl(url) {
  if (!url) {
    return "";
  }

  const trimmed = url.trim();

  const allowedDataUrl = /^data:image\/(png|jpeg|jpg|webp);base64,/i;
  if (allowedDataUrl.test(trimmed)) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "https:") {
      return trimmed;
    }
  } catch {
    // Invalid URL falls through to error.
  }

  throw new Error(
    "La imagen por URL debe usar https o ser una imagen cargada desde el formulario."
  );
}

// Lee un archivo local y lo convierte a data URL para procesarlo en el navegador.
function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsDataURL(file);
  });
}

// Crea un objeto Image listo para dibujarse en canvas desde una data URL.
function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onerror = () => reject(new Error("No se pudo procesar la imagen seleccionada."));
    image.onload = () => resolve(image);
    image.src = dataUrl;
  });
}

// Sanea una imagen subida, limita tamaño y la reexporta en un formato permitido.
export async function sanitizeImageFile(file) {
  if (!file) {
    throw new Error("No se selecciono ninguna imagen.");
  }

  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type)) {
    throw new Error("Solo se permiten imagenes JPG, PNG o WEBP.");
  }

  if (file.size > MAX_IMAGE_UPLOAD_SIZE_BYTES) {
    throw new Error("La imagen supera el maximo permitido de 2 MB.");
  }

  const dataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(dataUrl);

  const ratio = Math.min(
    1,
    MAX_IMAGE_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight)
  );
  const width = Math.max(1, Math.round(image.naturalWidth * ratio));
  const height = Math.max(1, Math.round(image.naturalHeight * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("No se pudo preparar la imagen.");
  }

  context.drawImage(image, 0, 0, width, height);

  return canvas.toDataURL("image/webp", 0.9);
}
