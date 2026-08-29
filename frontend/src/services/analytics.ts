import { apiClient } from './api/client';

export interface ChoiceCount { name: string; count: number }
export interface SurveyAnalyticsData {
  survey_id: string;
  title: string;
  total_responses: number;
  question_count: number;
  average_rating: number | null;
  per_question: PerQuestionAnalytics[];
}

export interface PerQuestionAnalytics {
  question_id: string;
  label: string;
  type: string;
  choice_counts?: ChoiceCount[];
  average?: number;
  distribution?: ChoiceCount[];
  text_responses?: string[];
}

// ── Shape returned by the FastAPI backend ────────────────────────────────
interface BackendQuestion {
  id: string;
  label: string;
  type: string;
  // single_choice / checkbox
  counts?: Record<string, number>;
  // rating
  average?: number | null;
  count?: number;
  // text
  answers?: string[];
}

interface BackendAnalytics {
  survey_id: string;
  title: string;
  total_responses: number;
  questions: BackendQuestion[];
}

// ── Transform backend → frontend shape ───────────────────────────────────
function transform(raw: BackendAnalytics): SurveyAnalyticsData {
  const per_question: PerQuestionAnalytics[] = raw.questions.map((q) => {
    const base: PerQuestionAnalytics = {
      question_id: q.id,
      label: q.label,
      type: q.type,
    };

    if (q.type === 'single_choice' || q.type === 'checkbox') {
      const counts = q.counts || {};
      base.choice_counts = Object.entries(counts).map(([name, count]) => ({ name, count }));
    }

    if (q.type === 'rating') {
      base.average = q.average ?? undefined;
      // Build a distribution array from raw counts if available
      const counts = q.counts || {};
      if (Object.keys(counts).length > 0) {
        base.distribution = Object.entries(counts)
          .sort(([a], [b]) => Number(b) - Number(a))
          .map(([name, count]) => ({ name: `${name} ★`, count }));
      }
    }

    if (q.type === 'text') {
      base.text_responses = q.answers || [];
    }

    return base;
  });

  // Compute average_rating across all rating questions
  const ratingQuestions = per_question.filter((q) => q.type === 'rating' && q.average != null);
  const average_rating =
    ratingQuestions.length > 0
      ? Math.round(
          (ratingQuestions.reduce((sum, q) => sum + (q.average ?? 0), 0) /
            ratingQuestions.length) *
            10
        ) / 10
      : null;

  return {
    survey_id: raw.survey_id,
    title: raw.title,
    total_responses: raw.total_responses,
    question_count: raw.questions.length,
    average_rating,
    per_question,
  };
}

export const analyticsService = {
  /**
   * Fetch analytics for a survey (admin-only, requires JWT token).
   * GET /api/surveys/{surveyId}/analytics
   */
  async getAnalytics(surveyId: string): Promise<SurveyAnalyticsData> {
    const raw: BackendAnalytics = await apiClient.get(`/surveys/${surveyId}/analytics`);
    return transform(raw);
  },
};
