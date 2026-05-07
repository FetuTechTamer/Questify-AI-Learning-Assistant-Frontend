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
  question_id: string;
  question: string;
  question_type: "Multiple Choice" | "True/False" | "Fill in Blank" | "Matching" | "Coding" | "Short Answer";
  content: {
    options?: string[];
    answer?: boolean;
    sentence?: string;
    correct_word?: string;
    left_side?: string[];
    right_side?: string[];
    pairs?: Record<string, string>;
    problem_statement?: string;
    initial_code?: string;
    solution_code?: string;
    model_answer?: string;
  };
  difficulty?: string;
}

export interface ExamData {
  exam_id: string;
  questions: ExamQuestion[];
}


export interface SubmitResponse {
  score?: number; // fallback
  total_score?: number;
  max_score?: number;
  status?: string;
  feedback?: string;
  graded_items?: Array<{
    question_id: string;
    score: number;
    score_attained?: number; // compat
    max_score: number;
    feedback: string;
    feedback_note?: string; // compat
    correct?: boolean;
    is_correct?: boolean; // compat
  }>;
  details?: any;
}

export const api = {
  // Exams
  generateExam: async (params: { 
    collection_id: string; 
    chapter_ids: string[];
    question_count: number; 
    difficulty?: string;
    question_types: string[];
  }): Promise<ExamData> => {
    const url = '/api/exam/generate-exam';
    const token = localStorage.getItem('access_token');
    
    console.log('--- EXAM GENERATION START ---');
    console.log('Request URL:', url);
    console.log('Request Body:', params);
    console.log('Request Headers:', {
      'Authorization': token ? `Bearer ${token.substring(0, 10)}...` : 'None',
      'Content-Type': 'application/json'
    });

    try {
      const response = await apiClient.post(url, params);
      const data = response.data.data || response.data;
      
      // Handle cases where questions might be in an 'items' field or similar
      let questions = data.questions || data.items || [];
      
      // Normalize questions: handle different field names for question text
      questions = questions.map((q: any) => ({
        ...q,
        question: q.question || q.text || q.question_text || "Question text not provided"
      }));

      return {
        ...data,
        questions
      };
    } catch (error: any) {
      console.error('--- EXAM GENERATION FAILED ---');
      
      if (error.response) {
        console.error('Response Status:', error.response.status);
        console.error('Response Data (Raw/Parsed):', error.response.data);
        console.error('Response Headers:', error.response.headers);
      } else if (error.request) {
        console.error('Network Error - No response received:', error.request);
      } else {
        console.error('Error during request setup:', error.message);
      }
      
      throw error;
    }
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

  // Teaching Simulation
  getTeachingData: async (collection_id: string): Promise<any> => {
    const response = await apiClient.get(`/api/study/teaching/${collection_id}`);
    return response.data.data || response.data;
  },
  submitTeachingExplanation: async (params: { collection_id: string; explanation: string }): Promise<any> => {
    const response = await apiClient.post('/api/study/teaching', params);
    return response.data.data || response.data;
  },

  // Spaced Repetition
  getSpacedRepetitionData: async (collection_id: string): Promise<any> => {
    const response = await apiClient.get(`/api/study/spaced-repetition/${collection_id}`);
    return response.data.data || response.data;
  },
  updateSpacedRepetitionProgress: async (params: { collection_id: string; item_id: string; confidence: number }) => {
    const response = await apiClient.post('/api/study/spaced-repetition', params);
    return response.data;
  },

  // Standard Read
  getStandardReadData: async (collection_id: string): Promise<any> => {
    const response = await apiClient.get(`/api/study/standard-read/${collection_id}`);
    return response.data.data || response.data;
  },

  // Blurting
  getBlurtingData: async (collection_id: string): Promise<any> => {
    const response = await apiClient.get(`/api/study/blurting/${collection_id}`);
    return response.data.data || response.data;
  },
  submitBlurting: async (params: { collection_id: string; explanation: string }): Promise<any> => {
    const response = await apiClient.post('/api/study/blurting', params);
    return response.data.data || response.data;
  },

  // Interleaved Practice
  getInterleavedData: async (collection_id: string): Promise<any> => {
    const response = await apiClient.get(`/api/study/interleaved/${collection_id}`);
    return response.data.data || response.data;
  },
  updateInterleavedProgress: async (params: { collection_id: string; item_id: string; confidence: number }) => {
    const response = await apiClient.post('/api/study/interleaved', params);
    return response.data;
  },

  // Reverse Learning
  getReverseLearningData: async (collection_id: string): Promise<any> => {
    const response = await apiClient.get(`/api/study/reverse-learning/${collection_id}`);
    return response.data.data || response.data;
  },
  updateReverseLearningProgress: async (params: { collection_id: string; item_id: string; confidence: number }) => {
    const response = await apiClient.post('/api/study/reverse-learning', params);
    return response.data;
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
