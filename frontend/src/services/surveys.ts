import { apiClient } from './api/client';
import { Survey } from '@/types/survey';

export const surveyService = {
  async getSurveys(): Promise<Survey[]> {
    return apiClient.get('/surveys');
  },

  async getSurvey(id: string): Promise<Survey> {
    return apiClient.get(`/surveys/${id}`);
  },

  async createSurvey(data: Omit<Survey, '_id' | 'created_at' | 'updated_at'>): Promise<Survey> {
    return apiClient.post('/surveys', data);
  },

  async updateSurvey(id: string, data: Omit<Survey, '_id' | 'created_at' | 'updated_at'>): Promise<Survey> {
    return apiClient.put(`/surveys/${id}`, data);
  },

  async deleteSurvey(id: string): Promise<void> {
    await apiClient.delete(`/surveys/${id}`);
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
