import type { Language, Style } from './types';

export const LANGUAGES: Language[] = [
  { id: "pl", name: "Polski" },
  { id: "en", name: "English" },
];

export const STYLES: Style[] = [
  {
    id: "professional",
    name: "Profesjonalny",
    description: "Techniczny język z naciskiem na specyfikację i szczegóły",
  },
  {
    id: "casual",
    name: "Casualowy",
    description: "Przyjazny i konwersacyjny ton, jak rozmowa z przyjacielem",
  },
  {
    id: "sales-focused",
    name: "Sprzedażowy",
    description: "Podkreśla korzyści i wartość produktu",
  },
];
