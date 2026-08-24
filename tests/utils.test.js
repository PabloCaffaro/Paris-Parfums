import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateImageUrl } from "../src/utils/image.js";
import { slugify } from "../src/utils/slugify.js";
import { formatPrice, normalizeText } from "../src/utils/text.js";

describe("slugify", () => {
  it("genera slugs estables sin acentos ni separadores duplicados", () => {
    assert.equal(slugify("  Édition Rue Noire -- 2026  "), "edition-rue-noire-2026");
  });

  it("elimina simbolos que no son seguros para una ruta", () => {
    assert.equal(slugify("Velours & Blanc / Intense"), "velours-blanc-intense");
  });
});

describe("normalizeText", () => {
  it("normaliza mayusculas, espacios y acentos para el buscador", () => {
    assert.equal(normalizeText("  Ámbar Séco  "), "ambar seco");
  });
});

describe("formatPrice", () => {
  it("formatea precios enteros en dolares para Uruguay", () => {
    assert.equal(formatPrice(145).replace(/\s/g, " "), "US$ 145");
  });
});

describe("validateImageUrl", () => {
  it("acepta URLs HTTPS y elimina espacios externos", () => {
    assert.equal(
      validateImageUrl("  https://example.com/perfume.webp  "),
      "https://example.com/perfume.webp"
    );
  });

  it("acepta data URLs de imagen permitidas", () => {
    const dataUrl = "data:image/webp;base64,AAAA";
    assert.equal(validateImageUrl(dataUrl), dataUrl);
  });

  for (const url of [
    "http://example.com/image.jpg",
    "javascript:alert(1)",
    "/image.jpg"
  ]) {
    it(`rechaza una URL insegura: ${url}`, () => {
      assert.throws(() => validateImageUrl(url), /https/i);
    });
  }
});
