import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Main axios instance
export const axiosPublic = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  withCredentials: true,
});

// Multipart config for file uploads
export const multipartConfig = {
  headers: {
    "Content-Type": "multipart/form-data",
  },
};

// Request interceptor
axiosPublic.interceptors.request.use(
  (config) => {
    // Add auth token if needed
    // const token = localStorage.getItem("token");
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
axiosPublic.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized access");
    }
    if (error.response?.status === 500) {
      console.error("Server error:", error.response?.data?.message);
    }
    return Promise.reject(error);
  },
);

// Default export
export default axiosPublic;
