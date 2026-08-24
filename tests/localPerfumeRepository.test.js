import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { defaultPerfumes } from "../src/data/perfumes.js";
import { localPerfumeRepository } from "../src/repositories/localPerfumeRepository.js";
import { MemoryStorage } from "./helpers.js";

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
  });

  it("se recupera de JSON corrupto", () => {
    window.localStorage.setItem(PERFUMES_KEY, "{contenido invalido");

    assert.equal(localPerfumeRepository.list().length, defaultPerfumes.length);
  });

  it("hidrata datos antiguos y convierte listas y precio", () => {
    window.localStorage.setItem(
      PERFUMES_KEY,
      JSON.stringify([
        {
          slug: "midnight-sillage",
          name: "Midnight Sillage",
          price: "199",
          notes: "Humo, Madera",
          occasions: "Noche, Eventos"
        }
      ])
    );

    const [perfume] = localPerfumeRepository.list();
    assert.equal(perfume.price, 199);
    assert.deepEqual(perfume.notes, ["Humo", "Madera"]);
    assert.deepEqual(perfume.occasions, ["Noche", "Eventos"]);
    assert.equal(perfume.family, defaultPerfumes[0].family);
  });

  it("crea, actualiza y elimina perfumes", () => {
    window.localStorage.setItem(PERFUMES_KEY, "[]");
    const created = {
      slug: "nuevo",
      name: "Nuevo",
      price: 100,
      notes: [],
      occasions: []
    };
    const updated = { ...created, name: "Actualizado" };

    localPerfumeRepository.create(created);
    assert.equal(localPerfumeRepository.list().length, 1);
    assert.equal(localPerfumeRepository.list()[0].name, "Nuevo");
    assert.equal(localPerfumeRepository.list()[0].imageUrl, "");

    localPerfumeRepository.update("nuevo", updated);
    assert.equal(localPerfumeRepository.list()[0].name, "Actualizado");

    localPerfumeRepository.remove("nuevo");
    assert.deepEqual(localPerfumeRepository.list(), []);
  });

  it("restaura y persiste el catalogo inicial", () => {
    window.localStorage.setItem(PERFUMES_KEY, "[]");

    const restored = localPerfumeRepository.reset();
    const persisted = JSON.parse(window.localStorage.getItem(PERFUMES_KEY));

    assert.equal(restored.length, defaultPerfumes.length);
    assert.equal(persisted.length, defaultPerfumes.length);
  });
});
