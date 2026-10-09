import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createDefaultVariants,
  getMinimumAvailablePrice,
  normalizeVariants,
  parseVolumeMl
} from "../src/utils/perfumeVariants.js";

const product = { slug: "midnight-sillage", price: 145, volume: "100 ml" };

describe("perfumeVariants", () => {
  it("crea las cuatro presentaciones con identificadores estables", () => {
    const variants = createDefaultVariants(product);

    assert.deepEqual(
      variants.map(({ id, presentation, volumeMl, price, available }) => ({
        id,
        presentation,
        volumeMl,
        price,
        available
      })),
      [
        { id: "midnight-sillage:full", presentation: "full", volumeMl: 100, price: 145, available: true },
        { id: "midnight-sillage:decant-20", presentation: "decant", volumeMl: 20, price: null, available: false },
        { id: "midnight-sillage:decant-10", presentation: "decant", volumeMl: 10, price: null, available: false },
        { id: "midnight-sillage:decant-5", presentation: "decant", volumeMl: 5, price: null, available: false }
      ]
    );
    assert.deepEqual(createDefaultVariants(product), variants);
  });

  it("valida precios, volumen y disponibilidad independiente", () => {
    const variants = createDefaultVariants(product);
    variants[1] = { ...variants[1], price: "29.5", available: true };
    variants[2] = { ...variants[2], price: 19, available: false };

    const normalized = normalizeVariants(variants, product);
    assert.equal(normalized[1].price, 30);
    assert.equal(normalized[1].available, true);
    assert.equal(normalized[2].price, 19);
    assert.equal(normalized[2].available, false);
    assert.equal(normalized[3].price, null);

    const unavailableFull = normalizeVariants(
      variants.map((variant, index) => index === 0 ? { ...variant, available: false } : variant),
      product
    );
    assert.equal(unavailableFull[0].available, false);
    assert.equal(unavailableFull[1].available, true);

    for (const price of [-1, 10001, "sin precio", ""]) {
      assert.throws(
        () => normalizeVariants(variants.map((variant, index) =>
          index === 1 ? { ...variant, price, available: true } : variant
        ), product),
        /precio/i
      );
    }
    assert.throws(() => normalizeVariants(variants.map((variant, index) =>
      index === 1 ? { ...variant, price: null, available: true } : variant
    ), product), /precio/i);
    assert.throws(() => parseVolumeMl("sin volumen"), /volumen/i);
    assert.throws(() => normalizeVariants(variants.map((variant, index) =>
      index === 1 ? { ...variant, volumeMl: 15 } : variant
    ), product), /volumen/i);
    assert.throws(() => normalizeVariants(variants.map((variant, index) =>
      index === 0 ? { ...variant, volumeMl: 75 } : variant
    ), product), /volumen/i);
  });

  it("rechaza identificadores duplicados y presentaciones incompletas", () => {
    const variants = createDefaultVariants(product);
    assert.throws(() => normalizeVariants(variants.map((variant, index) =>
      index === 1 ? { ...variant, id: variants[0].id } : variant
    ), product), /identificador.*duplicado/i);
    assert.throws(() => normalizeVariants(variants.slice(0, 3), product), /cuatro/i);
  });

  it("admite solo el decant de 5 ml y exige alguna variante vendible", () => {
    const variants = createDefaultVariants({ slug: "decant-only", price: null, volume: "" });
    variants[3] = { ...variants[3], price: 15, available: true };
    const product = { slug: "decant-only", price: null, volume: "" };

    const normalized = normalizeVariants(variants, product);
    assert.equal(normalized[0].price, null);
    assert.equal(normalized[0].volumeMl, null);
    assert.equal(normalized[0].available, false);
    assert.equal(getMinimumAvailablePrice({ variants: normalized }), 15);
    assert.throws(() => normalizeVariants(createDefaultVariants(product), product), /al menos una/i);
  });

  it("rechaza precios nulos, vacios o cero en variantes habilitadas", () => {
    const variants = createDefaultVariants(product);
    for (const price of [null, undefined, "", 0, "0", 0.2]) {
      assert.throws(() => normalizeVariants(variants.map((variant, index) =>
        index === 1 ? { ...variant, available: true, price } : variant
      ), product), /precio/i);
    }
    assert.equal(normalizeVariants(variants, product)[1].price, null);
  });

  it("calcula el minimo solo entre variantes disponibles", () => {
    const variants = createDefaultVariants(product);
    variants[0] = { ...variants[0], available: false };
    variants[1] = { ...variants[1], price: 52, available: true };
    variants[2] = { ...variants[2], price: 28, available: true };
    variants[3] = { ...variants[3], price: 15, available: false };
    assert.equal(getMinimumAvailablePrice({ variants }), 28);
    assert.equal(getMinimumAvailablePrice({ variants: variants.map((v) => ({ ...v, available: false })) }), null);
  });
});
