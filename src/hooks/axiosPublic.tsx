import axios from "axios";

export const axiosPublic = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "X-Requested-With": "XMLHttpRequest" },
  withCredentials: true,
});

export const multipartConfig = {
  headers: {
    "content-type": "multipart/form-data",
  },
};
