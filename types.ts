export type TileStatus = "empty" | "correct" | "present" | "absent";

export interface TileState {
  letter: string;
  status: TileStatus;
}

export interface Suggestion {
  word: string;
  score: number; // 0-100 probability/confidence
  rank: number;
  reason?: string; // AI 推荐理由（可选）
}

export interface ProbabilityInsight {
  label: string;
  value: string; // e.g., "Contains letter 'E'"
  probability: number; // 0-100
  type: "high" | "possible" | "low";
}

export interface WordleResponse {
  suggestions: Suggestion[];
  insights: ProbabilityInsight[];
}

export interface EditingCell {
  row: number;
  col: number;
}

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  publish_date: string;
  wordle_answer?: string;
  created_at: string;
}
