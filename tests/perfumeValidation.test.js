import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateAndNormalizePerfumeInput } from "../src/utils/perfumeValidation.js";
import { createValidPerfumeInput } from "./helpers.js";

describe("validateAndNormalizePerfumeInput", () => {
  it("sanea y normaliza un perfume valido", () => {
    const result = validateAndNormalizePerfumeInput(
      createValidPerfumeInput({
        slug: "  Édition Nuit  ",
        name: "  Nuit <script>  ",
        price: "145.6",
        notes: " Iris, , Musk <blanco> ",
        occasions: " Noche, Citas "
      })
    );

    assert.equal(result.slug, "edition-nuit");
    assert.equal(result.name, "Nuit script");
    assert.equal(result.price, 146);
    assert.deepEqual(result.notes, ["Iris", "Musk blanco"]);
    assert.deepEqual(result.occasions, ["Noche", "Citas"]);
  });

  it("limita las listas al maximo permitido", () => {
    const result = validateAndNormalizePerfumeInput(
      createValidPerfumeInput({
        notes: "Uno, Dos, Tres, Cuatro, Cinco, Seis, Siete, Ocho, Nueve"
      })
    );

    assert.equal(result.notes.length, 8);
    assert.equal(result.notes.includes("Nueve"), false);
  });

  it("requiere un nombre", () => {
    assert.throws(
      () => validateAndNormalizePerfumeInput(createValidPerfumeInput({ name: "" })),
      /nombre/i
    );
  });

  for (const price of [-1, 10001, "sin precio"]) {
    it(`rechaza el precio invalido ${price}`, () => {
      assert.throws(
        () => validateAndNormalizePerfumeInput(createValidPerfumeInput({ price })),
        /precio/i
      );
    });
  }

  it("requiere notas y ocasiones", () => {
    assert.throws(
      () => validateAndNormalizePerfumeInput(createValidPerfumeInput({ notes: "" })),
      /nota/i
    );
    assert.throws(
      () => validateAndNormalizePerfumeInput(createValidPerfumeInput({ occasions: "" })),
      /ocasion/i
    );
  });

  it("requiere todas las descripciones", () => {
    assert.throws(
      () =>
        validateAndNormalizePerfumeInput(
          createValidPerfumeInput({ detailedDescription: "" })
        ),
      /descripciones/i
    );
  });

  it("rechaza una imagen con protocolo inseguro", () => {
    assert.throws(
      () =>
        validateAndNormalizePerfumeInput(
          createValidPerfumeInput({ imageUrl: "http://example.com/image.jpg" })
        ),
      /https/i
    );
  });
});
