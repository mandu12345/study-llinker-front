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

    if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
      console.error("Kakao Maps 서비스가 로드되지 않았습니다.");
      return;
    }

    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.coord2RegionCode(lng, lat, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK && result[0]) {
        const region = result[0];
        const fullAddress = `${region.region_1depth_name} ${region.region_2depth_name} ${region.region_3depth_name}`;
        setAddress(fullAddress);
      }
    });
  };

  // ✅ 게시글 등록
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      alert("로그인 정보가 없습니다. 다시 로그인 해주세요.");
      return;
    }

    // 유효성 검사
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력하세요.");
      return;
    }
    if (title.length > 50) {
      alert("제목은 50자 이내로 입력하세요.");
      return;
    }

    if (type === "REVIEW") {
      if (content.length > 500) {
        alert("후기 내용은 500자 이내로 작성해주세요.");
        return;
      }
      if (rating < 1 || rating > 5) {
        alert("후기 평점은 1~5점 사이로 입력하세요.");
        return;
      }
    } else {
      if (content.length > 2000) {
        alert("게시글 내용은 2000자 이하로 작성 가능합니다.");
        return;
      }
    }

    try {
      // 1️⃣ 먼저 게시글 생성 (FREE / REVIEW 공통)
      const postRes = await api.post(
        `/study-posts?leaderId=${userId}`,
        {
          title,
          content,
          type, // 'FREE' | 'STUDY' | 'REVIEW'
          latitude,
          longitude,
          location: address || null,
        }
      );

      const postData = postRes.data || {};
      const postId = postData.postId || postData.post_id || postData.id;

      if (!postId) {
        throw new Error("게시글 ID를 가져오지 못했습니다.");
      }

      // 2️⃣ REVIEW 타입인 경우 → 리뷰 별도 생성
      if (type === "REVIEW") {
        await api.post(`/study-posts/${postId}/reviews`, {
          rating,
          content, // 리뷰 내용 (게시글 내용과 동일하게 사용)
        });
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
      setType(defaultType || "FREE");
    } catch (err) {
      console.error("글 작성 실패:", err);
      alert("글 작성에 실패했습니다. 잠시 후 다시 시도해주세요.");
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
            {/* 나중에 필요하면 STUDY 타입도 추가 가능 */}
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
