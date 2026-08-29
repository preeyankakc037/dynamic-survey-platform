import { useState, useCallback } from 'react';
import { Survey, Question, QuestionType } from '@/types/survey';

const generateId = () => Math.random().toString(36).substr(2, 9);

export function useSurveyBuilder(initialSurvey?: Survey) {
  const [survey, setSurvey] = useState<Survey>(
    initialSurvey || {
      title: '',
      description: '',
      questions: [],
    }
  );

  const updateMetadata = useCallback((title: string, description: string) => {
    setSurvey((prev) => ({ ...prev, title, description }));
  }, []);

  const addQuestion = useCallback((type: QuestionType) => {
    const newQuestion: Question = {
      id: generateId(),
      type,
      label: 'New Question',
      required: false,
      ...(type === 'single_choice' || type === 'checkbox' ? { options: ['Option 1'] } : {}),
      ...(type === 'rating' ? { min: 1, max: 5 } : {}),
    };
    setSurvey((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  }, []);

  const updateQuestion = useCallback((id: string, updates: Partial<Question>) => {
    setSurvey((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === id ? { ...q, ...updates } : q)),
    }));
  }, []);

  const deleteQuestion = useCallback((id: string) => {
    setSurvey((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== id),
    }));
  }, []);

  const duplicateQuestion = useCallback((id: string) => {
    setSurvey((prev) => {
      const qIndex = prev.questions.findIndex((q) => q.id === id);
      if (qIndex === -1) return prev;
      const questionToDuplicate = prev.questions[qIndex];
      const newQuestion: Question = {
        ...questionToDuplicate,
        id: generateId(),
      };
      const newQuestions = [...prev.questions];
      newQuestions.splice(qIndex + 1, 0, newQuestion);
      return { ...prev, questions: newQuestions };
    });
  }, []);

  const reorderQuestions = useCallback((startIndex: number, endIndex: number) => {
    setSurvey((prev) => {
      const result = Array.from(prev.questions);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return { ...prev, questions: result };
    });
  }, []);

  return {
    survey,
    updateMetadata,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    duplicateQuestion,
    reorderQuestions,
    setSurvey,
  };
}
