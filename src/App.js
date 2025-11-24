// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import PrivateRoute from "./auth/PrivateRoute";

// 사용자 관련 페이지
import Login from "./pages/Login";
import Register from "./pages/Register";
import MainPage from "./pages/MainPage";
import MyPage from "./pages/main/MyPage";
import Board from "./pages/main/Board"; 
import BoardWrite from "./pages/main/BoardWrite";

// 관리자 관련 페이지
import AdminPage from "./pages/AdminPage";
import AnswerPage from "./pages/admin/AnswerPage";   // “문의 답변 작성” 페이지
import PostEditPage from "./pages/admin/PostEditPage"; // “게시글 수정” 페이지

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          {/* ======================= */}
          {/* 🔹 일반 사용자 라우트 */}
          {/* ======================= */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 메인페이지 (보호된 경로) */}
          <Route
            path="/main/*"
            element={
              <PrivateRoute>
                <MainPage />
              </PrivateRoute>
            }
          >
            <Route path="board" element={<Board />} />
            <Route path="board/write" element={<BoardWrite />} />
            <Route path="mypage" element={<MyPage />} />
          </Route>

          {/* ======================= */}
          {/* 🔹 관리자 메인 (AdminPage 내부 탭 구성) */}
          {/* ======================= */}
          <Route
            path="/admin/*"
            element={
              <PrivateRoute>
                <AdminPage />
              </PrivateRoute>
            }
          />

          {/* ======================= */}
          {/* 🔹 개별 상세 페이지 (독립형) */}
          {/* ======================= */}

          {/* 문의 답변 작성 페이지 */}
          <Route
            path="/admin/system/answer/:id"
            element={
              <PrivateRoute>
                <AnswerPage />
              </PrivateRoute>
            }
          />

          {/* 게시글 수정 페이지 */}
          <Route
            path="/admin/board/edit/:id"
            element={
              <PrivateRoute>
                <PostEditPage />
              </PrivateRoute>
            }
          />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
