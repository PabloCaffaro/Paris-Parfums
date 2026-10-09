import { createDefaultVariants } from "../utils/perfumeVariants.js";

const demoDecantPrices = {
  "midnight-sillage": [52, 28, 15],
  "velours-blanc": [43, 23, 12],
  "rue-noire": [63, 33, 17],
  "atelier-fume": [49, 26, 14],
  "marais-gris": [36, 19, 10],
  "velvet-accord": [46, 25, 13]
};

export const defaultPerfumes = [
  {
    slug: "midnight-sillage",
    name: "Midnight Sillage",
    imageUrl: "",
    price: 145,
    family: "Amaderado especiado",
    shortDescription:
      "Salida seca con incienso, vetiver y tonka para una firma nocturna de mucho caracter.",
    heroDescription:
      "Una salida ahumada con incienso fino, vetiver seco y haba tonka para un perfume con presencia real.",
    detailedDescription:
      "Midnight Sillage esta pensado para noches largas, cenas especiales y personas que quieren un perfume con identidad marcada. La estructura abre con incienso refinado, avanza hacia un corazon seco y elegante de vetiver, y cierra con tonka para dejar una estela envolvente.",
    narrative:
      "Es una fragancia con perfil sobrio, oscuro y muy elegante. Busca transmitir presencia sin necesidad de exagerar, con un rastro memorable que se siente premium y moderno.",
    volume: "100 ml",
    concentration: "EDP",
    badge: "Premium",
    notes: ["Incienso", "Vetiver", "Tonka"],
    occasions: ["Noche", "Eventos", "Invierno"],
    intensity: "Alta",
    duration: "8 a 10 horas"
  },
  {
    slug: "velours-blanc",
    name: "Velours Blanc",
    imageUrl: "",
    price: 118,
    family: "Almizclado floral",
    shortDescription:
      "Un perfume limpio y elegante con iris aterciopelado, musk blanco y fondo cremoso.",
    heroDescription:
      "Limpio, delicado y refinado, con un perfil suave que deja una sensacion de lujo silencioso.",
    detailedDescription:
      "Velours Blanc trabaja una salida luminosa y muy pulida. El iris se siente aterciopelado, el musk blanco sostiene la composicion y el fondo cremoso deja una huella suave, ideal para un uso cercano y sofisticado.",
    narrative:
      "Es una opcion versatil para quienes buscan elegancia serena y una presencia cuidada sin cargar el ambiente.",
    volume: "100 ml",
    concentration: "EDP",
    badge: "Signature",
    notes: ["Iris", "Musk blanco", "Crema"],
    occasions: ["Dia", "Oficina", "Todo el ano"],
    intensity: "Media",
    duration: "6 a 8 horas"
  },
  {
    slug: "rue-noire",
    name: "Rue Noire",
    imageUrl: "",
    price: 172,
    family: "Cuero ambarado",
    shortDescription:
      "Notas oscuras y urbanas con cuero suave, ambar seco y un trazo ahumado refinado.",
    heroDescription:
      "Un perfil mas urbano y oscuro, ideal para quienes quieren un perfume con mucha personalidad.",
    detailedDescription:
      "Rue Noire combina un cuero suave y elegante con un ambar seco que le da profundidad. El acento ahumado completa una fragancia con mucha actitud, pero cuidada en su ejecucion.",
    narrative:
      "Tiene un caracter moderno, nocturno y ligeramente rebelde, sin salir del universo premium de la marca.",
    volume: "100 ml",
    concentration: "Extrait",
    badge: "Nocturno",
    notes: ["Cuero", "Ambar seco", "Humo"],
    occasions: ["Noche", "Salidas", "Clima fresco"],
    intensity: "Alta",
    duration: "10 a 12 horas"
  },
  {
    slug: "atelier-fume",
    name: "Atelier Fume",
    imageUrl: "",
    price: 136,
    family: "Resinoso mineral",
    shortDescription:
      "Una estela sofisticada con incienso claro, pimienta negra y maderas pulidas.",
    heroDescription:
      "Seco, resinoso y elegante, con una impronta de taller refinado y materias nobles.",
    detailedDescription:
      "Atelier Fume mezcla pimienta negra con incienso claro y maderas muy limpias. El resultado es arquitectonico, serio y con una proyeccion controlada que lo hace muy elegante.",
    narrative:
      "Funciona muy bien para quien valora composiciones distintas, menos dulces y con una lectura mas de autor.",
    volume: "75 ml",
    concentration: "EDP",
    badge: "Editorial",
    notes: ["Incienso claro", "Pimienta negra", "Maderas"],
    occasions: ["Reuniones", "Noche", "Otono"],
    intensity: "Media alta",
    duration: "7 a 9 horas"
  },
  {
    slug: "marais-gris",
    name: "Marais Gris",
    imageUrl: "",
    price: 98,
    family: "Citrico aromatico",
    shortDescription:
      "Bergamota, salvia y cedro para una lectura moderna y fresca dentro del mismo lenguaje.",
    heroDescription:
      "Mas luminoso y aireado, sin perder sobriedad ni presencia en la composicion.",
    detailedDescription:
      "Marais Gris abre con bergamota brillante y una salvia que aporta limpieza herbal. El cedro seca la salida y deja una firma moderna, fresca y muy usable todos los dias.",
    narrative:
      "Es una opcion ideal para sumar frescura al catalogo sin romper la identidad oscura y cuidada del sitio.",
    volume: "100 ml",
    concentration: "EDT",
    badge: "Diurno",
    notes: ["Bergamota", "Salvia", "Cedro"],
    occasions: ["Dia", "Primavera", "Uso diario"],
    intensity: "Media",
    duration: "5 a 7 horas"
  },
  {
    slug: "velvet-accord",
    name: "Velvet Accord",
    imageUrl: "",
    price: 128,
    family: "Oriental suave",
    shortDescription:
      "Vainilla seca, haba tonka y un acorde textil que refuerza la sensacion de lujo.",
    heroDescription:
      "Suave y envolvente, con un fondo textil que lo hace comodo y elegante al mismo tiempo.",
    detailedDescription:
      "Velvet Accord trabaja con vainilla seca y haba tonka para construir una base calida. El acorde textil aporta una sensacion de terciopelo ligero que se siente sofisticada y moderna.",
    narrative:
      "Es una opcion amable pero lujosa, ideal para quienes buscan un perfume elegante, sedoso y facil de llevar.",
    volume: "100 ml",
    concentration: "EDP",
    badge: "Best seller",
    notes: ["Vainilla seca", "Tonka", "Acorde textil"],
    occasions: ["Tarde", "Citas", "Todo el ano"],
    intensity: "Media",
    duration: "7 a 8 horas"
  }
].map((perfume) => ({
  ...perfume,
  variants: createDefaultVariants(perfume).map((variant, index) =>
    index === 0 ? variant : {
      ...variant,
      price: demoDecantPrices[perfume.slug][index - 1],
      available: true
    }
  )
}));
