import { useEffect } from "react";

function Map({ latitude, longitude, onClick }) {
  useEffect(() => {
    if (window.kakao && latitude && longitude) {
      const container = document.getElementById("map");
      const options = {
        center: new window.kakao.maps.LatLng(latitude, longitude),
        level: 3,
      };
      const map = new window.kakao.maps.Map(container, options);

      // 초기 마커
      const marker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(latitude, longitude),
        map,
      });

      // 클릭 이벤트 → 마커 이동 + 좌표 전달
      window.kakao.maps.event.addListener(map, "click", function (mouseEvent) {
        const latlng = mouseEvent.latLng;
        marker.setPosition(latlng);
        if (onClick) {
          onClick(latlng.getLat(), latlng.getLng());
        }
      });
    }
  }, [latitude, longitude, onClick]);

  return <div id="map" style={{ width: "100%", height: "400px" }}></div>;
}

export default Map;
