export const DECANT_VOLUMES_ML = [20, 10, 5];
const MAX_PRICE = 10000;

export function parseVolumeMl(value) {
  const match = String(value ?? "").trim().match(/^(\d+(?:[.,]\d+)?)\s*ml$/i);
  const volumeMl = match ? Number(match[1].replace(",", ".")) : NaN;
  if (!Number.isFinite(volumeMl) || volumeMl <= 0) {
    throw new Error("El volumen del frasco debe indicarse en ml y ser mayor que cero.");
  }
  return volumeMl;
}

export function parseOptionalVolumeMl(value) {
  try {
    return parseVolumeMl(value);
  } catch {
    return null;
  }
}

export function normalizeConfiguredPrice(value) {
  if (value === null || value === undefined ||
      (typeof value === "string" && !value.trim())) {
    return null;
  }
  if (typeof value === "boolean") {
    throw new Error("El precio debe ser un numero mayor que cero.");
  }
  const price = Number(value);
  if (!Number.isFinite(price) || price <= 0 || price > MAX_PRICE || Math.round(price) <= 0) {
    throw new Error("El precio debe ser un numero mayor que cero y hasta 10000.");
  }
  return Math.round(price);
}

function variantKey(variant) {
  return variant.presentation === "full" ? "full" : `decant-${variant.volumeMl}`;
}

function variantLabel(variant) {
  return variant.presentation === "full"
    ? "frasco completo"
    : `decant de ${variant.volumeMl} ml`;
}

export function createDefaultVariants({ slug, price, volume }) {
  const volumeMl = parseOptionalVolumeMl(volume);
  const fullPrice = normalizeConfiguredPrice(price);
  return [
    {
      id: `${slug}:full`, presentation: "full", volumeMl,
      price: fullPrice, available: fullPrice !== null && volumeMl !== null
    },
    ...DECANT_VOLUMES_ML.map((size) => ({
      id: `${slug}:decant-${size}`, presentation: "decant", volumeMl: size,
      price: null, available: false
    }))
  ];
}

// Sincroniza los campos heredados del frasco y mantiene intactos los decants.
export function updateFullVariant(variants, { price, volume }) {
  const volumeMl = parseOptionalVolumeMl(volume);
  return variants.map((variant) =>
    variant.presentation === "full"
      ? { ...variant, price: normalizeConfiguredPrice(price), volumeMl }
      : variant
  );
}

// Valida el contrato completo de presentaciones antes de persistirlo.
export function normalizeVariants(variants, product) {
  if (!Array.isArray(variants) || variants.length !== 4) {
    throw new Error("El perfume debe tener las cuatro presentaciones.");
  }

  const expectedFullVolume = parseOptionalVolumeMl(product.volume);
  const expectedFullPrice = normalizeConfiguredPrice(product.price);
  const ids = new Set();
  const slots = new Map();

  for (const variant of variants) {
    if (!variant || typeof variant !== "object" || Array.isArray(variant)) {
      throw new Error("La variante no es valida.");
    }
    if (variant.presentation !== "full" && variant.presentation !== "decant") {
      throw new Error("El tipo de presentacion no es valido.");
    }

    const volumeMl = variant.volumeMl;
    const validFullVolume = variant.presentation === "full" &&
      (volumeMl === expectedFullVolume) &&
      (volumeMl === null || (typeof volumeMl === "number" && volumeMl > 0));
    const validDecantVolume = variant.presentation === "decant" &&
      typeof volumeMl === "number" && DECANT_VOLUMES_ML.includes(volumeMl);
    if (!validFullVolume && !validDecantVolume) {
      throw new Error(`El volumen del ${variantLabel(variant)} no es valido.`);
    }
    if (typeof variant.available !== "boolean") {
      throw new Error("La disponibilidad de la variante debe ser booleana.");
    }

    const price = normalizeConfiguredPrice(variant.price);
    if (variant.available && price === null) {
      throw new Error(`El ${variantLabel(variant)} disponible debe tener un precio mayor que cero.`);
    }
    if (variant.presentation === "full") {
      if (variant.available && volumeMl === null) {
        throw new Error("El frasco completo disponible debe tener un volumen valido en ml.");
      }
      if (price !== expectedFullPrice) {
        throw new Error("El precio del frasco debe coincidir con el precio del perfume.");
      }
    }

    const key = variantKey(variant);
    const id = variant.id === "" || variant.id == null
      ? `${product.slug}:${key}` : variant.id;
    if (typeof id !== "string" || !/^[a-zA-Z0-9][a-zA-Z0-9:_-]{0,127}$/.test(id)) {
      throw new Error("El identificador de la variante no es valido.");
    }
    if (ids.has(id)) {
      throw new Error("El identificador de la variante esta duplicado.");
    }
    ids.add(id);
    if (slots.has(key)) {
      throw new Error("La presentacion esta duplicada.");
    }
    slots.set(key, { id, presentation: variant.presentation, volumeMl, price,
      available: variant.available });
  }

  const orderedKeys = ["full", ...DECANT_VOLUMES_ML.map((size) => `decant-${size}`)];
  if (orderedKeys.some((key) => !slots.has(key))) {
    throw new Error("Falta una de las cuatro presentaciones.");
  }
  const normalized = orderedKeys.map((key) => slots.get(key));
  if (!normalized.some((variant) => variant.available)) {
    throw new Error("Habilita al menos una presentacion con precio mayor que cero.");
  }
  return normalized;
}

export function getMinimumAvailablePrice(perfume) {
  const prices = (perfume.variants ?? [])
    .filter((variant) => variant?.available === true &&
      typeof variant.price === "number" && Number.isFinite(variant.price) && variant.price > 0)
    .map((variant) => variant.price);
  return prices.length ? Math.min(...prices) : null;
}
