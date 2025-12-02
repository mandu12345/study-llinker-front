import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import api from "../api/axios";
import AlertModal from "./AlertModal";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [modal, setModal] = useState({
    show: false,
    title: "",
    message: "",
    type: "",
    redirect: null,
  });

  const handleCloseModal = () => {
    setModal({ show: false, title: "", message: "", type: "", redirect: null });
    if (modal.redirect) navigate(modal.redirect);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/tokens", { username, password });
      const token = res.data.accessToken;

      if (!token) {
        setModal({
          show: true,
          title: "로그인 실패",
          message: "서버에서 토큰을 받지 못했습니다.",
          type: "error",
        });
        return;
      }

      // JWT payload에서 role 추출
      const payload = JSON.parse(atob(token.split(".")[1]));
      const role = payload.role;

      // 토큰 저장 및 AuthContext 상태 업데이트
      login(token);

      // role 에 따라 이동 경로/메시지 분기
      if (role === "ADMIN") {
        setModal({
          show: true,
          title: "관리자 로그인 성공",
          message: "관리자 페이지로 이동합니다.",
          type: "admin",
          redirect: "/admin",
        });
      } else {
        setModal({
          show: true,
          title: "로그인 성공",
          message: "환영합니다! 메인 페이지로 이동합니다.",
          type: "success",
          redirect: "/main",
        });
      }
    } catch (err) {
      console.error("로그인 오류:", err);
      setModal({
        show: true,
        title: "로그인 오류",
        message: "아이디 또는 비밀번호가 올바르지 않습니다.",
        type: "error",
      });
    }
  };

  return (
    <div className="container mt-5">
      <h2>로그인</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">아이디</label>
          <input
            type="text"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">비밀번호</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary">
          로그인
        </button>
      </form>

      <div className="mt-3">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate("/register")}
        >
          회원가입
        </button>
      </div>

      {/* 모달 */}
      <AlertModal
        show={modal.show}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Login;