export type SaintDirectoryEntry = {
  id: string;
  name: string;
  tags: string[];
  aliases?: string[];
};

export const saintDirectory: SaintDirectoryEntry[] = [
  {
    id: "saint-joseph",
    name: "Saint Joseph",
    tags: ["fathers", "workers", "family", "purity", "protection", "vocation"],
  },
  {
    id: "our-lady-of-the-rosary",
    name: "Our Lady of the Rosary",
    tags: ["Mary", "rosary", "protection", "intercession", "family"],
    aliases: ["Blessed Mother", "Mary"],
  },
  {
    id: "our-lady-seat-of-wisdom",
    name: "Our Lady Seat of Wisdom",
    tags: ["Mary", "wisdom", "students", "study", "discernment"],
  },
  {
    id: "saint-michael-the-archangel",
    name: "Saint Michael the Archangel",
    tags: ["protection", "spiritual warfare", "courage", "angels"],
    aliases: ["St. Michael"],
  },
  {
    id: "all-holy-angels-and-saints",
    name: "All holy angels and saints",
    tags: ["angels", "saints", "intercession", "protection"],
  },
  {
    id: "saint-thomas-aquinas",
    name: "Saint Thomas Aquinas",
    tags: ["wisdom", "study", "students", "scholarship", "theology", "chastity"],
  },
  {
    id: "saint-john-paul-ii",
    name: "Saint John Paul II",
    tags: ["youth", "courage", "family", "chastity", "evangelization"],
    aliases: ["John Paul II", "JPII"],
  },
  {
    id: "saint-maria-goretti",
    name: "Saint Maria Goretti",
    tags: ["chastity", "purity", "forgiveness", "youth"],
  },
  {
    id: "saint-catherine-of-siena",
    name: "Saint Catherine of Siena",
    tags: ["courage", "wisdom", "Church", "truth", "holiness"],
  },
  {
    id: "saint-therese-of-lisieux",
    name: "Saint Therese of Lisieux",
    tags: ["trust", "simplicity", "love", "mission", "little way"],
    aliases: ["Saint Therese", "Little Flower"],
  },
  {
    id: "saint-francis-of-assisi",
    name: "Saint Francis of Assisi",
    tags: ["peace", "poverty", "creation", "humility", "joy"],
  },
  {
    id: "saint-clare-of-assisi",
    name: "Saint Clare of Assisi",
    tags: ["poverty", "prayer", "courage", "trust"],
  },
  {
    id: "saint-augustine",
    name: "Saint Augustine",
    tags: ["conversion", "truth", "theology", "perseverance"],
  },
  {
    id: "saint-monica",
    name: "Saint Monica",
    tags: ["mothers", "family", "perseverance", "conversion", "prayer"],
  },
  {
    id: "saint-benedict",
    name: "Saint Benedict",
    tags: ["protection", "discipline", "work", "prayer", "monks"],
  },
  {
    id: "saint-scholastica",
    name: "Saint Scholastica",
    tags: ["prayer", "community", "sisters", "faith"],
  },
  {
    id: "saint-dominic",
    name: "Saint Dominic",
    tags: ["rosary", "preaching", "truth", "study"],
  },
  {
    id: "saint-padre-pio",
    name: "Saint Padre Pio",
    tags: ["healing", "confession", "suffering", "prayer"],
  },
  {
    id: "saint-maximilian-kolbe",
    name: "Saint Maximilian Kolbe",
    tags: ["courage", "sacrifice", "Mary", "media", "purity"],
  },
  {
    id: "saint-gianna-beretta-molla",
    name: "Saint Gianna Beretta Molla",
    tags: ["mothers", "doctors", "family", "life", "sacrifice"],
  },
  {
    id: "saint-teresa-of-calcutta",
    name: "Saint Teresa of Calcutta",
    tags: ["charity", "poverty", "service", "love"],
    aliases: ["Mother Teresa"],
  },
  {
    id: "saint-ignatius-of-loyola",
    name: "Saint Ignatius of Loyola",
    tags: ["discernment", "discipline", "mission", "retreats"],
  },
  {
    id: "saint-francis-xavier",
    name: "Saint Francis Xavier",
    tags: ["mission", "evangelization", "travel", "courage"],
  },
  {
    id: "saint-joan-of-arc",
    name: "Saint Joan of Arc",
    tags: ["courage", "vocation", "purity", "mission"],
  },
  {
    id: "saint-dymphna",
    name: "Saint Dymphna",
    tags: ["anxiety", "mental health", "healing", "peace"],
  },
  {
    id: "saint-peregrine",
    name: "Saint Peregrine",
    tags: ["cancer", "illness", "healing", "suffering"],
  },
  {
    id: "saint-jude",
    name: "Saint Jude",
    tags: ["impossible causes", "hope", "desperate situations"],
  },
  {
    id: "saint-anthony-of-padua",
    name: "Saint Anthony of Padua",
    tags: ["lost things", "preaching", "poverty", "miracles"],
  },
  {
    id: "saint-rita",
    name: "Saint Rita",
    tags: ["impossible causes", "marriage", "suffering", "peace"],
  },
  {
    id: "saint-anne",
    name: "Saint Anne",
    tags: ["mothers", "grandmothers", "family", "Mary"],
  },
  {
    id: "saint-joachim",
    name: "Saint Joachim",
    tags: ["fathers", "grandfathers", "family", "Mary"],
  },
  {
    id: "saint-elizabeth-ann-seton",
    name: "Saint Elizabeth Ann Seton",
    tags: ["education", "mothers", "converts", "schools"],
  },
  {
    id: "saint-kateri-tekakwitha",
    name: "Saint Kateri Tekakwitha",
    tags: ["purity", "creation", "courage", "Native American Catholics"],
  },
  {
    id: "saint-carlo-acutis",
    name: "Saint Carlo Acutis",
    tags: ["youth", "Eucharist", "technology", "holiness"],
  },
  {
    id: "saint-pier-giorgio-frassati",
    name: "Saint Pier Giorgio Frassati",
    tags: ["youth", "friendship", "service", "adventure"],
  },
  {
    id: "saint-louis-de-montfort",
    name: "Saint Louis de Montfort",
    tags: ["Mary", "rosary", "devotion", "preaching"],
  },
  {
    id: "saint-alphonsus-liguori",
    name: "Saint Alphonsus Liguori",
    tags: ["moral theology", "confession", "preaching", "mercy"],
  },
  {
    id: "saint-john-vianney",
    name: "Saint John Vianney",
    tags: ["priests", "confession", "holiness", "parish"],
  },
  {
    id: "saint-charles-borromeo",
    name: "Saint Charles Borromeo",
    tags: ["bishops", "reform", "leadership", "plague"],
  },
  {
    id: "saint-mother-cabrini",
    name: "Saint Mother Cabrini",
    tags: ["immigrants", "mission", "courage", "service"],
    aliases: ["Saint Frances Xavier Cabrini"],
  },
];

export const saintDirectoryById = Object.fromEntries(
  saintDirectory.map((saint) => [saint.id, saint]),
) as Record<string, SaintDirectoryEntry>;

export function searchSaintDirectory(query: string): SaintDirectoryEntry[] {
  const normalizedQuery = normalizeSaintSearchText(query);

  if (!normalizedQuery) {
    return saintDirectory;
  }

  return saintDirectory.filter((saint) => {
    const searchableValues = [saint.name, ...saint.tags, ...(saint.aliases ?? [])];

    return searchableValues.some((value) =>
      normalizeSaintSearchText(value).includes(normalizedQuery),
    );
  });
}

export function normalizeSaintSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase();
}
