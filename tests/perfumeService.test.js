import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { createPerfumeService } from "../src/services/perfumeService.js";
import { createValidPerfumeInput } from "./helpers.js";
import { createDefaultVariants } from "../src/utils/perfumeVariants.js";

describe("createPerfumeService", () => {
  let calls;
  let repository;
  let service;

  beforeEach(() => {
    calls = {
      list: 0,
      create: [],
      update: [],
      remove: [],
      reset: 0
    };
    repository = {
      async list() {
        calls.list += 1;
        return [{ slug: "uno" }];
      },
      async create(perfume) {
        calls.create.push(perfume);
        return perfume;
      },
      async update(slug, perfume) {
        calls.update.push([slug, perfume]);
        return perfume;
      },
      async remove(slug) {
        calls.remove.push(slug);
      },
      async reset() {
        calls.reset += 1;
        return [{ slug: "restaurado" }];
      }
    };
    service = createPerfumeService(repository);
  });

  it("delega el listado al repositorio", async () => {
    const perfumes = await service.list();

    assert.deepEqual(perfumes, [{ slug: "uno" }]);
    assert.equal(calls.list, 1);
  });

  it("valida y normaliza antes de crear", async () => {
    const created = await service.create(
      createValidPerfumeInput({ name: "Édition Test", slug: "", price: "99.7" })
    );

    assert.equal(calls.create.length, 1);
    assert.equal(created.slug, "edition-test");
    assert.equal(created.price, 100);
    assert.equal(created.variants.length, 4);
    assert.equal(created.variants[0].price, 100);
    assert.equal(created.variants[1].available, false);
    assert.deepEqual(created.notes, ["Incienso", "Vetiver", "Tonka"]);
  });

  it("envia el slug original y el perfume normalizado al actualizar", async () => {
    const updated = await service.update(
      "slug-anterior",
      createValidPerfumeInput({ name: "Nombre Nuevo", slug: "nombre-nuevo" })
    );

    assert.equal(calls.update.length, 1);
    assert.equal(calls.update[0][0], "slug-anterior");
    assert.equal(calls.update[0][1].slug, "nombre-nuevo");
    assert.equal(calls.update[0][1].name, "Nombre Nuevo");
    assert.equal(updated.slug, "nombre-nuevo");
  });

  it("conserva los decants al editar campos antiguos del frasco", async () => {
    const variants = createDefaultVariants({ slug: "midnight-test", price: 145, volume: "100 ml" });
    variants[1] = { ...variants[1], price: 29, available: true };
    repository.list = async () => [{ slug: "midnight-test", variants }];

    const updated = await service.update(
      "midnight-test",
      createValidPerfumeInput({ slug: "nombre-nuevo", price: "160", volume: "75 ml" })
    );

    assert.equal(updated.variants[0].id, "midnight-test:full");
    assert.equal(updated.variants[0].price, 160);
    assert.equal(updated.variants[0].volumeMl, 75);
    assert.equal(updated.variants[1].id, "midnight-test:decant-20");
    assert.equal(updated.variants[1].price, 29);
    assert.equal(updated.variants[1].available, true);
  });

  it("delega borrado y restauracion", async () => {
    await service.remove("a-borrar");
    const restored = await service.reset();

    assert.deepEqual(calls.remove, ["a-borrar"]);
    assert.equal(calls.reset, 1);
    assert.deepEqual(restored, [{ slug: "restaurado" }]);
  });

  it("no llama al repositorio cuando la entrada es invalida", async () => {
    await assert.rejects(
      service.create(createValidPerfumeInput({ name: "" })),
      /nombre/i
    );
    assert.equal(calls.create.length, 0);
  });

  it("rechaza variantes duplicadas antes de crear", async () => {
    const variants = createDefaultVariants({ slug: "midnight-test", price: 145, volume: "100 ml" });
    variants[1] = { ...variants[1], id: variants[0].id };

    await assert.rejects(
      service.create(createValidPerfumeInput({ variants })),
      /identificador.*duplicado/i
    );
    assert.equal(calls.create.length, 0);
  });

  it("crea un perfume vendido solamente como decant de 5 ml", async () => {
    const variants = createDefaultVariants({ slug: "solo-decant", price: null, volume: "" });
    variants[3] = { ...variants[3], price: 15, available: true };
    const created = await service.create(createValidPerfumeInput({
      slug: "solo-decant", price: null, volume: "", variants
    }));

    assert.equal(created.price, null);
    assert.equal(created.variants[0].available, false);
    assert.equal(created.variants[3].price, 15);
    assert.equal(created.variants[3].available, true);
  });

  it("crea un perfume con varios decants disponibles y el frasco deshabilitado", async () => {
    const variants = createDefaultVariants({ slug: "varios-decants", price: null, volume: "" });
    variants[1] = { ...variants[1], price: 52, available: true };
    variants[2] = { ...variants[2], price: 28, available: true };
    const created = await service.create(createValidPerfumeInput({
      slug: "varios-decants", price: null, volume: "", variants
    }));
    assert.equal(created.variants[0].available, false);
    assert.deepEqual(created.variants.filter((variant) => variant.available).map((variant) => variant.price), [52, 28]);
  });

  it("rechaza un producto sin variantes disponibles", async () => {
    const variants = createDefaultVariants({ slug: "sin-precio", price: null, volume: "" });
    await assert.rejects(
      service.create(createValidPerfumeInput({ slug: "sin-precio", price: null, volume: "", variants })),
      /al menos una/i
    );
    assert.equal(calls.create.length, 0);
  });
});
