// src/pages/main/RecommendGroups.jsx
import React, { useState } from "react";

const dummyRecommend = [
  { id: 201, title: "알고리즘 스터디", leader: "이영희", members: 4, max: 10, date: new Date(2025, 8, 10), location: "101호", content: "알고리즘 문제 풀이 및 토론" },
  { id: 202, title: "Node.js 스터디", leader: "최강민", members: 6, max: 10, date: new Date(2025, 8, 12), location: "202호", content: "Node.js 프로젝트 실습" },
];

const RecommendGroups = ({ onAddSchedule }) => {
  const [selectedGroup, setSelectedGroup] = useState(null);

  return (
    <div>
      <h3>추천 그룹</h3>
      <div className="row">
        {dummyRecommend.map((g) => (
          <div key={g.id} className="col-md-6 mb-3">
            <div className="card border-success shadow-sm">
              <div className="card-body">
                <h5 className="card-title">{g.title}</h5>
                <p className="card-text">리더: {g.leader}</p>
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => setSelectedGroup(g)}
                >
                  참여 신청
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 상세정보 모달 */}
      {selectedGroup && (
        <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: "12px" }}>
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">{selectedGroup.title} 상세 정보</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedGroup(null)}
                />
              </div>
              <div className="modal-body">
                <p>리더: {selectedGroup.leader}</p>
                <p>날짜: {selectedGroup.date.toDateString()}</p>
                <p>내용: {selectedGroup.content}</p>
                <p>참여 인원: {selectedGroup.members}/{selectedGroup.max}</p>
                <p>장소: {selectedGroup.location}</p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => {
                    onAddSchedule(selectedGroup); // 메인페이지 일정 추가
                    setSelectedGroup(null); // 모달 닫기
                  }}
                >
                  신청하기
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedGroup(null)}
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
