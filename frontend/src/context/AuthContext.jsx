import { createContext, useContext, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("planner_user");
    return stored ? JSON.parse(stored) : null;
  });

  const persist = (data) => {
    localStorage.setItem("planner_token", data.token);
    localStorage.setItem("planner_user", JSON.stringify(data));
    setUser(data);
  };

  const register = async (name, email, password) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    persist(data);
    return data;
  };

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    persist(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("planner_token");
    localStorage.removeItem("planner_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- intentional: context hook lives alongside its provider
export const useAuth = () => useContext(AuthContext);
