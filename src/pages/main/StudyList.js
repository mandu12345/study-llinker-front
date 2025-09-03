import React from "react";

const dummyGroups = [
  { id: 1, title: "Java 스터디", leader: "홍길동", members: 5, max: 10 },
  { id: 2, title: "AI 스터디", leader: "이호주", members: 8, max: 10 },
  { id: 3, title: "Spring Boot 스터디", leader: "김철수", members: 3, max: 10 },
];

const StudyList = () => {
  return (
    <div>
      <h3>스터디 목록</h3>
      <div className="row">
        {dummyGroups.map((group) => (
          <div key={group.id} className="col-md-6 mb-3">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">{group.title}</h5>
                <p className="card-text">
                  리더: {group.leader} <br />
                  참여: {group.members}/{group.max}
                </p>
                <button className="btn btn-primary btn-sm">참여 신청</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudyList;
