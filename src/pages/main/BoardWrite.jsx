import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../auth/AuthContext";
import api from "../../api/axios";
import MapModal from "./MapModal";

const BoardWrite = ({ defaultType }) => {
  const { user } = useContext(AuthContext);
  const userId = user?.userId;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState(defaultType || "FREE");

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [address, setAddress] = useState(""); // 🟢 주소 상태 추가
  const [showMap, setShowMap] = useState(false);

  // 좌표 선택 시 실행
  const handleLocationSelect = (lat, lng) => {
    setLatitude(lat);
    setLongitude(lng);

    // 🟢 카카오 좌표 → 주소 변환
    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.coord2RegionCode(lng, lat, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const region = result[0];
        const fullAddress = `${region.region_1depth_name} ${region.region_2depth_name} ${region.region_3depth_name}`;
        setAddress(fullAddress);
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/study-posts?leaderId=${userId}`, {
        title,
        content,
        type,
        latitude,
        longitude,
        location: address, // 🟢 DB에는 사람이 읽을 수 있는 주소 저장
      });
      alert("게시글이 등록되었습니다!");
      setTitle("");
      setContent("");
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
            <option value="STUDY">스터디 모집</option>
            <option value="REVIEW">스터디 리뷰</option>
          </select>
        </div>

        {/* 위치 선택 */}
        <div className="mb-2">
          <label className="form-label">스터디 위치</label>
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
