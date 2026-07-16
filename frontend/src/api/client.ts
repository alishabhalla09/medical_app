const BASE_URL = 'http://127.0.0.1:8000';

export const apiClient = {
  async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('aegis_token');
    const headers = new Headers(options.headers || {});
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    // If not FormData, default to JSON content type
    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers
    });
    
    if (!response.ok) {
      const errBody = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(errBody.detail || 'API request failed');
    }
    
    // Handle binary responses (like PDF report)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/pdf')) {
      return response;
    }
    
    return response.json();
  },
  
  get(endpoint: string, options: RequestInit = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  },
  
  post(endpoint: string, body: any, options: RequestInit = {}) {
    const isFormData = body instanceof FormData;
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body)
    });
  }
};
