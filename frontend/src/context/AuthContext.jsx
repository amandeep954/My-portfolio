import React, { createContext, useState, useEffect, useContext } from "react";
import { loginAdmin, verifyAdminTokenApi, fetchProfileSettingsApi, updateProfileSettingsApi, fetchSkills } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("admin_token") || null);
  const [loading, setLoading] = useState(true);
  const [isBackendConnected, setIsBackendConnected] = useState(true);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);

  // Dynamic Portfolio Bio & Asset States (Loaded from AWS RDS / S3)
  const getSanitizedStorageUrl = (key) => {
    const val = localStorage.getItem(key) || "";
    if (val.startsWith("http://") || val.startsWith("https://")) return val;
    return "";
  };

  const [resumeUrl, setResumeUrl] = useState(
    getSanitizedStorageUrl("portfolio_resume_url")
  );
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(
    getSanitizedStorageUrl("portfolio_profile_photo_url")
  );
  const [locationText, setLocationText] = useState(
    localStorage.getItem("portfolio_location_text") || "Ghaziabad, Uttar Pradesh"
  );
  const [emailText, setEmailText] = useState(
    localStorage.getItem("portfolio_email_text") || "amandeep954h@gmail.com"
  );
  const [phoneText, setPhoneText] = useState(
    localStorage.getItem("portfolio_phone_text") || "+91 9548690146"
  );
  const [skillsList, setSkillsList] = useState([]);

  const refreshSkills = async () => {
    try {
      const sks = await fetchSkills();
      if (Array.isArray(sks)) {
        setSkillsList(sks);
        setIsBackendConnected(true);
      }
    } catch (err) {
      console.warn("Could not load skills from backend DB:", err.message);
      setIsBackendConnected(false);
      setSkillsList([]);
    }
  };

  const loadProfileFromDB = async () => {
    try {
      const data = await fetchProfileSettingsApi();
      if (data) {
        setIsBackendConnected(true);
        if (data.profile_photo) {
          setProfilePhotoUrl(data.profile_photo);
          localStorage.setItem("portfolio_profile_photo_url", data.profile_photo);
        }
        if (data.location) {
          setLocationText(data.location);
          localStorage.setItem("portfolio_location_text", data.location);
        }
        if (data.email) {
          setEmailText(data.email);
          localStorage.setItem("portfolio_email_text", data.email);
        }
        if (data.phone) {
          setPhoneText(data.phone);
          localStorage.setItem("portfolio_phone_text", data.phone);
        }
        if (data.resume_url) {
          setResumeUrl(data.resume_url);
          localStorage.setItem("portfolio_resume_url", data.resume_url);
        }
      }
    } catch (err) {
      console.warn("Could not load profile settings from DB:", err.message);
      setIsBackendConnected(false);
    }
  };

  const checkBackendConnection = async () => {
    await refreshSkills();
    await loadProfileFromDB();
  };

  useEffect(() => {
    checkBackendConnection();

    // Auto ping backend every 8 seconds if disconnected
    const interval = setInterval(() => {
      fetchSkills()
        .then(() => setIsBackendConnected(true))
        .catch(() => setIsBackendConnected(false));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await verifyAdminTokenApi();
          setUser(res.user);
        } catch (error) {
          console.warn("Invalid stored token, logging out.");
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  // Route/URL Listener for /admin/login or #/admin/login
  useEffect(() => {
    const checkAdminRoute = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (
        path.toLowerCase().includes("/admin/login") ||
        path.toLowerCase().includes("/admin") ||
        hash.toLowerCase().includes("admin/login") ||
        hash.toLowerCase().includes("admin")
      ) {
        if (token) {
          setIsAdminDashboardOpen(true);
        } else {
          setIsAdminModalOpen(true);
        }
      }
    };

    checkAdminRoute();
    window.addEventListener("popstate", checkAdminRoute);
    window.addEventListener("hashchange", checkAdminRoute);
    return () => {
      window.removeEventListener("popstate", checkAdminRoute);
      window.removeEventListener("hashchange", checkAdminRoute);
    };
  }, [token]);

  const login = async (username, password) => {
    const data = await loginAdmin(username, password);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("admin_token", data.token);
    setIsAdminModalOpen(false);
    setIsAdminDashboardOpen(true);
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("admin_token");
    setIsAdminDashboardOpen(false);
  };

  const updateResumeUrl = async (newUrl) => {
    setResumeUrl(newUrl);
    localStorage.setItem("portfolio_resume_url", newUrl);
    try {
      await updateProfileSettingsApi({ resume_url: newUrl });
    } catch (e) {
      console.warn("DB update failed for resume_url", e.message);
    }
  };

  const updateProfilePhotoUrl = async (newPhotoUrl) => {
    setProfilePhotoUrl(newPhotoUrl);
    localStorage.setItem("portfolio_profile_photo_url", newPhotoUrl);
    try {
      await updateProfileSettingsApi({ profile_photo: newPhotoUrl });
    } catch (e) {
      console.warn("DB update failed for profile_photo", e.message);
    }
  };

  const updateLocationText = async (newLocation) => {
    setLocationText(newLocation);
    localStorage.setItem("portfolio_location_text", newLocation);
    try {
      await updateProfileSettingsApi({ location: newLocation });
    } catch (e) {
      console.warn("DB update failed for location", e.message);
    }
  };

  const updateEmailText = async (newEmail) => {
    setEmailText(newEmail);
    localStorage.setItem("portfolio_email_text", newEmail);
    try {
      await updateProfileSettingsApi({ email: newEmail });
    } catch (e) {
      console.warn("DB update failed for email", e.message);
    }
  };

  const updatePhoneText = async (newPhone) => {
    setPhoneText(newPhone);
    localStorage.setItem("portfolio_phone_text", newPhone);
    try {
      await updateProfileSettingsApi({ phone: newPhone });
    } catch (e) {
      console.warn("DB update failed for phone", e.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!token,
        isAdminModalOpen,
        setIsAdminModalOpen,
        isAdminDashboardOpen,
        setIsAdminDashboardOpen,
        resumeUrl,
        updateResumeUrl,
        profilePhotoUrl,
        updateProfilePhotoUrl,
        locationText,
        updateLocationText,
        emailText,
        updateEmailText,
        phoneText,
        updatePhoneText,
        skillsList,
        refreshSkills,
        isBackendConnected,
        checkBackendConnection,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
