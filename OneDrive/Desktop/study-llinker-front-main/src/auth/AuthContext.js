import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // 앱 시작 시: localStorage → state
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);

        // userId가 0이거나 undefined면 쓰레기 토큰 처리
        if (!decoded.userId || decoded.userId === 0) {
          console.warn("Invalid token detected. Clearing storage.");
          localStorage.removeItem("token");
          return;
        }

        setUser({
          token,
          role: decoded.role,
          userId: decoded.userId,
          username: decoded.sub,
        });
      } catch (err) {
        localStorage.removeItem("token");
      }
    }
  }, []);

  // user 변경 시 axios 헤더 동기화
  useEffect(() => {
    if (user && user.token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${user.token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [user]);

  // 로그인
  const login = (token) => {
    localStorage.setItem("token", token);

    try {
      const decoded = jwtDecode(token);

      setUser({
        token,
        role: decoded.role,
        userId: decoded.userId,
        username: decoded.sub,
      });
    } catch (err) {
      console.error("JWT decode error", err);
      setUser(null);
    }
  };

  // 로그아웃
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