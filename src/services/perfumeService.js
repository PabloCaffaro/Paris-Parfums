import { validateAndNormalizePerfumeInput } from "../utils/perfumeValidation";

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
      const perfume = validateAndNormalizePerfumeInput(input);
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
