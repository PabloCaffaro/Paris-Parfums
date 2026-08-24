import { defaultPerfumes } from "../data/perfumes.js";

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

  return {
    ...fallback,
    ...perfume,
    imageUrl: perfume.imageUrl ?? "",
    price: Number.isFinite(Number(perfume.price))
      ? Number(perfume.price)
      : Number(fallback.price) || 0,
    notes,
    occasions
  };
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
    writePerfumes([...readPerfumes(), perfume]);
    return perfume;
  },

  update(slug, perfume) {
    writePerfumes(
      readPerfumes().map((current) => (current.slug === slug ? perfume : current))
    );
    return perfume;
  },

  remove(slug) {
    writePerfumes(readPerfumes().filter((perfume) => perfume.slug !== slug));
  },

  reset() {
    return writePerfumes(cloneDefaults());
  }
};
