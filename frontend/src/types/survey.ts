export type QuestionType =
  | "text"
  | "single_choice"
  | "checkbox"
  | "rating";

export interface Condition {
  question_id: string;
  operator: "equals";
  value: string | number;
}

export interface Question {
  id: string;
  type: QuestionType;
  label: string;
  required: boolean;
  options?: string[];
  min?: number;
  max?: number;
  condition?: Condition | null;
}

export interface Survey {
  _id?: string;
  title: string;
  description: string;
  questions: Question[];
  created_at?: string;
  updated_at?: string;
}
