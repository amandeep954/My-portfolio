import axios from "axios";

const getBackendUrl = () => {
  const envUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const clean = envUrl.trim().replace(/\/+$/, "");
  return clean.endsWith("/api") ? clean : `${clean}/api`;
};

const BACKEND_URL = getBackendUrl();

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 8000,
});

// Interceptor to attach JWT token to admin requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==================== AUTH APIs ====================
export const loginAdmin = async (username, password) => {
  const response = await api.post("/auth/login", { username, password });
  return response.data;
};

export const verifyAdminTokenApi = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

// ==================== UPLOAD API ====================
export const uploadFileApi = async (file, category = "project", oldUrl = "") => {
  const formData = new FormData();
  formData.append("file", file);
  if (category) formData.append("category", category);
  if (oldUrl) formData.append("oldUrl", oldUrl);

  const response = await api.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// ==================== PROJECTS APIs ====================
export const fetchProjects = async () => {
  const response = await api.get("/projects");
  return Array.isArray(response.data) ? response.data : [];
};

export const createProjectApi = async (projectData) => {
  const response = await api.post("/projects", projectData);
  return response.data;
};

export const updateProjectApi = async (id, projectData) => {
  const response = await api.put(`/projects/${id}`, projectData);
  return response.data;
};

export const deleteProjectApi = async (id) => {
  const response = await api.delete(`/projects/${id}`);
  return response.data;
};

export const likeProjectApi = async (id) => {
  try {
    const response = await api.post(`/projects/${id}/like`);
    return response.data;
  } catch (error) {
    console.warn("Could not send like to server:", error.message);
    return { likes: 1 };
  }
};

// ==================== SKILLS APIs ====================
export const fetchSkills = async () => {
  const response = await api.get("/skills");
  return Array.isArray(response.data) ? response.data : [];
};

export const createSkillApi = async (skillData) => {
  const response = await api.post("/skills", skillData);
  return response.data;
};

export const toggleFeaturedSkillApi = async (id) => {
  const response = await api.patch(`/skills/${id}/featured`);
  return response.data;
};

export const deleteSkillApi = async (id) => {
  const response = await api.delete(`/skills/${id}`);
  return response.data;
};

// ==================== CONTACT APIs ====================
export const sendContactMessage = async (formData) => {
  try {
    const response = await api.post("/contact", formData);
    return response.data;
  } catch (error) {
    // Fallback to Google Sheets URL if primary backend is unreachable
    const googleSheetUrl = import.meta.env.VITE_GOOGLE_SHEET_URL;
    if (googleSheetUrl) {
      const params = new URLSearchParams();
      Object.keys(formData).forEach((k) => params.append(k, formData[k]));
      await axios.post(googleSheetUrl, params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      return { message: "Message sent via sheet fallback!" };
    }
    throw error;
  }
};

export const fetchContactMessages = async () => {
  const response = await api.get("/contact");
  return response.data;
};

export const toggleMessageReadApi = async (id) => {
  const response = await api.patch(`/contact/${id}/read`);
  return response.data;
};

export const deleteMessageApi = async (id) => {
  const response = await api.delete(`/contact/${id}`);
  return response.data;
};

// ==================== PROFILE SETTINGS APIs ====================
export const fetchProfileSettingsApi = async () => {
  try {
    const response = await api.get("/profile");
    return response.data;
  } catch (error) {
    console.warn("Could not fetch profile settings from DB:", error.message);
    return null;
  }
};

export const updateProfileSettingsApi = async (profileData) => {
  const response = await api.put("/profile", profileData);
  return response.data;
};

export default api;
