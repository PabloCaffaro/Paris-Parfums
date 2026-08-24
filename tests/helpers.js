export class MemoryStorage {
  constructor() {
    this.values = new Map();
  }

  get length() {
    return this.values.size;
  }

  clear() {
    this.values.clear();
  }

  getItem(key) {
    return this.values.has(String(key)) ? this.values.get(String(key)) : null;
  }

  key(index) {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key) {
    this.values.delete(String(key));
  }

  setItem(key, value) {
    this.values.set(String(key), String(value));
  }
}

export function createValidPerfumeInput(overrides = {}) {
  return {
    slug: "midnight-test",
    name: "Midnight Test",
    imageUrl: "https://example.com/midnight-test.webp",
    price: "145",
    family: "Amaderado especiado",
    shortDescription: "Descripcion corta del perfume.",
    heroDescription: "Descripcion para el carrusel destacado.",
    detailedDescription: "Descripcion detallada del perfume para su pagina.",
    narrative: "Narrativa editorial completa del perfume.",
    volume: "100 ml",
    concentration: "EDP",
    badge: "Premium",
    notes: "Incienso, Vetiver, Tonka",
    occasions: "Noche, Eventos",
    intensity: "Alta",
    duration: "8 a 10 horas",
    ...overrides
  };
}
