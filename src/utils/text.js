import { getMinimumAvailablePrice } from "./perfumeVariants.js";

// Normaliza texto para comparaciones flexibles dentro del buscador.
export function normalizeText(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// Formatea precios del catalogo con moneda y notacion local.
export function formatPrice(value) {
  if (value === null || value === undefined || typeof value === "boolean" ||
      (typeof value === "string" && !value.trim()) ||
      !Number.isFinite(Number(value)) || Number(value) <= 0) {
    return "Precio no disponible";
  }
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatStartingPrice(perfume) {
  const price = getMinimumAvailablePrice(perfume);
  return price === null ? "Sin variantes disponibles" : `Desde ${formatPrice(price)}`;
}
