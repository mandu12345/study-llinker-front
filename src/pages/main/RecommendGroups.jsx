import React, { useState, useEffect } from "react";
import api from "../../api/axios";

const RecommendGroups = () => {
  const [algorithm, setAlgorithm] = useState("locationNLP");
  const [radius, setRadius] = useState(2); // 2km 기본값
  const [userLocation, setUserLocation] = useState(null);

  const [groups, setGroups] = useState([]);

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");

  const [userId, setUserId] = useState(null);

  // 0) 로그인한 사용자 정보 가져오기 → userId 필요함
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const res = await api.get("/users/profile");
        setUserId(res.data.user.userId);
      } catch (err) {
        console.error("유저 정보 불러오기 실패:", err);
      }
    };

    loadUserInfo();
  }, []);

  // 1) 사용자 현재 위치 가져오기
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => console.error("위치 가져오기 실패:", err)
      );
    }
  }, []);

  // 2) 추천 API 호출
  const loadRecommendations = async (
    loc = userLocation,
    rad = radius,
    alg = algorithm,
    uid = userId
  ) => {
    if (!loc || !uid) return;

    try {
      let url = "";

      if (alg === "locationNLP") {
        // 위치 + 관심사 태그 기반 추천
        url = "/recommend/tag";
      } else if (alg === "popular") {
        // 위치 + 인기 기반 추천
        url = "/groups/popular";
      }

      const res = await api.get(url, {
        params: {
          userId: uid,
          limit: 10,
          lat: loc.lat,
          lng: loc.lng,
          radiuskm: rad,
        },
      });

      setGroups(res.data);
    } catch (err) {
      console.error("추천 스터디 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    loadRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation, radius, algorithm, userId]);

  // 3) 참여 신청 후 자동 새로고침
  const handleJoin = async (groupId) => {
    try {
      await api.post(`/study-groups/${groupId}/members`);
      alert("참여 신청이 완료되었습니다! (승인 대기)");

      // 신청 이후 최신 추천 목록 다시 불러오기
      loadRecommendations();
    } catch (err) {
      console.error("참여 신청 실패:", err);
      alert("참여 신청 중 오류가 발생했습니다.");
    }
  };

  // 4) 지도 표시
  useEffect(() => {
    if (!window.kakao || !window.kakao.maps) return;
    if (groups.length === 0) return;

    window.kakao.maps.load(() => {
      const container = document.getElementById("recommend-map");
      if (!container) return;

      // 지도 초기화
      container.innerHTML = "";

      const map = new window.kakao.maps.Map(container, {
        center: new window.kakao.maps.LatLng(
          groups[0].lat || groups[0].latitude,
          groups[0].lng || groups[0].longitude
        ),
        level: 5,
      });

      groups.forEach((g) => {
        new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(
            g.lat || g.latitude,
            g.lng || g.longitude
          ),
          map,
        });
      });
    });
  }, [groups]);

  // 5) 상세보기 모달 주소 변환
  useEffect(() => {
    if (!selectedGroup) return;
    if (!window.kakao || !window.kakao.maps) return;

    const geocoder = new window.kakao.maps.services.Geocoder();

    const coord = new window.kakao.maps.LatLng(
      selectedGroup.lat || selectedGroup.latitude,
      selectedGroup.lng || selectedGroup.longitude
    );

    geocoder.coord2Address(coord.getLng(), coord.getLat(), (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const road = result[0].road_address
          ? result[0].road_address.address_name
          : "";
        const jibun = result[0].address
          ? result[0].address.address_name
          : "";
        const fullAddress = road ? `${road} (${jibun})` : jibun;
        setSelectedAddress(fullAddress);
      }
    });
  }, [selectedGroup]);

  // UI 시작
  return (
    <div>
      <h2>스터디 추천</h2>
      <br />

      {/* 추천 방식 선택 */}
      <div className="mb-3">
        <label className="form-label fw-bold me-2">추천 방식 선택:</label>
        <select
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value)}
          className="form-select d-inline-block w-auto"
        >
          <option value="locationNLP">위치·자연어 기반 추천</option>
          <option value="popular">인기 기반 추천</option>
        </select>
      </div>

      {/* 반경 선택 */}
      <div className="mb-3">
        <label className="form-label fw-bold me-2">반경 선택:</label>
        <select
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          className="form-select d-inline-block w-auto"
        >
          <option value={2}>2 km</option>
          <option value={5}>5 km</option>
          <option value={10}>10 km</option>
        </select>
      </div>

      {/* 지도 */}
      <div
        id="recommend-map"
        style={{ width: "100%", height: "400px", marginBottom: "20px" }}
      ></div>

      {/* 추천 스터디 리스트 */}
      <div className="row">
        {groups.map((group) => (
          <div key={group.studyGroupId} className="col-md-6 mb-3">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">{group.name}</h5>
                <p className="card-text">
                  {group.description}
                  <br />
                  태그:{" "}
                  {group.category && (
                    <span className="badge bg-secondary me-1">
                      #{group.category}
                    </span>
                  )}
                  <br />
                  거리: {group.distanceKm?.toFixed(1)} km
                  <br />
                  평점: ⭐ {group.rating || "-"}
                </p>

                <div className="d-flex justify-content-between">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => {
                      setSelectedGroup(group);
                      setShowModal(true);
                    }}
                  >
                    상세보기
                  </button>

                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleJoin(group.studyGroupId)}
                  >
                    참여 신청
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {groups.length === 0 && (
          <p>선택한 반경 내 추천 스터디가 없습니다.</p>
        )}
      </div>

      {/* 상세보기 모달 */}
      {showModal && selectedGroup && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">{selectedGroup.name}</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p><strong>설명:</strong> {selectedGroup.description}</p>
                <p>
                  <strong>카테고리:</strong>{" "}
                  {selectedGroup.category && (
                    <span className="badge bg-info text-dark me-1">
                      #{selectedGroup.category}
                    </span>
                  )}
                </p>
                <p>
                  <strong>위치:</strong>{" "}
                  {selectedAddress
                    ? selectedAddress
                    : `${selectedGroup.lat}, ${selectedGroup.lng}`}
                </p>
                <p><strong>평점:</strong> ⭐ {selectedGroup.rating}</p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowModal(false)}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendGroups;