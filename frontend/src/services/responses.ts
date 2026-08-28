import { apiClient } from './api/client';

export interface SurveyResponse {
  survey_id: string;
  answers: Record<string, string | string[] | number>;
}

const USE_REAL_API = false;

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

export const responsesService = {
  /**
   * Submit a response for a public survey.
   * When FastAPI endpoint is ready, set USE_REAL_API = true.
   * POST /api/surveys/{surveyId}/responses
   */
  async submitResponse(surveyId: string, answers: Record<string, string | string[] | number>): Promise<void> {
    if (USE_REAL_API) {
      await apiClient.post(`/surveys/${surveyId}/responses`, { answers });
      return;
    }
    await delay();
    console.log('[Mock] Submitted response for survey', surveyId, answers);
  },
};
