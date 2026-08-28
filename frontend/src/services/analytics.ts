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

const USE_REAL_API = false;

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

// Mock analytics data keyed by survey ID
const mockAnalytics: Record<string, SurveyAnalyticsData> = {
  'mock-1': {
    survey_id: 'mock-1',
    title: 'Student Feedback',
    total_responses: 48,
    question_count: 5,
    average_rating: 4.4,
    per_question: [
      {
        question_id: 'q2',
        label: 'Did you enjoy the course?',
        type: 'single_choice',
        choice_counts: [
          { name: 'Yes', count: 36 },
          { name: 'No', count: 12 },
        ],
      },
      {
        question_id: 'q4',
        label: 'Which technologies do you use?',
        type: 'checkbox',
        choice_counts: [
          { name: 'React', count: 35 },
          { name: 'Python', count: 28 },
          { name: 'FastAPI', count: 21 },
          { name: 'Node.js', count: 17 },
        ],
      },
      {
        question_id: 'q5',
        label: 'Rate the course overall',
        type: 'rating',
        average: 4.4,
        distribution: [
          { name: '5 ★', count: 22 },
          { name: '4 ★', count: 14 },
          { name: '3 ★', count: 7 },
          { name: '2 ★', count: 3 },
          { name: '1 ★', count: 2 },
        ],
      },
      {
        question_id: 'q1',
        label: 'What is your name?',
        type: 'text',
        text_responses: [
          'Really enjoyed the practical examples.',
          'The interface was easy to use.',
          'Would like more advanced exercises.',
          'The pacing was a bit too fast in the second week.',
          'Great experience overall!',
        ],
      },
    ],
  },
  'mock-2': {
    survey_id: 'mock-2',
    title: 'Course Evaluation',
    total_responses: 23,
    question_count: 2,
    average_rating: 4.1,
    per_question: [
      {
        question_id: 'q2',
        label: 'Rate the instructor',
        type: 'rating',
        average: 4.1,
        distribution: [
          { name: '5 ★', count: 10 },
          { name: '4 ★', count: 8 },
          { name: '3 ★', count: 3 },
          { name: '2 ★', count: 1 },
          { name: '1 ★', count: 1 },
        ],
      },
    ],
  },
};

export const analyticsService = {
  async getAnalytics(surveyId: string): Promise<SurveyAnalyticsData> {
    if (USE_REAL_API) {
      return apiClient.get(`/surveys/${surveyId}/analytics`);
    }
    await delay();
    const data = mockAnalytics[surveyId];
    if (!data) {
      // Return empty analytics for surveys without mock data
      return {
        survey_id: surveyId,
        title: 'Survey',
        total_responses: 0,
        question_count: 0,
        average_rating: null,
        per_question: [],
      };
    }
    return { ...data };
  },
};
