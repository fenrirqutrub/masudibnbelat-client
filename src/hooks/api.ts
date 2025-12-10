import axios, { type AxiosInstance, AxiosError } from "axios";

// ═══════════════════════════════════════════════════════════════
// 🔧 CONFIGURATION
// ═══════════════════════════════════════════════════════════════
const API_BASE_URL = (() => {
  const url = import.meta.env.VITE_API_URL as string | undefined;
  if (!url) {
    console.warn("VITE_API_URL not set, using localhost");
    return "http://localhost:5000/api";
  }
  return url.replace(/\/+$/, "") + "/api";
})();

const DEFAULT_TIMEOUT = 15000;
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000;

// ═══════════════════════════════════════════════════════════════
// 🛠️ TYPES
// ═══════════════════════════════════════════════════════════════
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasMore: boolean;
  };
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface Article {
  _id: string;
  title: string;
  description: string;
  img: {
    url: string;
    publicId: string;
  };
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  views: number;
  shares: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
  timeAgo?: string;
}

export interface Comment {
  _id: string;
  text: string;
  author: string;
  createdAt: string;
  timeAgo?: string;
}

export interface ArticleQueryParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  categorySlug?: string;
}

export interface CreateArticleData {
  title: string;
  description: string;
  categoryId: string;
  img: File;
}

export interface UpdateArticleData {
  title?: string;
  description?: string;
  categoryId?: string;
  img?: File;
}

export interface CreateCommentData {
  text: string;
  author?: string;
}

interface ApiErrorResponse {
  message?: string;
  [key: string]: unknown;
}

// ═══════════════════════════════════════════════════════════════
// 🔄 RETRY LOGIC
// ═══════════════════════════════════════════════════════════════
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const shouldRetry = (error: AxiosError): boolean => {
  if (!error.response) return true; // Network error
  const status = error.response.status;
  return status === 408 || status === 429 || (status >= 500 && status <= 599);
};

const retryRequest = async <T>(
  fn: () => Promise<T>,
  attempts = RETRY_ATTEMPTS
): Promise<T> => {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = i === attempts - 1;

      if (isLastAttempt || !shouldRetry(error as AxiosError)) {
        throw error;
      }

      const delay = RETRY_DELAY * Math.pow(2, i);
      console.warn(
        `Request failed, retrying in ${delay}ms... (${i + 1}/${attempts})`
      );
      await wait(delay);
    }
  }
  throw new Error("Max retries exceeded");
};

// ═══════════════════════════════════════════════════════════════
// 🌐 AXIOS INSTANCE
// ═══════════════════════════════════════════════════════════════
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: DEFAULT_TIMEOUT,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const message =
        (error.response.data as ApiErrorResponse)?.message ||
        "An error occurred";
      console.error(`API Error [${error.response.status}]:`, message);
    } else if (error.request) {
      console.error("Network Error: No response received");
    } else {
      console.error("Request Error:", error.message);
    }
    return Promise.reject(error);
  }
);

// ═══════════════════════════════════════════════════════════════
// 📂 CATEGORY API
// ═══════════════════════════════════════════════════════════════
export const categoryAPI = {
  /**  Get all categories    */
  getAll: () =>
    retryRequest(() => api.get<ApiResponse<Category[]>>("/categories")),

  /** Get category by slug */
  getBySlug: (slug: string) =>
    retryRequest(() => api.get<ApiResponse<Category>>(`/categories/${slug}`)),

  /**  Create a new category */
  create: (name: string) =>
    api.post<ApiResponse<Category>>("/categories", { name }),

  /**
   * Delete a category
   */
  delete: (id: string) => api.delete<ApiResponse<void>>(`/categories/${id}`),
};

// ═══════════════════════════════════════════════════════════════
// 📝 ARTICLE API
// ═══════════════════════════════════════════════════════════════
export const articleAPI = {
  /**
   * Get all articles with optional filters
   */
  getAll: (params?: ArticleQueryParams) =>
    retryRequest(() =>
      api.get<ApiResponse<Article[]>>("/articles", { params })
    ),

  /**
   * Get article by ID
   */
  getById: (id: string) =>
    retryRequest(() => api.get<ApiResponse<Article>>(`/articles/${id}`)),

  /**
   * Create a new article
   */
  create: (data: CreateArticleData) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("categoryId", data.categoryId);
    formData.append("img", data.img);

    return api.post<ApiResponse<Article>>("/articles", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /**
   * Update an article
   */
  update: (id: string, data: UpdateArticleData) => {
    const formData = new FormData();
    if (data.title) formData.append("title", data.title);
    if (data.description) formData.append("description", data.description);
    if (data.categoryId) formData.append("categoryId", data.categoryId);
    if (data.img) formData.append("img", data.img);

    return api.patch<ApiResponse<Article>>(`/articles/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /**
   * Delete an article
   */
  delete: (id: string) => api.delete<ApiResponse<void>>(`/articles/${id}`),

  /**
   * Increment view count
   */
  incrementView: (id: string) =>
    api.post<ApiResponse<{ views: number }>>(`/articles/${id}/view`),

  /**
   * Increment share count
   */
  incrementShare: (id: string) =>
    api.post<ApiResponse<{ shares: number }>>(`/articles/${id}/share`),
};

// ═══════════════════════════════════════════════════════════════
// 💬 COMMENT API
// ═══════════════════════════════════════════════════════════════
export const commentAPI = {
  /**
   * Get all comments for an article
   */
  getAll: (articleId: string) =>
    retryRequest(() =>
      api.get<ApiResponse<Comment[]>>(`/articles/${articleId}/comments`)
    ),

  /**
   * Add a comment to an article
   */
  create: (articleId: string, data: CreateCommentData) =>
    api.post<ApiResponse<Comment>>(`/articles/${articleId}/comments`, data),
};

// ═══════════════════════════════════════════════════════════════
// 🛠️ UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Format time ago in human-readable format
 */
export const formatTimeAgo = (date: string | Date): string => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);

  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];

  for (const { label, seconds: sec } of intervals) {
    const count = Math.floor(seconds / sec);
    if (count >= 1) {
      return `${count} ${label}${count > 1 ? "s" : ""} ago`;
    }
  }
  return "just now";
};

/**
 * Handle API errors with user-friendly messages
 */
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred"
    );
  }
  return error instanceof Error
    ? error.message
    : "An unexpected error occurred";
};

/**
 * Check if response is successful
 */
export const isSuccessResponse = <T>(
  response: ApiResponse<T>
): response is ApiResponse<T> & { success: true } => {
  return response.success === true;
};

// ═══════════════════════════════════════════════════════════════
// 📤 EXPORTS
// ═══════════════════════════════════════════════════════════════
export { api };
export default api;
