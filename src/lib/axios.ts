import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

// Add a request interceptor to inject the token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// BUGGY INTERCEPTOR: Does not use a lock or queue for multiple 401s
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken =
          typeof window !== "undefined"
            ? localStorage.getItem("refreshToken")
            : null;

        // Attempt to refresh token.
        // BUG: If multiple requests fail with 401 at the same time, this will be called multiple times concurrently!
        const res = await axios.post("/api/auth/refresh", { refreshToken });

        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", res.data.accessToken);
          localStorage.setItem("refreshToken", res.data.refreshToken);
        }

        // The request interceptor will automatically add the new access token
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed (e.g., due to race condition penalty returning 403 or 401)
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
