import { validateAndNormalizePerfumeInput } from "../utils/perfumeValidation";

// Reune las reglas del catalogo y delega su persistencia al repositorio recibido.
export function createPerfumeService(repository) {
  return {
    list() {
      return repository.list();
    },

    create(input) {
      const perfume = validateAndNormalizePerfumeInput(input);
      return repository.create(perfume);
    },

    update(slug, input) {
      const perfume = validateAndNormalizePerfumeInput(input);
      return repository.update(slug, perfume);
    },

    remove(slug) {
      repository.remove(slug);
    },

    reset() {
      return repository.reset();
    }
  };
}
