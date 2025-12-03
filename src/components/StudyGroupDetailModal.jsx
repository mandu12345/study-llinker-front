// src/components/StudyGroupDetailModal.jsx

import React, { useEffect, useState } from "react";
import api from "../api/axios";

const StudyGroupDetailModal = ({ group, onClose, userId }) => {
  const [leaderId, setLeaderId] = useState(null);
  const [leaderName, setLeaderName] = useState("");
  const [members, setMembers] = useState([]);           // 모든 멤버(PENDING + APPROVED)
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  const isLeader = userId === leaderId;

  // ------------------------------
  // 1) 그룹 기본 정보 불러오기
  // ------------------------------
  useEffect(() => {
    const load = async () => {
      try {
        // 리더 정보
        const leaderRes = await api.get(`/study-groups/${group.group_id}/leader`);
        setLeaderId(leaderRes.data.leader_id);
        setLeaderName(leaderRes.data.leader_name);

        // 멤버 목록
        const memRes = await api.get(`/study-groups/${group.group_id}/members`);
        setMembers(memRes.data);

        // 일정 목록
        const schRes = await api.get(`/study-groups/${group.group_id}/schedules`);
        setSchedules(schRes.data);
      } catch (err) {
        console.error("그룹 상세 정보 로드 실패", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [group.group_id]);

  // ------------------------------
  // 2) 가입 승인
  // ------------------------------
  const handleApprove = async (uid) => {
    try {
      await api.post(`/study-groups/${group.group_id}/members/${uid}/approve`);
      alert("승인 완료!");
      reloadMembers();
    } catch (err) {
      console.error(err);
      alert("승인 실패");
    }
  };

  // ------------------------------
  // 3) 가입 거절
  // ------------------------------
  const handleReject = async (uid) => {
    try {
      await api.post(`/study-groups/${group.group_id}/members/${uid}/reject`);
      alert("거절 완료!");
      reloadMembers();
    } catch (err) {
      console.error(err);
      alert("거절 실패");
    }
  };

  // ------------------------------
  // 4) 강퇴
  // ------------------------------
  const handleKick = async (memberId) => {
    if (!window.confirm("정말 이 멤버를 강퇴하시겠습니까?")) return;

    try {
      await api.delete(`/group-members/${memberId}`);
      alert("강퇴 완료!");
      reloadMembers();
    } catch (err) {
      console.error(err);
      alert("강퇴 실패");
    }
  };

  // 멤버 재로드
  const reloadMembers = async () => {
    const memRes = await api.get(`/study-groups/${group.group_id}/members`);
    setMembers(memRes.data);
  };

  if (loading) return null;

  return (
    <div className="modal d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">

          <div className="modal-header">
            <h5 className="modal-title">{group.title} 상세 정보</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {/* ---------------- 그룹 기본 정보 ---------------- */}
            <h5>📌 그룹 정보</h5>
            <p><strong>제목:</strong> {group.title}</p>
            <p><strong>설명:</strong> {group.description}</p>
            <p><strong>리더:</strong> {leaderName}</p>

            <hr />

            {/* ---------------- 리더 전용: 가입 요청 멤버 ---------------- */}
            {isLeader && (
              <>
                <h5>📥 가입 요청 멤버</h5>
                {members.filter(m => m.status === "PENDING").length === 0 ? (
                  <p>가입 요청이 없습니다.</p>
                ) : (
                  <ul className="list-group mb-3">
                    {members.filter(m => m.status === "PENDING").map((m) => (
                      <li key={m.member_id} className="list-group-item d-flex justify-content-between">
                        <span>{m.name}</span>
                        <div>
                          <button className="btn btn-success btn-sm me-2"
                            onClick={() => handleApprove(m.user_id)}>
                            승인
                          </button>
                          <button className="btn btn-danger btn-sm"
                            onClick={() => handleReject(m.user_id)}>
                            거절
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <hr />
              </>
            )}

            {/* ---------------- 현재 멤버 목록 ---------------- */}
            <h5>👥 현재 멤버</h5>
            {members.filter(m => m.status === "APPROVED").length === 0 ? (
              <p>현재 가입된 멤버가 없습니다.</p>
            ) : (
              <ul className="list-group mb-3">
                {members.filter(m => m.status === "APPROVED").map((m) => (
                  <li key={m.member_id} className="list-group-item d-flex justify-content-between">
                    <span>{m.name}</span>

                    {isLeader && m.user_id !== leaderId && (
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleKick(m.member_id)}
                      >
                        강퇴
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <hr />

            {/* ---------------- 일정 목록 ---------------- */}
            <h5>📅 일정 목록</h5>
            {schedules.length === 0 ? (
              <p>등록된 일정이 없습니다.</p>
            ) : (
              <ul className="list-group">
                {schedules.map((s) => (
                  <li key={s.schedule_id} className="list-group-item">
                    <strong>{s.title}</strong> — {s.start_time.slice(0, 16)}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyGroupDetailModal;
