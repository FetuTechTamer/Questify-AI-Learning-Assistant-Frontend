import apiClient from './apiClient';
import { collectionsService, Collection } from './collectionsService';

// Re-export Collection so consumers can import from a single place
export type { Collection };

// ─── Response Shapes ─────────────────────────────────────────────────────────

export interface PomodoroSession {
  session_id?: string;
  duration?: number;
  completed?: boolean;
  created_at?: string;
  [key: string]: any;
}

export interface PomodoroData {
  title?: string;
  completed_sessions?: number;
  sessions?: PomodoroSession[];
  [key: string]: any;
}

export interface FeynmanData {
  concept?: string;
  simple_explanation?: string;
  key_points?: string[];
  knowledge_gaps?: string[];
  feedback?: string;
  follow_up?: string;
  history?: { role: string; content: string }[];
  [key: string]: any;
}

export interface LeitnerCard {
  id?: string;
  card_id?: string;
  topic?: string;
  question: string;
  answer: string;
  difficulty?: string;
  box?: number;
  [key: string]: any;
}

export interface LeitnerBox {
  box_number?: number;
  level?: number;
  cards: LeitnerCard[];
  [key: string]: any;
}

export interface LeitnerData {
  title?: string;
  boxes?: LeitnerBox[];
  [key: string]: any;
}

export interface SQ3RSection {
  title: string;
  content?: string;
  [key: string]: any;
}

export interface SQ3RData {
  survey?: string;
  questions?: string[];
  recite_points?: string[];
  review_summary?: string;
  sections?: SQ3RSection[];
  current_step?: string;
  [key: string]: any;
}

export interface ActiveRecallPrompt {
  question: string;
  hint?: string;
  answer?: string;
  [key: string]: any;
}

export interface ActiveRecallData {
  topic?: string;
  prompts?: ActiveRecallPrompt[];
  questions?: ActiveRecallPrompt[];
  [key: string]: any;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const unwrap = (response: any): any =>
  response.data?.data ?? response.data;

const post = async (url: string, payload: object): Promise<any> => {
  console.group(`[studyService POST] ${url}`);
  console.log('Payload:', payload);
  console.groupEnd();
  try {
    const res = await apiClient.post(url, payload);
    const data = unwrap(res);
    console.log(`[studyService POST SUCCESS] ${url}`, data);
    return data;
  } catch (error: any) {
    console.error(`[studyService POST ERROR] ${url}`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

const get = async (url: string): Promise<any> => {
  console.log(`[studyService GET] ${url}`);
  try {
    const res = await apiClient.get(url);
    const data = unwrap(res);
    console.log(`[studyService GET SUCCESS] ${url}`, data);
    return data;
  } catch (error: any) {
    console.error(`[studyService GET ERROR] ${url}`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

// ─── Service ──────────────────────────────────────────────────────────────────

export const studyService = {
  // Collections
  getCollections: (): Promise<Collection[]> =>
    collectionsService.getCollections(),

  // Pomodoro
  generatePomodoro: (collectionId: string): Promise<PomodoroData> =>
    post('/api/study/pomodoro', { collection_id: collectionId }),

  getPomodoro: (collectionId: string): Promise<PomodoroData> =>
    get(`/api/study/pomodoro/${collectionId}`),

  // Feynman
  generateFeynman: (collectionId: string): Promise<FeynmanData> =>
    post('/api/study/feynman', { collection_id: collectionId }),

  getFeynman: (collectionId: string): Promise<FeynmanData> =>
    get(`/api/study/feynman/${collectionId}`),

  // Leitner
  generateLeitner: (collectionId: string): Promise<LeitnerData> =>
    post('/api/study/leitner', { collection_id: collectionId }),

  getLeitner: (collectionId: string): Promise<LeitnerData> =>
    get(`/api/study/leitner/${collectionId}`),

  // SQ3R
  generateSQ3R: (collectionId: string): Promise<SQ3RData> =>
    post('/api/study/sq3r', { collection_id: collectionId }),

  getSQ3R: (collectionId: string): Promise<SQ3RData> =>
    get(`/api/study/sq3r/${collectionId}`),

  // Active Recall
  generateActiveRecall: (collectionId: string): Promise<ActiveRecallData> =>
    post('/api/study/active-recall', { collection_id: collectionId }),

  getActiveRecall: (collectionId: string): Promise<ActiveRecallData> =>
    get(`/api/study/active-recall/${collectionId}`),

  // ── Generic helpers kept for backward-compat with method components ──────
  /** @deprecated Use the named generate* / get* methods instead. */
  generateSession: (method: string, collectionId: string): Promise<any> => {
    const slug = method.toLowerCase().replace('_', '-');
    return post(`/api/study/${slug}`, { collection_id: collectionId });
  },

  /** @deprecated Use the named generate* / get* methods instead. */
  getSession: (method: string, collectionId: string): Promise<any> => {
    const slug = method.toLowerCase().replace('_', '-');
    return get(`/api/study/${slug}/${collectionId}`);
  },
};
