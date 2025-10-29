import React from "react";

const AlertModal = ({ show, title, message, type, onClose }) => {
  if (!show) return null;

  // 유형별 색상
  let headerClass = "bg-gray-100 text-gray-900";
  let titleIcon = "🔔";
  let buttonClass = "bg-gray-200 hover:bg-gray-300 text-black";

  if (type === "success") {
    headerClass = "bg-green-500 text-white";
    titleIcon = "✅";
    buttonClass = "bg-green-100 hover:bg-green-200 text-black";
  } else if (type === "error") {
    headerClass = "bg-red-500 text-white";
    titleIcon = "❌";
    buttonClass = "bg-red-100 hover:bg-red-200 text-black";
  } else if (type === "admin") {
    headerClass = "bg-sky-600 text-white";
    titleIcon = "👑";
    buttonClass = "bg-sky-100 hover:bg-sky-200 text-black";
  }

  const modalStyle = {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1050,
    backdropFilter: "blur(4px)",
  };

  return (
    <div style={modalStyle}>
      {/* ✅ 둥근 모서리 + overflow-hidden 적용 */}
      <div
        className="
          bg-white
          rounded-2xl
          shadow-2xl
          w-full
          max-w-lg
          mx-4
          flex flex-col
          overflow-hidden
          border border-gray-200
          transition-transform duration-300
          transform hover:scale-[1.01]
        "
        style={{ borderRadius: "20px", overflow: "hidden" }} // 직접 보강
      >
        {/* Header */}
        <div className={`p-5 flex items-center justify-center ${headerClass}`}>
          <span className="text-2xl mr-3">{titleIcon}</span>
          <h5 className="text-lg font-semibold">{title}</h5>
        </div>

        {/* Body */}
        <div className="p-8 flex-grow flex items-center justify-center text-center bg-white">
          <p
            className="text-gray-800 text-base leading-relaxed"
            style={{ whiteSpace: "pre-wrap" }}
          >
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-center p-5 bg-gray-50 border-t border-gray-200">
          <button
            type="button"
            className={`px-6 py-2 rounded-md border border-gray-400 shadow-sm font-semibold transition duration-150 ${buttonClass}`}
            onClick={onClose}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
