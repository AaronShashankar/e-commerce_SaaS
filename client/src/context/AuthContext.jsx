import { useEffect, useState } from "react";
import api, { setAccessToken, setSessionRefreshHandler } from "../api/http.js";
import { AuthContext } from "./auth-context.js";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSessionRefreshHandler((session) => setUser(session?.user ?? null));
    api
      .post("/auth/refresh-token")
      .then(({ data }) => {
        setAccessToken(data.accessToken);
        setUser(data.user);
      })
      .catch(() => setAccessToken(null))
      .finally(() => setLoading(false));
    return () => setSessionRefreshHandler(null);
  }, []);

  async function login(credentials) {
    const { data } = await api.post("/auth/login", credentials);
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data;
  }

  /** Register and immediately log the user in (both buyer and seller now return tokens) */
  async function register(details) {
    const { data } = await api.post("/auth/register", details);
    setAccessToken(data.accessToken);
    setUser(data.user);
    // data.onboardingRequired is true for sellers
    return data;
  }

  async function logout() {
    try {
      await api.post("/auth/logout");
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
