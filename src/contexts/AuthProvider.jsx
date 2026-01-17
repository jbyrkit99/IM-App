import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const session = await api.auth.getSession();
      if (session) {
        setUser(session.user);
        setToken(session.token);
      }
      setLoading(false);
    })();
  }, []);

  async function register(email, password) {
    const res = await api.auth.register({ email, password });
    setUser(res.user);
    setToken(res.token);
    return res.user;
  }

  async function login(email, password) {
    const res = await api.auth.login({ email, password });
    setUser(res.user);
    setToken(res.token);
    return res.user;
  }

  async function logout() {
    await api.auth.logout();
    setUser(null);
    setToken(null);
  }

  async function updateProfile(patch) {
    if (!user) throw new Error("Not logged in.");

    const body = {
      userId: user.id,
      ...patch,
    };

    Object.keys(body).forEach((k) => {
      if (body[k] === undefined) delete body[k];
    });

    const updated = await api.auth.updateProfile(body);
    setUser(updated);
    return updated;
  }

  const value = useMemo(
    () => ({ user, token, loading, register, login, logout, updateProfile }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
