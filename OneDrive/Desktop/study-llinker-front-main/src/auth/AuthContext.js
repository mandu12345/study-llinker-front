import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // 앱 시작 시: localStorage → state
  useEffect(() => {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decoded = jwtDecode(token);

      // 🔥 userId가 0이거나 undefined면 쓰레기 토큰이므로 제거
      if (!decoded.userId || decoded.userId === 0) {
        console.warn("🚨 Invalid token detected. Clearing storage.");
        localStorage.removeItem("token");
        return;
      }

      setUser({
        token,
        role: decoded.role,
        userId: decoded.userId,
        username: decoded.sub
      });
    } catch (err) {
      localStorage.removeItem("token");
    }
  }
}, []);


  // 로그인 시 호출되는 함수
  const login = (token) => {
    localStorage.setItem("token", token);

    try {
      const decoded = jwtDecode(token);

      console.log("🟢 [AuthContext] user after login:", decoded);

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
