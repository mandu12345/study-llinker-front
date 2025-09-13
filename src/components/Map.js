import { useEffect } from "react";

function Map({ latitude, longitude }) {
  useEffect(() => {
    if (window.kakao && latitude && longitude) {
      const container = document.getElementById("map");
      const options = {
        center: new window.kakao.maps.LatLng(latitude, longitude),
        level: 3,
      };
      const map = new window.kakao.maps.Map(container, options);

      // 마커 표시
      new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(latitude, longitude),
        map,
      });
    }
  }, [latitude, longitude]);

  return <div id="map" style={{ width: "100%", height: "400px" }}></div>;
}

export default Map;
