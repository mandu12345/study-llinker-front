// src/components/AlertModal.jsx

import React from "react";
import {
  AiFillCheckCircle,
  AiFillCloseCircle,
  AiFillCrown,
  AiFillInfoCircle,
} from "react-icons/ai";

const AlertModal = ({ show, title, message, type, onClose }) => {
  if (!show) return null;

  // 🔥 파스텔톤 색상 + 아이콘 매핑
  const styleMap = {
    success: {
      icon: <AiFillCheckCircle size={34} color="#4CAF50" />,
      headerBg: "#E8F5E9",
      titleColor: "#2E7D32",
    },
    error: {
      icon: <AiFillCloseCircle size={34} color="#E53935" />,
      headerBg: "#FFEBEE",
      titleColor: "#C62828",
    },
    admin: {
      icon: <AiFillCrown size={34} color="#FBC02D" />,
      headerBg: "#FFF8E1",
      titleColor: "#F9A825",
    },
    info: {
      icon: <AiFillInfoCircle size={34} color="#42A5F5" />,
      headerBg: "#E3F2FD",
      titleColor: "#1E88E5",
    },
  };

  const current = styleMap[type] ?? styleMap.info;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(3px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 3000,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "360px",
          background: "white",
          borderRadius: "16px",
          overflow: "hidden",
          animation: "fadeScale 0.2s ease-out",
          boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
        }}
      >
        {/* HEADER (compact) */}
        <div
          style={{
            background: current.headerBg,
            padding: "14px 10px",
            textAlign: "center",
          }}
        >
          {current.icon}
          <h5
            style={{
              marginTop: "6px",
              fontSize: "18px",
              fontWeight: "700",
              color: current.titleColor,
            }}
          >
            {title}
          </h5>
        </div>

        {/* BODY (compact) */}
        <div
          style={{
            padding: "16px",
            textAlign: "center",
            fontSize: "15px",
            color: "#555",
            lineHeight: "1.4",
          }}
        >
          {message}
        </div>

        {/* FOOTER */}
        <div
          style={{
            padding: "12px",
            textAlign: "center",
            background: "#fafafa",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "8px 24px",
              borderRadius: "8px",
              border: "none",
              background: "#e91e63",
              color: "white",
              fontWeight: "600",
              boxShadow: "0 3px 10px rgba(233,30,99,0.3)",
              transition: "0.2s",
            }}
            onMouseOver={(e) =>
              (e.target.style.boxShadow = "0 0 0 rgba(0,0,0,0)")
            }
            onMouseOut={(e) =>
              (e.target.style.boxShadow = "0 3px 10px rgba(233,30,99,0.3)")
            }
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

// 애니메이션
const style = document.createElement("style");
style.innerHTML = `
@keyframes fadeScale {
  0% { opacity: 0; transform: scale(0.9); }
  100% { opacity: 1; transform: scale(1); }
}
`;
document.head.appendChild(style);

export default AlertModal;
