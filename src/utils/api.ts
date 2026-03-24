const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface FetchOptions extends RequestInit {
  userId?: string;
}

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { userId, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  if (userId) {
    (headers as Record<string, string>)['x-user-id'] = userId;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(data.error || 'An error occurred', response.status);
  }

  return data;
}

export const api = {
  get: <T>(endpoint: string, userId?: string) =>
    fetchApi<T>(endpoint, { method: 'GET', userId }),

  post: <T>(endpoint: string, body: any, userId?: string) =>
    fetchApi<T>(endpoint, { method: 'POST', body: JSON.stringify(body), userId }),

  put: <T>(endpoint: string, body: any, userId?: string) =>
    fetchApi<T>(endpoint, { method: 'PUT', body: JSON.stringify(body), userId }),

  delete: <T>(endpoint: string, userId?: string) =>
    fetchApi<T>(endpoint, { method: 'DELETE', userId }),
};

export { ApiError };
