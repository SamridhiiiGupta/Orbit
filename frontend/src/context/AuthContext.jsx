import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, validate stored token
  useEffect(() => {
    const token = localStorage.getItem("orbit_token");
    if (!token) { setLoading(false); return; }

    api.get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem("orbit_token"))
      .finally(() => setLoading(false));
  }, []);

  function login(token, userData) {
    localStorage.setItem("orbit_token", token);
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem("orbit_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
