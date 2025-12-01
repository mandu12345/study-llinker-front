import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import api from "../api/axios";
import AlertModal from "./AlertModal";

// 더미 JWT 토큰 생성 함수 (슈퍼유저/관리자 테스트용)
function createDummyToken(role) {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({ userId: "0", role }));
  const signature = "dummysignature";
  return `${header}.${payload}.${signature}`;
}

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

    // 1) 슈퍼유저, 관리자 더미 로그인 (프론트 테스트용)
    if (username === "superuser" && password === "1234") {
      const dummyToken = createDummyToken("ADMIN");
      login(dummyToken, "ADMIN");
      setModal({
        show: true,
        title: "슈퍼유저 로그인 성공",
        message: "슈퍼유저로 로그인했습니다.",
        type: "success",
        redirect: "/main",
      });
      return;
    }

    if (username === "admin" && password === "1234") {
      const dummyToken = createDummyToken("ADMIN");
      login(dummyToken, "ADMIN");
      setModal({
        show: true,
        title: "관리자 로그인 성공",
        message: "관리자 페이지로 이동합니다.",
        type: "admin",
        redirect: "/admin",
      });
      return;
    }

    // 2) 실제 StudyLinker 로그인 API 호출
    try {
      const res = await api.post("/auth/tokens", { username, password });

      const token = res.data.token;

      if (!token) {
        setModal({
          show: true,
          title: "로그인 실패",
          message: "서버에서 토큰을 받지 못했습니다.",
          type: "error",
        });
        return;
      }

      // AuthContext의 login()은 localStorage.setItem("token", token)을 처리해줌
      login(token, "USER");

      setModal({
        show: true,
        title: "로그인 성공",
        message: "환영합니다! 메인 페이지로 이동합니다.",
        type: "success",
        redirect: "/main",
      });
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
