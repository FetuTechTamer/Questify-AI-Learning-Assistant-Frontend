const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://questiai-43b71abdd48b.herokuapp.com';

class API {
  static getHeaders(isFormData = false): HeadersInit {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  static async handleResponse(response: Response) {
    if (!response.ok) {
      let errorMessage = 'API Error';
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (e) {
        errorMessage = response.statusText;
      }
      throw new Error(errorMessage);
    }
    
    if (response.status === 204) return null;
    
    try {
      const data = await response.json();
      return data;
    } catch (e) {
      return response;
    }
  }

  static async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return this.handleResponse(response);
  }

  static async register(full_name: string, email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name, email, password }),
    });
    return this.handleResponse(response);
  }

  static async getUserProfile() {
    const response = await fetch(`${API_BASE_URL}/api/auth/user/profile`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  static async logout() {
    localStorage.removeItem('token');
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
    } catch (e) {
      // Ignore if no backend logout exists
    }
  }

  static async uploadMaterial(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/material/upload`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: formData,
    });
    return this.handleResponse(response);
  }

  static async getMaterials() {
    const response = await fetch(`${API_BASE_URL}/api/material/list`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  static async chat(message: string, materialId?: string) {
    const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ message, materialId }),
    });
    return this.handleResponse(response);
  }

  static async generateExam(materialId: string, numQuestions: number) {
    const response = await fetch(`${API_BASE_URL}/api/ai/generate-exam`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ materialId, numQuestions }),
    });
    return this.handleResponse(response);
  }

  static async getConceptMap(materialId: string) {
    const response = await fetch(`${API_BASE_URL}/api/ai/concept-map`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ materialId }),
    });
    return this.handleResponse(response);
  }
}

export default API;