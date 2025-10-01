import React, { useEffect, useState } from "react";

const MapModal = ({ onClose, onSelectLocation }) => {
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [selectedCoords, setSelectedCoords] = useState(null);

  useEffect(() => {
    // 이미 스크립트가 있으면 중복 추가 방지
    if (!document.getElementById("kakao-map-script")) {
      const script = document.createElement("script");
      script.id = "kakao-map-script";
      script.src =
        "//dapi.kakao.com/v2/maps/sdk.js?appkey=카카오API키&autoload=false&libraries=services,places";
      script.async = true;
      script.onload = () => {
        window.kakao.maps.load(initMap);
      };
      document.head.appendChild(script);
    } else {
      window.kakao.maps.load(initMap);
    }
  }, []);

  const initMap = () => {
    const mapContainer = document.getElementById("map");
    if (!mapContainer) return;

    const mapOption = {
      center: new window.kakao.maps.LatLng(37.448493, 127.127868), // 가천대역 기본 좌표
      level: 3,
    };

    const createdMap = new window.kakao.maps.Map(mapContainer, mapOption);
    setMap(createdMap);

    // 모달 안에서 지도가 깨지는 경우 -> relayout 필수
    setTimeout(() => {
      createdMap.relayout();
      createdMap.setCenter(new window.kakao.maps.LatLng(37.448493, 127.127868));
    }, 300);
  };

  // 지도 클릭 이벤트 등록
  useEffect(() => {
    if (!map) return;

    const clickHandler = (mouseEvent) => {
      const latlng = mouseEvent.latLng;

      if (marker) marker.setMap(null);

      const newMarker = new window.kakao.maps.Marker({
        position: latlng,
      });
      newMarker.setMap(map);
      setMarker(newMarker);

      setSelectedCoords({ lat: latlng.getLat(), lng: latlng.getLng() });
    };

    window.kakao.maps.event.addListener(map, "click", clickHandler);

    return () => {
      window.kakao.maps.event.removeListener(map, "click", clickHandler);
    };
  }, [map, marker]);

  // 키워드 검색
  const handleSearch = () => {
    const keyword = document.getElementById("keyword").value;
    if (!keyword || !map) return;

    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(keyword, function (data, status) {
      if (status === window.kakao.maps.services.Status.OK) {
        const place = data[0];
        const moveLatLon = new window.kakao.maps.LatLng(place.y, place.x);
        map.setCenter(moveLatLon);

        if (marker) marker.setMap(null);

        const newMarker = new window.kakao.maps.Marker({
          position: moveLatLon,
        });
        newMarker.setMap(map);
        setMarker(newMarker);

        setSelectedCoords({ lat: parseFloat(place.y), lng: parseFloat(place.x) });
      } else {
        alert("검색 결과가 없습니다!");
      }
    });
  };

  // 확인 버튼 눌러야 최종 반영
  const handleConfirm = () => {
    if (!selectedCoords) {
      alert("위치를 선택해주세요!");
      return;
    }
    onSelectLocation(selectedCoords.lat, selectedCoords.lng);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div style={{ width: "650px", background: "#fff", borderRadius: "10px" }}>
        {/* 검색창 */}
        <div style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
          <input
            id="keyword"
            type="text"
            placeholder="장소 검색 (예: 강남역)"
            className="form-control"
            style={{ display: "inline-block", width: "70%" }}
          />
          <button
            className="btn btn-primary ms-2"
            onClick={handleSearch}
            style={{ width: "25%" }}
          >
            검색
          </button>
        </div>

        {/* 지도 영역 */}
        <div
          id="map"
          style={{ width: "100%", height: "400px", borderRadius: "0 0 10px 10px" }}
        ></div>

        {/* 버튼 영역 */}
        <div className="d-flex">
          <button className="btn btn-secondary w-50 mt-2" onClick={onClose}>
            닫기
          </button>
          <button className="btn btn-success w-50 mt-2" onClick={handleConfirm}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapModal;
