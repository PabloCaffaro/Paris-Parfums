import { validateAndNormalizePerfumeInput } from "../utils/perfumeValidation.js";
import { updateFullVariant } from "../utils/perfumeVariants.js";

// Reune las reglas del catalogo y delega su persistencia al repositorio recibido.
export function createPerfumeService(repository) {
  return {
    async list() {
      return repository.list();
    },

    async create(input) {
      const perfume = validateAndNormalizePerfumeInput(input);
      return repository.create(perfume);
    },

    async update(slug, input) {
      const existing = (await repository.list()).find((perfume) => perfume.slug === slug);
      const candidate = existing ? { ...existing, ...input } : { ...input };
      if (input.variants === undefined && existing?.variants?.length) {
        candidate.variants = updateFullVariant(existing.variants, candidate);
      } else if (Array.isArray(input.variants)) {
        const full = input.variants.find((variant) => variant?.presentation === "full");
        if (full && !Object.hasOwn(input, "price")) candidate.price = full.price;
        if (full && !Object.hasOwn(input, "volume")) {
          candidate.volume = full.volumeMl === null ? "" : `${full.volumeMl} ml`;
        }
      }
      const perfume = validateAndNormalizePerfumeInput(candidate);
      return repository.update(slug, perfume);
    },

    async remove(slug) {
      return repository.remove(slug);
    },

    async reset() {
      return repository.reset();
    }
  };
}
