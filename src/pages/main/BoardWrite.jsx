// src/pages/main/BoardWrite.jsx
import React, { useState, useContext } from "react";
import { AuthContext } from "../../auth/AuthContext";
import api from "../../api/axios";
import MapModal from "./MapModal";

const BoardWrite = ({ defaultType }) => {
  const { user } = useContext(AuthContext);
  const userId = user?.userId;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState(defaultType || "FREE");

  // 후기 전용 필드
  const [rating, setRating] = useState(0); // ⭐ 평점 (1~5)

  // 위치 관련 (후기/자유게시판 공용)
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [address, setAddress] = useState("");
  const [showMap, setShowMap] = useState(false);

  // ✅ 지도에서 좌표 선택 시 실행
  const handleLocationSelect = (lat, lng) => {
    setLatitude(lat);
    setLongitude(lng);

    // 카카오 좌표 → 주소 변환
    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.coord2RegionCode(lng, lat, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const region = result[0];
        const fullAddress = `${region.region_1depth_name} ${region.region_2depth_name} ${region.region_3depth_name}`;
        setAddress(fullAddress);
      }
    });
  };

  // ✅ 게시글 등록
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력하세요.");
      return;
    }
    if (title.length > 50) {
      alert("제목은 50자 이내로 입력하세요.");
      return;
    }
    if (content.length > 2000) {
      alert("내용은 2000자 이하로 입력하세요.");
      return;
    }

    // 후기 게시판일 때 평점 필수
    if (type === "REVIEW" && (rating < 1 || rating > 5)) {
      alert("후기 평점은 1~5점 사이로 입력하세요.");
      return;
    }
    if (type === "REVIEW" && content.length > 500) {
      alert("후기 내용은 500자 이내로 입력하세요.");
      return;
    }

    try {
      await api.post(`/study-posts?leaderId=${userId}`, {
        title,
        content,
        type,
        rating: type === "REVIEW" ? rating : null,
        latitude,
        longitude,
        location: address || null,
      });

      // 성공 메시지 구분
      if (type === "REVIEW") {
        alert("후기 등록이 완료되었습니다.");
      } else {
        alert("게시글이 성공적으로 등록되었습니다.");
      }

      // 폼 초기화
      setTitle("");
      setContent("");
      setRating(0);
      setLatitude(null);
      setLongitude(null);
      setAddress("");
    } catch (err) {
      console.error(err);
      alert("글 작성 실패");
    }
  };

  return (
    <div className="container mt-3">
      <h3>게시글 작성</h3>
      <form onSubmit={handleSubmit}>
        {/* 제목 */}
        <div className="mb-2">
          <label className="form-label">제목</label>
          <input
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* 내용 */}
        <div className="mb-2">
          <label className="form-label">내용</label>
          <textarea
            className="form-control"
            rows="5"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
          <small className="text-muted">
            {type === "REVIEW"
              ? "후기 내용은 500자 이내로 작성해주세요."
              : "게시글 내용은 2000자 이하로 작성 가능합니다."}
          </small>
        </div>

        {/* 게시판 종류 */}
        <div className="mb-2">
          <label className="form-label">게시판 종류</label>
          <select
            className="form-select"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="FREE">자유게시판</option>
            <option value="REVIEW">스터디 리뷰</option>
          </select>
        </div>

        {/* 후기 평점 (REVIEW일 때만 표시) */}
        {type === "REVIEW" && (
          <div className="mb-2">
            <label className="form-label">평점 (1~5)</label>
            <input
              type="number"
              className="form-control"
              min="1"
              max="5"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              required
              style={{ width: "100px" }}
            />
          </div>
        )}

        {/* 위치 선택 (선택 사항) */}
        <div className="mb-2">
          <label className="form-label">스터디 위치 (선택)</label>
          <button
            type="button"
            className="btn btn-outline-primary ms-2"
            onClick={() => setShowMap(true)}
          >
            위치 선택
          </button>
          {address && (
            <p className="mt-2">
              선택된 위치: <b>{address}</b>
            </p>
          )}
        </div>

        {/* 등록 버튼 */}
        <button className="btn btn-primary" type="submit">
          등록
        </button>
      </form>

      {/* 지도 모달 */}
      {showMap && (
        <MapModal
          onClose={() => setShowMap(false)}
          onSelectLocation={handleLocationSelect}
        />
      )}
    </div>
  );
};

export default BoardWrite;