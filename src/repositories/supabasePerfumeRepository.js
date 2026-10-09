import { supabase } from "../lib/supabaseClient.js";

function fromRow(row) {
  return {
    slug: row.slug, name: row.name, imageUrl: row.image_url, price: Number(row.price),
    family: row.family, shortDescription: row.short_description, heroDescription: row.hero_description,
    detailedDescription: row.detailed_description, narrative: row.narrative, volume: row.volume,
    concentration: row.concentration, badge: row.badge, notes: row.notes,
    occasions: row.occasions, intensity: row.intensity, duration: row.duration
  };
}

function toRow(perfume, sortOrder) {
  return {
    slug: perfume.slug, name: perfume.name, image_url: perfume.imageUrl || "", price: perfume.price,
    family: perfume.family, short_description: perfume.shortDescription, hero_description: perfume.heroDescription,
    detailed_description: perfume.detailedDescription, narrative: perfume.narrative, volume: perfume.volume,
    concentration: perfume.concentration, badge: perfume.badge, notes: perfume.notes,
    occasions: perfume.occasions, intensity: perfume.intensity, duration: perfume.duration,
    ...(sortOrder === undefined ? {} : { sort_order: sortOrder })
  };
}

function fail(error) { if (error) throw new Error(error.message || "No se pudo completar la operacion remota."); }

export const supabasePerfumeRepository = {
  async list() {
    const { data, error } = await supabase.from("perfumes").select("*").order("sort_order");
    fail(error); return data.map(fromRow);
  },
  async create(perfume) {
    const { data, error } = await supabase.from("perfumes").insert(toRow(perfume, Date.now())).select().single();
    fail(error); return fromRow(data);
  },
  async update(slug, perfume) {
    const { data, error } = await supabase.from("perfumes").update(toRow(perfume)).eq("slug", slug).select().single();
    fail(error); return fromRow(data);
  },
  async remove(slug) { const { error } = await supabase.from("perfumes").delete().eq("slug", slug); fail(error); }
};
