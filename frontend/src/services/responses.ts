import { apiClient } from './api/client';

export interface SurveyResponse {
  survey_id: string;
  answers: Record<string, string | string[] | number>;
}

export const responsesService = {
  /**
   * Submit a response for a public survey.
   * POST /api/surveys/{surveyId}/responses
   *
   * The backend expects answers as an array of {question_id, value} objects.
   * The frontend stores answers as a flat Record<questionId, value>, so we
   * transform before sending.
   */
  async submitResponse(
    surveyId: string,
    answers: Record<string, string | string[] | number>
  ): Promise<void> {
    // Transform { q1: "Yes", q2: 4 } → [{ question_id: "q1", value: "Yes" }, ...]
    const answersArray = Object.entries(answers).map(([question_id, value]) => ({
      question_id,
      value,
    }));

    await apiClient.post(`/surveys/${surveyId}/responses`, {
      answers: answersArray,
    });
  },
};
