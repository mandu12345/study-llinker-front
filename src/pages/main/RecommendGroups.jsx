import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import "./StudyListButtons.css";

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
        console.log("프로필 응답:", res.data);
        setUserId(res.data.userId);
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
        (err) => {
          console.error("위치 가져오기 실패:", err);
          if (err.code === 1) {
            // 필요하면 안내창 띄우기
            // alert("브라우저에서 위치 권한이 차단되었습니다.\n주소창 왼쪽 자물쇠 아이콘 > 사이트 설정 > 위치를 허용으로 변경해주세요.");
          }
        }
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
    if (!loc || !uid) return; // 위치나 userId 없으면 호출하지 않음

    try {
      let url = "";

      if (alg === "locationNLP") {
        // 위치 + 관심사 태그 기반 추천
        url = "/recommend/tag";
      } else if (alg === "popular") {
        // 위치 + 인기 기반 추천
        url = "/recommend/popular";
      }

      const res = await api.get(url, {
        params: {
          userId: uid, 
          limit: 10,
          lat: loc.lat,
          lng: loc.lng,
          radiusKm: rad,
        },
      });

      console.log("추천 API 응답:", res.data);

      const rawGroups = res.data.groups || [];

      // ⭐⭐ 여기서 groupId로 상세 정보 조회하여 description 보강
      const enrichedGroups = await Promise.all(
        rawGroups.map(async (g) => {
          const id = g.studyGroupId ?? g.groupId;
          if (!id) return g;

          try {
            const detailRes = await api.get(`/study-groups/${id}`);
            const detail = detailRes.data;

            return {
              ...g,
              description: detail.description, // ⭐ description 보강
              category:
                Array.isArray(detail.category)
                  ? detail.category
                  : typeof detail.category === "string"
                    ? JSON.parse(detail.category) // ⭐ JSON 문자열 → 배열 변환
                    : g.category,
            };
          } catch (err) {
            console.error("스터디 상세 조회 실패:", err);
            return g; // 실패하면 기존 데이터 그대로 사용
          }
        })
      );

      setGroups(enrichedGroups);
    } catch (err) {
      console.error("추천 스터디 불러오기 실패:", err);
    }
  };

  // 위치/반경/알고리즘/userId 변경될 때마다 추천 다시 불러오기
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
    if (!Array.isArray(groups) || groups.length === 0) return;

    window.kakao.maps.load(() => {
      const container = document.getElementById("recommend-map");
      if (!container) return;

      // 지도 초기화
      container.innerHTML = "";

      const first = groups[0];
      const centerLat = first.lat || first.latitude;
      const centerLng = first.lng || first.longitude;

      if (centerLat == null || centerLng == null) return;

      const map = new window.kakao.maps.Map(container, {
        center: new window.kakao.maps.LatLng(centerLat, centerLng),
        level: 5,
      });

      groups.forEach((g) => {
        const lat = g.lat || g.latitude;
        const lng = g.lng || g.longitude;
        if (lat == null || lng == null) return;

        // ⭐ 스터디 전용 마커 이미지
        const studyMarkerImg = new window.kakao.maps.MarkerImage(
          "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
          new window.kakao.maps.Size(24, 35)
        );

        new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(lat, lng),
          map,
          image: studyMarkerImg, 
        });
      });
    });
  }, [groups]);

  // 5) 상세보기 모달 주소 변환
  useEffect(() => {
    if (!selectedGroup) return;
    if (!window.kakao || !window.kakao.maps) return;

    const geocoder = new window.kakao.maps.services.Geocoder();

    const lat = selectedGroup.lat || selectedGroup.latitude;
    const lng = selectedGroup.lng || selectedGroup.longitude;
    if (lat == null || lng == null) return;

    const coord = new window.kakao.maps.LatLng(lat, lng);

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

  // ================================
  //            UI 시작
  // ================================  
  return (
    <div>
      <h2><strong>스터디 추천</strong></h2>
      <br />

      {/* 추천 방식 선택 */}
      <div className="mb-1">
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

      {/* 점수 설명 문구 */}
      <p
        className="text-muted"
        style={{ fontSize: "0.85rem", marginTop: "4px", marginBottom: "12px" }}
      >
        {algorithm === "locationNLP"
          ? "점수는 거리 점수와 관심 태그 유사도를 합쳐 계산됩니다."
          : "점수는 스터디 인기(멤버 수)와 거리 정보를 합쳐 계산됩니다."}
      </p>

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
        {Array.isArray(groups) &&
          groups.map((group) => {
            const id = group.studyGroupId ?? group.groupId;
            const name = group.name ?? group.title;

            // ⭐ description 통합 코드 제거하고 단일화
            const description = group.description ?? "-"; // ← 여기만 남김

            const distanceKm = group.distanceKm;
            const score = group.finalScore;

            return (
              <div
                key={id ?? `${name}-${Math.random()}`}
                className="col-md-6 mb-3"
              >
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">{name}</h5>

                    <p className="card-text">
                      {description}
                      <br />

                      {Array.isArray(group.category) && group.category.length > 0 && (
                        <div className="mb-2">
                          <strong>카테고리: </strong>
                          {group.category.map((tag, idx) => (
                            <span key={idx} className="badge bg-secondary me-1">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      거리:{" "}
                      {distanceKm != null ? distanceKm.toFixed(1) : "-"} km
                      <br />
                      <strong>
                        {algorithm === "locationNLP"
                          ? "태그·거리 점수"
                          : "인기·거리 점수"}
                        :
                      </strong>{" "}
                      ⭐ {score != null ? score.toFixed(2) : "-"}
                    </p>

                    <div className="d-flex justify-content-between">

                      {/* 상세보기 버튼 (파스텔 보라 Outline) */}
                      <button
                        className="study-btn study-btn-detail"
                        onClick={() => {
                          setSelectedGroup(group);
                          setShowModal(true);
                        }}
                      >
                        상세보기
                        <span className="icon-box">
                          <i className="bi bi-arrow-right"></i>
                        </span>
                      </button>

                      {/* 참여 신청 버튼 (Solid 파스텔 보라) */}
                      {id && (
                        <button
                          className="study-btn study-btn-join"
                          onClick={() => handleJoin(id)}
                        >
                          참여 신청
                          <span className="icon-box">
                            <i className="bi bi-check2-circle"></i>
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

        {Array.isArray(groups) && groups.length === 0 && (
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

              {/* 헤더 */}
              <div
                className="modal-header"
                style={{ backgroundColor: "#bfb9b9", color: "#fff" }}
              >
                <h5 className="modal-title">
                  <strong>{selectedGroup.name ?? selectedGroup.title}</strong>
                </h5>

                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <div className="modal-body">
                <p>
                  <strong>설명:</strong>{" "}
                  {selectedGroup.description ?? "-"}
                </p>

                {Array.isArray(selectedGroup.category) && selectedGroup.category.length > 0 && (
                    <p>
                      <strong>카테고리:</strong>{" "}
                      {selectedGroup.category.map((tag, idx) => (
                        <span key={idx} className="badge bg-info text-dark me-1">
                          #{tag}
                        </span>
                      ))}
                    </p>
                  )}

                <p>
                  <strong>위치:</strong>{" "}
                  {selectedAddress
                    ? selectedAddress
                    : `${selectedGroup.lat || selectedGroup.latitude}, ${
                        selectedGroup.lng || selectedGroup.longitude
                      }`}
                </p>

                <p>
                  <strong>
                    {algorithm === "locationNLP"
                      ? "태그·거리 점수"
                      : "인기·거리 점수"}
                    :
                  </strong>{" "}
                  ⭐{" "}
                  {selectedGroup.finalScore != null
                    ? selectedGroup.finalScore.toFixed(2)
                    : "-"}
                </p>
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