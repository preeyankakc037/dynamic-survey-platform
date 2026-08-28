import { apiClient } from './api/client';
import { Survey } from '@/types/survey';

// ---------------------------------------------------------------------------
// MOCK DATA
// Used when the FastAPI backend is not yet running.
// Replace individual functions below with real apiClient calls as endpoints go live.
// ---------------------------------------------------------------------------

let mockSurveys: Survey[] = [
  {
    _id: 'mock-1',
    title: 'Student Feedback',
    description: 'Help us improve our course by sharing your experience.',
    questions: [
      { id: 'q1', type: 'text', label: 'What is your name?', required: true },
      {
        id: 'q2',
        type: 'single_choice',
        label: 'Did you enjoy the course?',
        required: true,
        options: ['Yes', 'No'],
      },
      {
        id: 'q3',
        type: 'text',
        label: 'What did you enjoy most?',
        required: false,
        condition: { question_id: 'q2', operator: 'equals', value: 'Yes' },
      },
      {
        id: 'q4',
        type: 'checkbox',
        label: 'Which technologies do you use?',
        required: false,
        options: ['React', 'Python', 'FastAPI', 'Node.js'],
      },
      {
        id: 'q5',
        type: 'rating',
        label: 'Rate the course overall',
        required: true,
        min: 1,
        max: 5,
      },
    ],
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    _id: 'mock-2',
    title: 'Course Evaluation',
    description: 'End-of-term evaluation form.',
    questions: [
      { id: 'q1', type: 'text', label: 'Instructor name', required: true },
      {
        id: 'q2',
        type: 'rating',
        label: 'Rate the instructor',
        required: true,
        min: 1,
        max: 5,
      },
    ],
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

// Simulate network delay
const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

// Toggle this to true to use real FastAPI endpoints instead of mock data.
const USE_REAL_API = false;

// ---------------------------------------------------------------------------
// Service methods
// ---------------------------------------------------------------------------

export const surveyService = {
  async getSurveys(): Promise<Survey[]> {
    if (USE_REAL_API) {
      return apiClient.get('/surveys');
    }
    await delay();
    return [...mockSurveys];
  },

  async getSurvey(id: string): Promise<Survey> {
    if (USE_REAL_API) {
      return apiClient.get(`/surveys/${id}`);
    }
    await delay();
    const survey = mockSurveys.find((s) => s._id === id);
    if (!survey) throw new Error('Survey not found');
    return { ...survey };
  },

  async createSurvey(data: Omit<Survey, '_id' | 'created_at' | 'updated_at'>): Promise<Survey> {
    if (USE_REAL_API) {
      return apiClient.post('/surveys', data);
    }
    await delay();
    const now = new Date().toISOString();
    const newSurvey: Survey = {
      ...data,
      _id: `mock-${Date.now()}`,
      created_at: now,
      updated_at: now,
    };
    mockSurveys = [newSurvey, ...mockSurveys];
    return { ...newSurvey };
  },

  async updateSurvey(id: string, data: Omit<Survey, '_id' | 'created_at' | 'updated_at'>): Promise<Survey> {
    if (USE_REAL_API) {
      return apiClient.put(`/surveys/${id}`, data);
    }
    await delay();
    const idx = mockSurveys.findIndex((s) => s._id === id);
    if (idx === -1) throw new Error('Survey not found');
    const updated: Survey = {
      ...mockSurveys[idx],
      ...data,
      updated_at: new Date().toISOString(),
    };
    mockSurveys[idx] = updated;
    return { ...updated };
  },

  async deleteSurvey(id: string): Promise<void> {
    if (USE_REAL_API) {
      await apiClient.delete(`/surveys/${id}`);
      return;
    }
    await delay();
    mockSurveys = mockSurveys.filter((s) => s._id !== id);
  },

  async duplicateSurvey(id: string): Promise<Survey> {
    const original = await this.getSurvey(id);
    return this.createSurvey({
      title: `${original.title} (Copy)`,
      description: original.description,
      questions: original.questions,
    });
  },
};
