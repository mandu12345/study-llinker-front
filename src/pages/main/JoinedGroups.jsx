import React, { useEffect, useState } from "react";
import api from "../../api/axios"; // 경로 맞춰 수정

const JoinedGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = Number(localStorage.getItem("userId")); // 로그인된 유저

  useEffect(() => {
    const fetchJoinedGroups = async () => {
      try {
        // 1) 전체 그룹 목록 조회
        const allGroupsRes = await api.get("/study-groups");
        const allGroups = allGroupsRes.data;

        const joinedList = [];

        // 2) 그룹별 멤버 확인
        for (const group of allGroups) {
          try {
            const membersRes = await api.get(`/study-groups/${group.groupId}/members`);
            const members = membersRes.data;

            const isJoined = members.some(
              (m) => m.userId === userId && m.status === "APPROVED"
            );

            if (!isJoined) continue;

            // 3) 리더 정보
            const leaderRes = await api.get(`/study-groups/${group.groupId}/leader`);
            const leader = leaderRes.data;

            // 4) 가장 가까운 일정 날짜(Optional)
            const schedulesRes = await api.get(
              `/study-groups/${group.groupId}/schedules`
            );
            const schedules = schedulesRes.data;

            // 날짜 badge는 첫 일정 기준
            let dateBadge = null;
            if (schedules.length > 0) {
              dateBadge = schedules[0].start_time?.slice(0, 10); // YYYY-MM-DD
            }

            joinedList.push({
              groupId: group.groupId,
              title: group.title,
              leaderName: leader.name,
              currentMembers: group.currentMembers,
              maxMembers: group.maxMembers,
              dateBadge,
            });
          } catch (err) {
            console.error("그룹 상세 조회 오류:", err);
          }
        }

        setGroups(joinedList);
      } catch (err) {
        console.error("전체 그룹 조회 오류:", err);
        alert("참여 그룹 목록을 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchJoinedGroups();
  }, []);

  if (loading) return <p>불러오는 중...</p>;

  return (
    <div className="card p-3 mt-3 shadow-sm">
      <h4 className="mb-3">📚 참여한 스터디 그룹</h4>

      {groups.length === 0 ? (
        <p className="text-muted">아직 참여한 그룹이 없습니다.</p>
      ) : (
        <div className="list-group">
          {groups.map((g, idx) => (
            <div
              key={g.groupId}
              className="list-group-item d-flex justify-content-between align-items-center border-0 border-bottom"
              style={{ backgroundColor: "white" }}
            >
              <div>
                <strong>{g.title}</strong>
                <br />
                <span className="text-muted">
                  리더: {g.leaderName} / 인원: {g.currentMembers}/{g.maxMembers}
                </span>
              </div>

              {g.dateBadge && (
                <span className="badge bg-primary">{g.dateBadge}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JoinedGroups;
