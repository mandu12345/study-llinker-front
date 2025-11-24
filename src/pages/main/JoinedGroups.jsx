import React from "react";

const JoinedGroups = ({ schedules }) => {
  // 참여한 그룹만 필터링
  const joinedGroups = schedules.filter((s) => s.isJoined);

  return (
    <div>
      <h3>참여한 그룹</h3>
      {joinedGroups.length === 0 ? (
        <p>아직 참여한 그룹이 없습니다.</p>
      ) : (
        <ul className="list-group">
          {joinedGroups.map((g) => (
            <li
              key={g.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              {g.title} - 리더: {g.leader}
              <span className="badge bg-primary rounded-pill">
                {g.members}/{g.max}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default JoinedGroups;