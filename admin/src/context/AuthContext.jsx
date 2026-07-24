import { createContext, useContext, useEffect, useState } from "react";
import api, { setAccessToken, setSessionRefreshHandler } from "../api/http.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSessionRefreshHandler((session) => {
      // session is null when the interceptor's refresh attempt fails (refresh token expired)
      setUser(session?.user?.role === "admin" ? session.user : null);
    });
    api
      .post("/auth/refresh-token")
      .then(({ data }) => {
        if (data.user.role === "admin") {
          setAccessToken(data.accessToken);
          setUser(data.user);
        }
      })
      .catch(() => setAccessToken(null))
      .finally(() => setLoading(false));
    return () => setSessionRefreshHandler(null);
  }, []);

  async function login(credentials) {
    const { data } = await api.post("/auth/login", credentials);
    if (data.user.role !== "admin") {
      await api.post("/auth/logout");
      throw new Error("This account is not an administrator account");
    }
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
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
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
