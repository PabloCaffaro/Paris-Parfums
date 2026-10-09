alter table public.perfumes add column is_demo boolean not null default false;
create index perfumes_demo_idx on public.perfumes (is_demo) where is_demo;

insert into public.perfumes (
  slug, name, image_url, price, family, short_description, hero_description,
  detailed_description, narrative, volume, concentration, badge, notes,
  occasions, intensity, duration, sort_order, is_demo
) values
(
  'noir-atelier-demo', 'Noir Atelier', '', 149, 'Amaderado especiado',
  'Incienso, vetiver y tonka para una firma nocturna.',
  'Una fragancia oscura y elegante para noches largas.',
  'Noir Atelier abre con incienso refinado, evoluciona hacia vetiver seco y deja una base de tonka envolvente.',
  'Dato de prueba para validar el catálogo antes de cargar el inventario real.',
  '100 ml', 'EDP', 'Demo', array['Incienso','Vetiver','Tonka'],
  array['Noche','Eventos','Invierno'], 'Alta', '8 a 10 horas', 1, true
),
(
  'velours-clair-demo', 'Velours Clair', '', 119, 'Almizclado floral',
  'Iris aterciopelado, musk blanco y fondo cremoso.',
  'Limpio, delicado y refinado para uso diario.',
  'Velours Clair combina iris suave con musk blanco y una base cremosa de presencia serena.',
  'Dato de prueba para comprobar filtros de familias y precios.',
  '100 ml', 'EDP', 'Demo', array['Iris','Musk blanco','Crema'],
  array['Dia','Oficina','Todo el ano'], 'Media', '6 a 8 horas', 2, true
),
(
  'ambre-urbain-demo', 'Ambre Urbain', '', 175, 'Cuero ambarado',
  'Cuero suave, ambar seco y humo elegante.',
  'Un perfil urbano, intenso y de gran duracion.',
  'Ambre Urbain combina cuero pulido y ambar seco con un acento ahumado de caracter contemporaneo.',
  'Dato de prueba para validar tarjetas de precio alto y concentracion Extrait.',
  '75 ml', 'Extrait', 'Demo', array['Cuero','Ambar seco','Humo'],
  array['Noche','Salidas','Clima fresco'], 'Alta', '10 a 12 horas', 3, true
);

-- Cuando se cargue el catálogo real, eliminar solamente la semilla:
-- delete from public.perfumes where is_demo = true;
