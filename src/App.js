import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import PrivateRoute from "./auth/PrivateRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MainPage from "./pages/MainPage";
import AdminPage from "./pages/AdminPage";
import Profile from "./pages/Profile";
import Board from "./pages/main/Board"; 
import BoardWrite from "./pages/main/BoardWrite";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 사용자 */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 메인 레이아웃 안에서 보여지는 페이지들 */}
          <Route
            path="/main/*"
            element={
              <PrivateRoute>
                <MainPage />
              </PrivateRoute>
            }
          >
            {/* 하위 라우트 */}
            <Route path="board" element={<Board />} />
            <Route path="board/write" element={<BoardWrite />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* 관리자 페이지 */}
          <Route
            path="/admin/*"
            element={
              <PrivateRoute>
                <AdminPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
