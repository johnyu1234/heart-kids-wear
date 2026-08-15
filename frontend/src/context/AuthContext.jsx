import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/members/profile");
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, rememberMe = false) => {
    const res = await api.post("/auth/login", { email, password, remember_me: rememberMe });
    const { access_token, is_admin, member_id, full_name, email: userEmail } = res.data;
    localStorage.setItem("token", access_token);
    const userData = { email: userEmail, full_name, member_id, is_admin };
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    await fetchProfile();
    return res.data;
  };

  const register = async (formData) => {
    const res = await api.post("/auth/register", formData);
    const { access_token, is_admin, member_id, full_name, email } = res.data;
    localStorage.setItem("token", access_token);
    const userData = { email, full_name, member_id, is_admin };
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    await fetchProfile();
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshProfile: fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
