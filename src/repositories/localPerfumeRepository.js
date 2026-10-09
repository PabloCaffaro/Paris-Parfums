import { defaultPerfumes } from "../data/perfumes.js";
import {
  createDefaultVariants,
  normalizeConfiguredPrice,
  normalizeVariants,
  updateFullVariant
} from "../utils/perfumeVariants.js";

const PERFUMES_KEY = "paris-parfums-perfumes";

// Completa datos persistidos de versiones anteriores del catalogo.
function hydratePerfume(perfume) {
  const fallback =
    defaultPerfumes.find((item) => item.slug === perfume.slug) ||
    defaultPerfumes.find((item) => item.name === perfume.name) ||
    {};
  const notes = Array.isArray(perfume.notes)
    ? perfume.notes
    : String(perfume.notes ?? fallback.notes?.join(", ") ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
  const occasions = Array.isArray(perfume.occasions)
    ? perfume.occasions
    : String(perfume.occasions ?? fallback.occasions?.join(", ") ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

  const storedPrice = perfume.price;
  let price = null;
  try {
    price = normalizeConfiguredPrice(storedPrice);
  } catch {
    // Conserva el registro aun si el precio antiguo ya no cumple las reglas de venta.
  }

  const hydrated = {
    ...fallback,
    ...perfume,
    imageUrl: perfume.imageUrl ?? "",
    price,
    volume: perfume.volume ?? "",
    notes,
    occasions
  };

  // Los registros anteriores no tienen variantes; se derivan al leer sin reescribir storage.
  if (Array.isArray(perfume.variants)) {
    return { ...hydrated, variants: perfume.variants.map((variant) => ({ ...variant })) };
  }
  return { ...hydrated, variants: createDefaultVariants(hydrated) };
}

function cloneDefaults() {
  return defaultPerfumes.map(hydratePerfume);
}

function readPerfumes() {
  const storedPerfumes = window.localStorage.getItem(PERFUMES_KEY);

  if (!storedPerfumes) {
    return cloneDefaults();
  }

  try {
    const parsed = JSON.parse(storedPerfumes);
    return Array.isArray(parsed) ? parsed.map(hydratePerfume) : cloneDefaults();
  } catch {
    return cloneDefaults();
  }
}

function writePerfumes(perfumes) {
  try {
    window.localStorage.setItem(PERFUMES_KEY, JSON.stringify(perfumes));
  } catch (error) {
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      throw new Error(
        "No queda espacio en este navegador para guardar mas imagenes. Quita una foto o usa una imagen por URL."
      );
    }

    throw error;
  }

  return perfumes;
}

// Encapsula la persistencia local para poder reemplazarla luego por una API.
export const localPerfumeRepository = {
  list() {
    return readPerfumes();
  },

  create(perfume) {
    const created = hydratePerfume(perfume);
    writePerfumes([...readPerfumes(), created]);
    return created;
  },

  update(slug, perfume) {
    const perfumes = readPerfumes();
    const current = perfumes.find((item) => item.slug === slug);
    if (!current) throw new Error("El perfume que queres editar no existe.");

    const merged = { ...current, ...perfume };
    if (perfume.variants === undefined) {
      merged.variants = updateFullVariant(current.variants, merged);
    } else {
      const full = Array.isArray(perfume.variants)
        ? perfume.variants.find((variant) => variant?.presentation === "full")
        : null;
      if (full && !Object.hasOwn(perfume, "price")) merged.price = full.price;
      if (full && !Object.hasOwn(perfume, "volume")) {
        merged.volume = full.volumeMl === null ? "" : `${full.volumeMl} ml`;
      }
    }
    merged.variants = normalizeVariants(merged.variants, merged);
    const updated = hydratePerfume(merged);
    writePerfumes(perfumes.map((item) => (item.slug === slug ? updated : item)));
    return updated;
  },

  remove(slug) {
    writePerfumes(readPerfumes().filter((perfume) => perfume.slug !== slug));
  },

  reset() {
    return writePerfumes(cloneDefaults());
  }
};
