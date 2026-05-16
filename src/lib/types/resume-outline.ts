export type OutlineBlock = {
  id: number;
  title: string;
  bullets?: string[];
  paragraph?: string;
};

export type GenerateOutlineRequest = {
  prompt: string;
  card_count: number;
  format: "A4" | "Letter";
  language: string;
};

export type GenerateOutlineResponse = {
  blocks: OutlineBlock[];
  suggested_label: string;
};
