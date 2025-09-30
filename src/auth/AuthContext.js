import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token); // JWT 디코딩
        setUser({
          token,
          role: decoded.role,
          userId: decoded.userId,     // JWT claim에 넣은 userId
          username: decoded.sub       // setSubject(username)
        });
      } catch (err) {
        console.error("JWT decode error", err);
        setUser(null);
      }
    }
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);
    // 디코딩해서 user 정보 저장
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
