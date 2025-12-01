import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({
          token,
          role: decoded.role,
          userId: decoded.userId,
          username: decoded.sub
        });
      } catch (err) {
        console.error("JWT decode error", err);
        setUser(null);
      }
    }
  }, []);

  // token만 받는 구조를 확정
  const login = (token) => {
    localStorage.setItem("token", token);

    try {
      const decoded = jwtDecode(token);
      setUser({
        token,
        role: decoded.role,
        userId: decoded.userId,
        username: decoded.sub
      });
    } catch (err) {
      console.error("JWT decode error", err);
      setUser(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
