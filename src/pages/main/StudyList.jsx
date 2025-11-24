import React, { useState, useEffect, useRef } from "react";

// 거리 계산 (Haversine)
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

// 더미 데이터
const dummyGroups = [
  {
    id: 1,
    title: "Java 스터디",
    description: "기초부터 배우는 Java",
    leader: "홍길동",
    members: 5,
    max: 10,
    category: ["Java", "Spring"],
    latitude: 37.4979, 
    longitude: 127.0276,
    rating: 4.6,
  },
  {
    id: 2,
    title: "피트니스 영양 관리 스터디",
    description: "영양학 및 근육량 증진 식단 연구 스터디",
    leader: "이서윤",
    members: 5,
    max: 8,
    category: ["운동", "식단", "건강"],
    latitude: 37.6543, 
    longitude: 126.7735,
    rating: 4.7,
  },
  {
    id: 3,
    title: "토익 스피킹 스터디",
    description: "실제 시험 위주의 스피킹 연습 중심 스터디",
    leader: "박예진",
    members: 4,
    max: 8,
    category: ["어학", "토익스피킹", "영어회화"],
    latitude: 37.5663, 
    longitude: 126.9779,
    rating: 3.9,
  },
  {
    id: 4,
    title: "공무원 국어 스터디",
    description: "기출 분석 및 문법 핵심 정리 중심 스터디",
    leader: "김성민",
    members: 6,
    max: 10,
    category: ["공무원", "국어", "문법"],
    latitude: 37.2899, 
    longitude: 127.0167,
    rating: 4.5,
  },
  {
    id: 5,
    title: "컴활 1급 대비반",
    description: "함수 및 엑셀 실무 중심 자격증 대비 스터디",
    leader: "정은비",
    members: 7,
    max: 10,
    category: ["자격증", "엑셀", "컴활1급"],
    latitude: 37.3943,
    longitude: 127.1107,
    rating: 3.7,
  },
  {
    id: 6,
    title: "JLPT N2 대비반",
    description: "일본어 청해 + 독해 실전문제 풀이 스터디",
    leader: "이유나",
    members: 5,
    max: 8,
    category: ["어학", "일본어", "JLPT"],
    latitude: 37.5131, 
    longitude: 127.1025,
    rating: 4.8,
  },
  {
    id: 7,
    title: "NCS 취업 준비 스터디",
    description: "대기업/공기업 NCS 모의시험 풀이 중심",
    leader: "최민재",
    members: 6,
    max: 8,
    category: ["취업", "공기업", "NCS"],
    latitude: 37.6533, 
    longitude: 127.0569,
    rating: 4.6,
  },
  {
    id: 8,
    title: "한국사 능력검정 시험반",
    description: "기출 문제 풀이 및 암기 포인트 정리",
    leader: "유가은",
    members: 9,
    max: 10,
    category: ["자격증", "한국사", "역사"],
    latitude: 37.5082,
    longitude: 126.9369,
    rating: 4.9,
  }
];



const dummyTags = ["Java", "Spring Boot", "AI", "Python", "딥러닝"];

const StudyList = () => {
  const currentUser = "홍길동"; // 로그인 사용자
  const [groups, setGroups] = useState(dummyGroups);
  const [searchTerm, setSearchTerm] = useState("");
  const [userLocation, setUserLocation] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedAddress, setSelectedAddress] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    max: 10,
    category: [],
    latitude: null,
    longitude: null,
  });

  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // 사용자 현재 위치 가져오기
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

  // 지도 초기화 (스터디 생성 모달 내)
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

        // 마커 생성 or 이동
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

  // 상세보기 모달 열릴 때 주소 변환
  useEffect(() => {
    if (selectedGroup && window.kakao && window.kakao.maps) {
      const geocoder = new window.kakao.maps.services.Geocoder();
      const coord = new window.kakao.maps.LatLng(
        selectedGroup.latitude,
        selectedGroup.longitude
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
    }
  }, [selectedGroup]);


  // 검색 + 거리 정렬
  const filteredGroups = groups
    .filter((g) => {
      const term = searchTerm.toLowerCase();
      return (
        g.title.toLowerCase().includes(term) ||
        g.description.toLowerCase().includes(term) ||
        g.category.some((tag) => tag.toLowerCase().includes(term))
      );
    })
    .map((g) => {
      if (userLocation) {
        g.distance = getDistance(
          userLocation.lat,
          userLocation.lng,
          g.latitude,
          g.longitude
        );
      } else {
        g.distance = null;
      }
      return g;
    })
    .sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));

  // 입력값 변경
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 스터디 생성
  const handleCreate = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return alert("스터디 제목을 입력하세요.");
    if (!formData.latitude || !formData.longitude)
      return alert("지도를 클릭해 위치를 지정해주세요.");
    if (formData.max > 20) return alert("최대 인원은 20명 이하만 가능합니다.");

    const newGroup = {
      id: Date.now(),
      title: formData.title,
      description: formData.description,
      leader: currentUser,
      members: 1,
      max: parseInt(formData.max),
      category: formData.category.length ? [...formData.category] : ["기타"],
      latitude: formData.latitude,
      longitude: formData.longitude,
    };

    setGroups((prev) => [...prev, newGroup]);
    setShowForm(false);
    alert("스터디가 생성되었습니다!");
  };

  // 수정 (리더만)
  const handleEdit = (group) => {
    if (group.leader !== currentUser)
      return alert("이 스터디의 리더만 수정할 수 있습니다.");
    setFormData(group);
    setShowForm(true);
  };

  // 삭제 (리더만)
  const handleDelete = (id, leader) => {
    if (leader !== currentUser)
      return alert("이 스터디의 리더만 삭제할 수 있습니다.");
    if (window.confirm("정말 삭제하시겠습니까?")) {
      setGroups((prev) => prev.filter((g) => g.id !== id));
      alert("스터디가 삭제되었습니다.");
    }
  };

  // 참여 신청
  const handleJoin = (id) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === id
          ? g.members < g.max
            ? { ...g, members: g.members + 1 }
            : (alert("최대 인원을 초과했습니다."), g)
          : g
      )
    );
    alert("참여 신청이 완료되었습니다! (PENDING)");
  };

  return (
    <div>
      <h2>스터디 목록</h2><br></br>

      {/* 검색창 */}
      <input
        type="text"
        className="form-control mb-2"
        placeholder="스터디를 검색하세요..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* 해시태그 */}
      <div className="mb-3">
        {dummyTags.map((tag, idx) => (
          <span
            key={idx}
            className="badge bg-secondary me-2"
            style={{ cursor: "pointer" }}
            onClick={() => setSearchTerm(tag)}
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* 스터디 생성 버튼 */}
      <div className="text-end mb-3">
        <button
          className="btn btn-success btn-sm"
          onClick={() => setShowForm(true)}
        >
          ➕ 새 스터디 생성
        </button>
      </div>

      {/* 스터디 목록 */}
      <div className="row">
        {filteredGroups.map((group) => (
          <div key={group.id} className="col-md-6 mb-3">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">{group.title}</h5>
                <p className="card-text">
                  {group.description} <br />
                  태그:{" "}
                  {group.category.map((tag, idx) => (
                    <span key={idx} className="badge bg-secondary me-1">#{tag}</span>
                  ))}<br />
                  거리:{" "}
                  {group.distance ? group.distance.toFixed(1) + " km" : "위치 정보 없음"} <br />
                  평점: ⭐ {group.rating ? group.rating : "4.5"}
                </p>
                <div className="d-flex justify-content-between">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => {setSelectedGroup(group); setShowModal(true); }}
                  >
                    상세보기
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleJoin(group.id)}
                  >
                    참여 신청
                  </button>
                  {group.leader === currentUser && (
                    <>
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => handleEdit(group)}
                      >
                        수정
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() =>
                          handleDelete(group.id, group.leader)
                        }
                      >
                        삭제
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredGroups.length === 0 && <p>검색 결과가 없습니다.</p>}
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
                <h5 className="modal-title">{selectedGroup.title}</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p><strong>리더:</strong> {selectedGroup.leader}</p>
                <p><strong>설명:</strong> {selectedGroup.description}</p>
                <p>
                  <strong>태그:</strong>{" "}
                  {selectedGroup.category.map((tag, idx) => (
                    <span key={idx} className="badge bg-info text-dark me-1">#{tag}</span>
                  ))}
                </p>
                <p>
                  <strong>위치:</strong>{" "}
                  {selectedAddress ? selectedAddress : `${selectedGroup.latitude?.toFixed(6)}, ${selectedGroup.longitude?.toFixed(6)}`}
                </p>

                <p>
                  <strong>인원:</strong> {selectedGroup.members}/
                  {selectedGroup.max}
                </p>
                <p><strong>평점:</strong> ⭐ {selectedGroup.rating ? selectedGroup.rating : "4.5"}</p>
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

      {/* 생성 폼 모달 */}
      {showForm && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">새 스터디 생성</h5>
                <button
                  type="button"
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
                    onChange={handleChange}
                    required
                  />
                  <textarea
                    className="form-control mb-2"
                    name="description"
                    placeholder="스터디 설명"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                  <input
                    className="form-control mb-2"
                    name="max"
                    type="number"
                    placeholder="최대 인원 (최대 20)"
                    value={formData.max}
                    onChange={handleChange}
                    required
                  />

                  {/* 해시태그 입력 */}
                  <div className="mb-2">
                    <label className="form-label">해시태그 추가</label>
                    <div className="d-flex">
                      <input
                        type="text"
                        className="form-control me-2"
                        placeholder="예: Java, AI..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const value = e.target.value.trim();
                            if (
                              value &&
                              !formData.category.includes(value)
                            ) {
                              setFormData((prev) => ({
                                ...prev,
                                category: [...prev.category, value],
                              }));
                            }
                            e.target.value = "";
                          }
                        }}
                      />
                    </div>

                    {/* 입력된 태그 목록 표시 */}
                    <div className="mt-2">
                      {formData.category.map((tag, idx) => (
                        <span
                          key={idx}
                          className="badge bg-info text-dark me-2"
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              category: prev.category.filter(
                                (t) => t !== tag
                              ),
                            }))
                          }
                        >
                          #{tag} ✕
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h6>지도에서 위치를 클릭하세요</h6>
                    <div
                      id="createMap"
                      style={{
                        width: "100%",
                        height: "300px",
                        borderRadius: "10px",
                        border: "1px solid #ccc",
                      }}
                    ></div>
                    {formData.latitude && (
                      <p className="mt-2 text-muted">
                        선택된 좌표: {formData.latitude.toFixed(6)},{" "}
                        {formData.longitude.toFixed(6)}
                      </p>
                    )}
                  </div>
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