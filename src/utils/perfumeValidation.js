import { FIELD_LIMITS } from "../config/security.js";
import { validateImageUrl } from "./image.js";
import { slugify } from "./slugify.js";

// Limpia texto libre, recorta longitud y remueve caracteres no deseados.
function sanitizeText(value, maxLength) {
  return String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

// Convierte un texto separado por comas en una lista saneada y acotada.
function sanitizeList(value) {
  return String(value ?? "")
    .split(",")
    .map((item) => sanitizeText(item, FIELD_LIMITS.listItem))
    .filter(Boolean)
    .slice(0, FIELD_LIMITS.listCount);
}

// Valida y normaliza todos los campos de un perfume antes de persistirlos.
export function validateAndNormalizePerfumeInput(input) {
  const name = sanitizeText(input.name, FIELD_LIMITS.name);
  if (!name) {
    throw new Error("El nombre del perfume es obligatorio.");
  }

  const price = Number(input.price);
  if (!Number.isFinite(price) || price < 0 || price > 10000) {
    throw new Error("El precio debe ser un numero valido entre 0 y 10000.");
  }

  const notes = sanitizeList(input.notes);
  if (notes.length === 0) {
    throw new Error("Ingresá al menos una nota del perfume.");
  }

  const occasions = sanitizeList(input.occasions);
  if (occasions.length === 0) {
    throw new Error("Ingresá al menos una ocasion o momento de uso.");
  }

  const shortDescription = sanitizeText(
    input.shortDescription,
    FIELD_LIMITS.shortDescription
  );
  const heroDescription = sanitizeText(
    input.heroDescription,
    FIELD_LIMITS.heroDescription
  );
  const detailedDescription = sanitizeText(
    input.detailedDescription,
    FIELD_LIMITS.detailedDescription
  );
  const narrative = sanitizeText(input.narrative, FIELD_LIMITS.narrative);

  if (!shortDescription || !heroDescription || !detailedDescription || !narrative) {
    throw new Error("Completá todas las descripciones del perfume.");
  }

  return {
    slug: slugify(sanitizeText(input.slug || name, FIELD_LIMITS.slug) || name),
    name,
    imageUrl: validateImageUrl(String(input.imageUrl ?? "")),
    price: Math.round(price),
    family: sanitizeText(input.family, FIELD_LIMITS.family),
    shortDescription,
    heroDescription,
    detailedDescription,
    narrative,
    volume: sanitizeText(input.volume, FIELD_LIMITS.volume),
    concentration: sanitizeText(input.concentration, FIELD_LIMITS.concentration),
    badge: sanitizeText(input.badge, FIELD_LIMITS.badge),
    notes,
    occasions,
    intensity: sanitizeText(input.intensity, FIELD_LIMITS.intensity),
    duration: sanitizeText(input.duration, FIELD_LIMITS.duration)
  };
}
