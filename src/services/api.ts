import apiClient from './apiClient';

export interface Collection {
  collection_id: string;
  title: string;
  description: string;
  icon?: string;
  color?: string;
  created_at: string;
}

export interface ExamQuestion {
  id: string;
  type: 'mcq' | 'true-false' | 'fill-blank' | 'matching' | 'coding' | 'short-answer';
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options?: string[];
  segments?: any[];
  matchingPairs?: any[];
  starterCode?: string;
  language?: string;
}

export interface ExamData {
  exam_id: string;
  questions: ExamQuestion[];
}

export interface SubmitResponse {
  score: number;
  feedback: string;
  details?: any;
}

export const api = {
  // Exams
  generateExam: async (params: { 
    collection_id: string; 
    question_count: number; 
    difficulty?: string 
  }): Promise<ExamData> => {
    const response = await apiClient.post('/api/exam/generate-exam', params);
    return response.data.data || response.data;
  },

  submitExam: async (params: { 
    exam_id: string; 
    answers: Record<string, any> 
  }): Promise<SubmitResponse> => {
    const response = await apiClient.post('/api/exam/submit', params);
    return response.data.data || response.data;
  },

  // Study Methods
  recordPomodoro: async (params: { collection_id: string; duration: number; completed: boolean }) => {
    const response = await apiClient.post('/api/study/pomodoro', params);
    return response.data;
  },
  getPomodoroStats: async (collection_id: string): Promise<any> => {
    const response = await apiClient.get(`/api/study/pomodoro/${collection_id}`);
    return response.data.data || response.data;
  },

  submitFeynman: async (params: { collection_id: string; explanation: string }): Promise<any> => {
    const response = await apiClient.post('/api/study/feynman', params);
    return response.data.data || response.data;
  },
  getFeynmanData: async (collection_id: string): Promise<any> => {
    const response = await apiClient.get(`/api/study/feynman/${collection_id}`);
    return response.data.data || response.data;
  },

  updateLeitnerProgress: async (params: { collection_id: string; card_id: string; success: boolean }) => {
    const response = await apiClient.post('/api/study/leitner', params);
    return response.data;
  },
  getLeitnerState: async (collection_id: string): Promise<any> => {
    const response = await apiClient.get(`/api/study/leitner/${collection_id}`);
    return response.data.data || response.data;
  },

  saveSQ3RProgress: async (params: { collection_id: string; step: string; data: any }) => {
    const response = await apiClient.post('/api/study/sq3r', params);
    return response.data;
  },
  getSQ3RData: async (collection_id: string): Promise<any> => {
    const response = await apiClient.get(`/api/study/sq3r/${collection_id}`);
    return response.data.data || response.data;
  },

  saveActiveRecallResult: async (params: { collection_id: string; question_id: string; result: any }) => {
    const response = await apiClient.post('/api/study/active-recall', params);
    return response.data;
  },
  getActiveRecallData: async (collection_id: string): Promise<any> => {
    const response = await apiClient.get(`/api/study/active-recall/${collection_id}`);
    return response.data.data || response.data;
  },

  // Notes
  getNotes: async (method: string, collection_id: string): Promise<any[]> => {
    const response = await apiClient.get(`/api/notes/${method}/${collection_id}`);
    return response.data.data || response.data || [];
  },
  saveNote: async (method: string, payload: any): Promise<any> => {
    const response = await apiClient.post(`/api/notes/${method}`, payload);
    return response.data.data || response.data;
  },
  deleteNote: async (method: string, note_id: string): Promise<void> => {
    await apiClient.delete(`/api/notes/${method}/${note_id}`);
  }
};
