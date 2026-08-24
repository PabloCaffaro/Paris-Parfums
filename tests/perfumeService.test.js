import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { createPerfumeService } from "../src/services/perfumeService.js";
import { createValidPerfumeInput } from "./helpers.js";

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
});
