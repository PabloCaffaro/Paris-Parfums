import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { defaultPerfumes } from "../src/data/perfumes.js";
import { localPerfumeRepository } from "../src/repositories/localPerfumeRepository.js";
import { createPerfumeService } from "../src/services/perfumeService.js";
import { createDefaultVariants } from "../src/utils/perfumeVariants.js";
import { createValidPerfumeInput, MemoryStorage } from "./helpers.js";

const PERFUMES_KEY = "paris-parfums-perfumes";

describe("localPerfumeRepository", () => {
  beforeEach(() => {
    globalThis.window = { localStorage: new MemoryStorage() };
  });

  afterEach(() => {
    delete globalThis.window;
  });

  it("devuelve el catalogo inicial cuando no hay datos guardados", () => {
    const perfumes = localPerfumeRepository.list();

    assert.equal(perfumes.length, defaultPerfumes.length);
    assert.deepEqual(perfumes[0], defaultPerfumes[0]);
    assert.notEqual(perfumes, defaultPerfumes);
    for (const perfume of perfumes) {
      assert.deepEqual(perfume.variants.map((variant) => variant.volumeMl).slice(1), [20, 10, 5]);
      assert.equal(perfume.variants[0].price, perfume.price);
      assert.ok(perfume.variants.every((variant) => variant.available && variant.price > 0));
    }
    const expectedPrices = {
      "midnight-sillage": [145, 52, 28, 15],
      "velours-blanc": [118, 43, 23, 12],
      "rue-noire": [172, 63, 33, 17],
      "atelier-fume": [136, 49, 26, 14],
      "marais-gris": [98, 36, 19, 10],
      "velvet-accord": [128, 46, 25, 13]
    };
    for (const perfume of perfumes) {
      assert.deepEqual(perfume.variants.map((variant) => variant.price), expectedPrices[perfume.slug]);
    }
  });

  it("se recupera de JSON corrupto", () => {
    window.localStorage.setItem(PERFUMES_KEY, "{contenido invalido");

    assert.equal(localPerfumeRepository.list().length, defaultPerfumes.length);
  });

  it("hidrata datos antiguos y convierte listas y precio", () => {
    const legacyData = JSON.stringify([
        {
          slug: "midnight-sillage",
          name: "Midnight Sillage",
          price: "199",
          notes: "Humo, Madera",
          occasions: "Noche, Eventos",
          customField: "dato anterior"
        }
      ]);
    window.localStorage.setItem(PERFUMES_KEY, legacyData);

    const [perfume] = localPerfumeRepository.list();
    assert.equal(perfume.price, 199);
    assert.deepEqual(perfume.notes, ["Humo", "Madera"]);
    assert.deepEqual(perfume.occasions, ["Noche", "Eventos"]);
    assert.equal(perfume.family, defaultPerfumes[0].family);
    assert.equal(perfume.customField, "dato anterior");
    assert.equal(perfume.variants.length, 4);
    assert.equal(perfume.variants[0].price, 199);
    assert.equal(perfume.volume, "");
    assert.equal(perfume.variants[0].volumeMl, null);
    assert.equal(perfume.variants[0].available, false);
    assert.equal(perfume.variants[1].price, null);
    assert.equal(perfume.variants[1].available, false);
    assert.equal(window.localStorage.getItem(PERFUMES_KEY), legacyData);
  });

  it("conserva un registro antiguo con volumen no interpretable sin reescribirlo", () => {
    const legacyData = JSON.stringify([{
      slug: "personalizado",
      name: "Personalizado",
      price: 90,
      volume: "edicion especial",
      notes: ["Iris"],
      occasions: ["Noche"]
    }]);
    window.localStorage.setItem(PERFUMES_KEY, legacyData);

    const [perfume] = localPerfumeRepository.list();
    assert.equal(perfume.volume, "edicion especial");
    assert.equal(perfume.variants.length, 4);
    assert.equal(perfume.variants[0].volumeMl, null);
    assert.equal(perfume.variants[0].available, false);
    assert.equal(window.localStorage.getItem(PERFUMES_KEY), legacyData);
  });

  it("no convierte un precio null heredado en cero", () => {
    const legacyData = JSON.stringify([{
      slug: "sin-frasco", name: "Sin frasco", price: null, volume: "",
      notes: ["Iris"], occasions: ["Noche"]
    }]);
    window.localStorage.setItem(PERFUMES_KEY, legacyData);
    const [perfume] = localPerfumeRepository.list();
    assert.equal(perfume.price, null);
    assert.equal(perfume.variants[0].price, null);
    assert.equal(perfume.variants[0].available, false);
    assert.equal(window.localStorage.getItem(PERFUMES_KEY), legacyData);
  });

  it("no toma precio ni volumen de un producto de prueba si faltan en el registro heredado", () => {
    const legacyData = JSON.stringify([{
      slug: "midnight-sillage", name: "Midnight Sillage",
      notes: ["Iris"], occasions: ["Noche"]
    }]);
    window.localStorage.setItem(PERFUMES_KEY, legacyData);
    const [perfume] = localPerfumeRepository.list();
    assert.equal(perfume.price, null);
    assert.equal(perfume.volume, "");
    assert.equal(perfume.variants[0].price, null);
    assert.equal(perfume.variants[0].volumeMl, null);
    assert.equal(window.localStorage.getItem(PERFUMES_KEY), legacyData);
  });

  it("no reemplaza precios personalizados ya guardados por los precios de prueba", () => {
    const custom = structuredClone(defaultPerfumes[0]);
    custom.variants[1].price = 77;
    custom.variants[1].available = false;
    const stored = JSON.stringify([custom]);
    window.localStorage.setItem(PERFUMES_KEY, stored);
    const [perfume] = localPerfumeRepository.list();
    assert.equal(perfume.variants[1].price, 77);
    assert.equal(perfume.variants[1].available, false);
    assert.equal(window.localStorage.getItem(PERFUMES_KEY), stored);
  });

  it("preserva variantes al actualizar parcialmente y valida las explicitas", () => {
    window.localStorage.setItem(PERFUMES_KEY, "[]");
    const current = { slug: "parcial", name: "Parcial", price: 100, volume: "100 ml", notes: [], occasions: [] };
    const variants = createDefaultVariants(current);
    variants[1] = { ...variants[1], price: 25, available: true };
    localPerfumeRepository.create({ ...current, variants });

    const updated = localPerfumeRepository.update("parcial", { name: "Editado", price: 120 });
    assert.equal(updated.variants[0].price, 120);
    assert.equal(updated.variants[1].id, variants[1].id);
    assert.equal(updated.variants[1].price, 25);
    assert.equal(updated.variants[1].available, true);
    assert.equal(localPerfumeRepository.list()[0].variants[1].price, 25);

    const invalid = variants.map((variant, index) => index === 1
      ? { ...variant, price: null, available: true } : variant);
    assert.throws(() => localPerfumeRepository.update("parcial", { variants: invalid }), /precio/i);
    assert.equal(localPerfumeRepository.list()[0].variants[1].price, 25);

    const configured = localPerfumeRepository.list()[0].variants;
    configured[1] = { ...configured[1], price: 30, available: false };
    const applied = localPerfumeRepository.update("parcial", { variants: configured });
    assert.equal(applied.variants[1].price, 30);
    assert.equal(applied.variants[1].available, false);
  });

  it("acepta una configuracion explicita solo de decants sin campos heredados del frasco", async () => {
    window.localStorage.setItem(PERFUMES_KEY, "[]");
    const service = createPerfumeService(localPerfumeRepository);
    await service.create(createValidPerfumeInput());
    const current = localPerfumeRepository.list()[0];
    const variants = current.variants.map((variant) => ({ ...variant }));
    variants[0] = { ...variants[0], price: null, volumeMl: null, available: false };
    variants[3] = { ...variants[3], price: 15, available: true };

    const updated = await service.update(current.slug, { variants });
    assert.equal(updated.price, null);
    assert.equal(updated.volume, "");
    assert.equal(updated.variants[0].price, null);
    assert.equal(updated.variants[0].volumeMl, null);
    assert.equal(updated.variants[3].price, 15);
    assert.equal(localPerfumeRepository.list()[0].variants[3].available, true);
  });

  it("permite corregir el volumen heredado y habilitar un decant", async () => {
    const legacyData = JSON.stringify([{
      slug: "legado", name: "Legado", price: null, volume: "edicion especial",
      notes: ["Iris"], occasions: ["Noche"]
    }]);
    window.localStorage.setItem(PERFUMES_KEY, legacyData);
    const service = createPerfumeService(localPerfumeRepository);
    const variants = localPerfumeRepository.list()[0].variants;
    variants[3] = { ...variants[3], price: 15, available: true };
    variants[0] = { ...variants[0], volumeMl: 75 };
    const updated = await service.update("legado", createValidPerfumeInput({
      slug: "legado", price: null, volume: "75 ml", variants
    }));
    assert.equal(updated.variants[0].volumeMl, 75);
    assert.equal(updated.variants[3].price, 15);
    assert.equal(localPerfumeRepository.list()[0].variants[3].available, true);
  });

  it("crea, actualiza y elimina perfumes", () => {
    window.localStorage.setItem(PERFUMES_KEY, "[]");
    const created = {
      slug: "nuevo",
      name: "Nuevo",
      price: 100,
      volume: "100 ml",
      notes: [],
      occasions: []
    };
    const updated = { ...created, name: "Actualizado" };

    localPerfumeRepository.create(created);
    assert.equal(localPerfumeRepository.list().length, 1);
    assert.equal(localPerfumeRepository.list()[0].name, "Nuevo");
    assert.equal(localPerfumeRepository.list()[0].imageUrl, "");
    assert.equal(localPerfumeRepository.list()[0].variants.length, 4);

    localPerfumeRepository.update("nuevo", updated);
    assert.equal(localPerfumeRepository.list()[0].name, "Actualizado");
    assert.equal(localPerfumeRepository.list()[0].variants.length, 4);

    localPerfumeRepository.remove("nuevo");
    assert.deepEqual(localPerfumeRepository.list(), []);
  });

  it("persiste disponibilidad y precios de decants en el CRUD existente", async () => {
    window.localStorage.setItem(PERFUMES_KEY, "[]");
    const service = createPerfumeService(localPerfumeRepository);
    const variants = createDefaultVariants({ slug: "midnight-test", price: 145, volume: "100 ml" });
    variants[1] = { ...variants[1], price: 28, available: true };
    const input = createValidPerfumeInput({ variants });

    await service.create(input);
    const updated = await service.update("midnight-test", {
      ...createValidPerfumeInput(),
      price: "160"
    });
    const [persisted] = localPerfumeRepository.list();

    assert.equal(updated.variants[0].price, 160);
    assert.equal(persisted.variants[0].price, 160);
    assert.equal(persisted.variants[1].price, 28);
    assert.equal(persisted.variants[1].available, true);
    assert.equal(JSON.parse(window.localStorage.getItem(PERFUMES_KEY))[0].variants[1].price, 28);

    await service.remove("midnight-test");
    assert.deepEqual(await service.list(), []);
  });

  it("explica cuando localStorage se queda sin espacio", () => {
    const quotaError = new DOMException("Storage full", "QuotaExceededError");
    window.localStorage = {
      getItem() {
        return "[]";
      },
      setItem() {
        throw quotaError;
      }
    };

    assert.throws(
      () => localPerfumeRepository.create({ slug: "nuevo" }),
      /no queda espacio/i
    );
  });

  it("restaura y persiste el catalogo inicial", () => {
    window.localStorage.setItem(PERFUMES_KEY, "[]");

    const restored = localPerfumeRepository.reset();
    const persisted = JSON.parse(window.localStorage.getItem(PERFUMES_KEY));

    assert.equal(restored.length, defaultPerfumes.length);
    assert.equal(persisted.length, defaultPerfumes.length);
  });
});
