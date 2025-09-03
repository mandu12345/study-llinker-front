import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import PrivateRoute from "./auth/PrivateRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MainPage from "./pages/MainPage";   // ⭐ MainPage로 교체

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />  
          <Route path="/login" element={<Login />} />  
          <Route path="/register" element={<Register />} />

          {/* 메인페이지 */}
          <Route
            path="/main/*"
            element={
              <PrivateRoute>
                <MainPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
