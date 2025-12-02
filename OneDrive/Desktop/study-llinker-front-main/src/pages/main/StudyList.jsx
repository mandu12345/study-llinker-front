import React, { useState, useEffect, useRef } from "react";
import api from "../../api/axios";

function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const StudyList = () => {
  const [groups, setGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userLocation, setUserLocation] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [selectedAddress, setSelectedAddress] = useState("");
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const userId = Number(localStorage.getItem("userId"));

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    max_members: 10,
    category: [],
    latitude: null,
    longitude: null,
  });

  // --- 사용자 현재 위치 ---
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

  // --- 전체 그룹 조회 API ---
  const loadGroups = async () => {
    try {
      const res = await api.get("/study-groups");
      setGroups(res.data);
    } catch (err) {
      console.error("그룹 목록 조회 실패:", err);
      alert("스터디 목록을 불러올 수 없습니다.");
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  // --- 생성 모달 지도 초기화 ---
  useEffect(() => {
    if (showForm && window.kakao && window.kakao.maps) {
      const container = document.getElementById("createMap");

      const options = {
        center: new window.kakao.maps.LatLng(
          userLocation?.lat || 37.4509,
          userLocation?.lng || 127.1264
        ),
        level: 4,
      };

      const map = new window.kakao.maps.Map(container, options);
      mapRef.current = map;

      window.kakao.maps.event.addListener(map, "click", function (mouseEvent) {
        const latlng = mouseEvent.latLng;

        if (!markerRef.current) {
          markerRef.current = new window.kakao.maps.Marker({
            position: latlng,
            map,
          });
        } else {
          markerRef.current.setPosition(latlng);
        }

        setFormData((prev) => ({
          ...prev,
          latitude: latlng.getLat(),
          longitude: latlng.getLng(),
        }));
      });
    }
  }, [showForm, userLocation]);

  // --- 스터디 생성 API ---
  const handleCreate = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) return alert("스터디 제목을 입력하세요.");
    if (!formData.latitude || !formData.longitude)
      return alert("지도를 클릭해 위치를 지정해주세요.");
    if (formData.max_members > 20)
      return alert("최대 인원은 20명 이하만 가능합니다.");

    try {
      await api.post(`/study-groups?leaderId=${userId}`, formData);
      alert("스터디 생성 완료!");
      setShowForm(false);
      loadGroups();
    } catch (err) {
      console.error("스터디 생성 실패:", err);
      alert("스터디 생성 실패!");
    }
  };

  // --- 참여 신청 API ---
  const handleJoin = async (groupId) => {
    try {
      await api.post(`/study-groups/${groupId}/members`);
      alert("참여 신청 완료!");
    } catch (err) {
      console.error("참여 신청 오류:", err);
      alert("참여 신청 실패!");
    }
  };

  // --- 리더 정보 조회 API ---
  const fetchGroupLeader = async (groupId) => {
    try {
      const res = await api.get(`/study-groups/${groupId}/leader`);
      return res.data;
    } catch (err) {
      console.error("리더 조회 실패:", err);
      return null;
    }
  };

  // --- 상세보기 모달 열기 ---
  const openDetailModal = async (group) => {
    const leader = await fetchGroupLeader(group.groupId);

    setSelectedGroup({
      ...group,
      leaderName: leader?.name || "정보 없음",
    });

    setShowModal(true);
  };

  // --- 상세보기 모달 열릴 때 주소 변환  ---
  useEffect(() => {
    if (selectedGroup && window.kakao && window.kakao.maps) {
      const geocoder = new window.kakao.maps.services.Geocoder();

      const coord = new window.kakao.maps.LatLng(
        selectedGroup.latitude,
        selectedGroup.longitude
      );

      geocoder.coord2Address(
        coord.getLng(),
        coord.getLat(),
        (result, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            const road = result[0].road_address?.address_name || "";
            const jibun = result[0].address?.address_name || "";
            setSelectedAddress(road ? `${road} (${jibun})` : jibun);
          }
        }
      );
    }
  }, [selectedGroup]);

  // --- 필터 + 거리정렬 ---
  const filteredGroups = groups
    .filter((g) => {
      const term = searchTerm.toLowerCase();
      return (
        g.title.toLowerCase().includes(term) ||
        g.description.toLowerCase().includes(term)
      );
    })
    .map((g) => {
      if (userLocation && g.latitude && g.longitude) {
        g.distance = getDistance(
          userLocation.lat,
          userLocation.lng,
          g.latitude,
          g.longitude
        );
      }
      return g;
    })
    .sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));

  return (
    <div>
      <h2>스터디 목록</h2>

      {/* 검색 */}
      <input
        className="form-control mb-3"
        placeholder="스터디 검색..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* 생성 버튼 */}
      <div className="text-end mb-3">
        <button className="btn btn-success btn-sm" onClick={() => setShowForm(true)}>
          ➕ 새 스터디 생성
        </button>
      </div>

      {/* 스터디 목록 */}
      <div className="row">
        {filteredGroups.map((group) => (
          <div key={group.groupId} className="col-md-6 mb-3">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5>{group.title}</h5>
                <p>{group.description}</p>

                <p>
                  거리:{" "}
                  {group.distance
                    ? `${group.distance.toFixed(1)} km`
                    : "위치 정보 없음"}
                </p>

                <button
                  className="btn btn-outline-primary btn-sm me-2"
                  onClick={() => openDetailModal(group)}
                >
                  상세보기
                </button>

                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleJoin(group.groupId)}
                >
                  참여 신청
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredGroups.length === 0 && <p>검색 결과가 없습니다.</p>}

      {/* --- 상세보기 모달 --- */}
      {showModal && selectedGroup && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5>{selectedGroup.title}</h5>
                <button
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p><strong>리더:</strong> {selectedGroup.leaderName}</p>
                <p><strong>설명:</strong> {selectedGroup.description}</p>
                <p><strong>주소:</strong> {selectedAddress}</p>
                <p>
                  <strong>좌표:</strong> {selectedGroup.latitude}, {selectedGroup.longitude}
                </p>
                <p>
                  <strong>인원:</strong>{" "}
                  {selectedGroup.currentMembers}/{selectedGroup.maxMembers}
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

      {/* --- 생성 모달 --- */}
      {showForm && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5>새 스터디 생성</h5>
                <button
                  className="btn-close btn-close-white"
                  onClick={() => setShowForm(false)}
                ></button>
              </div>

              <form onSubmit={handleCreate}>
                <div className="modal-body">
                  <input
                    className="form-control mb-2"
                    name="title"
                    placeholder="스터디 제목"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />

                  <textarea
                    className="form-control mb-2"
                    name="description"
                    placeholder="스터디 설명"
                    rows="3"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                  />

                  <input
                    className="form-control mb-3"
                    type="number"
                    name="max_members"
                    placeholder="최대 인원 (최대 20)"
                    value={formData.max_members}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_members: Number(e.target.value),
                      })
                    }
                  />

                  {/* 태그 입력 */}
                  <div className="mb-2">
                    <label className="form-label">해시태그 추가</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="예: Java, AI..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const value = e.target.value.trim();
                          if (value && !formData.category.includes(value)) {
                            setFormData((prev) => ({
                              ...prev,
                              category: [...prev.category, value],
                            }));
                          }
                          e.target.value = "";
                        }
                      }}
                    />

                    <div className="mt-2">
                      {formData.category.map((tag, idx) => (
                        <span
                          key={idx}
                          className="badge bg-info text-dark me-2"
                          style={{ cursor:"pointer" }}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              category: prev.category.filter((t) => t !== tag),
                            }))
                          }
                        >
                          #{tag} ✕
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 지도 */}
                  <div>
                    <h6>지도에서 위치 선택</h6>
                    <div
                      id="createMap"
                      style={{
                        width: "100%",
                        height: "300px",
                        borderRadius: "10px",
                        border: "1px solid #ccc",
                      }}
                    ></div>
                  </div>

                  {formData.latitude && (
                    <p className="mt-2 text-muted">
                      선택된 좌표: {formData.latitude.toFixed(6)},{" "}
                      {formData.longitude.toFixed(6)}
                    </p>
                  )}
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary btn-sm"
                    type="button"
                    onClick={() => setShowForm(false)}
                  >
                    취소
                  </button>
                  <button className="btn btn-success btn-sm" type="submit">
                    생성
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudyList;
