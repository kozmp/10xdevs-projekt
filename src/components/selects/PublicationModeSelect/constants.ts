import type { PublicationModeOption } from "./types";

export const PUBLICATION_MODES: PublicationModeOption[] = [
  {
    value: "draft",
    label: "Szkic",
    description: "Zapisz jako szkic do późniejszego przeglądu",
  },
  {
    value: "published",
    label: "Opublikuj",
    description: "Opublikuj od razu po wygenerowaniu",
  },
];

export const DEFAULT_LABEL = "Tryb publikacji";
