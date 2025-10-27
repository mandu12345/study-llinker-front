// src/pages/admin/OpsChart.jsx

import React from "react";
import StudyCountChart from "./charts/StudyCountChart";
import MemberRatioChart from "./charts/MemberRatioChart";
import AttendanceChart from "./charts/AttendanceChart";
import MatchingRateChart from "./charts/MatchingRateChart";
import DiversityChart from "./charts/DiversityChart";

const OpsChart = () => {
    // F-S-DA-001: 주요 통계 조회 데이터 추가
    const totalUsers = 1250;
    const activeStudies = 120;
    const newSignups = 55;

     // (기존 차트 더미 데이터는 유지)
     const studyLabels = ["1월", "2월", "3월", "4월", "5월"];
     const studyData = [5, 8, 6, 10, 7];
     const memberLabels = ["10대", "20대", "30대"];
     const memberData = [10, 40, 20];
     const attendanceLabels = ["1주차", "2주차", "3주차", "4주차"];
     const attendanceData = [85, 90, 88, 92];
     const matchingLabels = ["1월", "2월", "3월", "4월", "5월"];
     const matchingData = [60, 70, 65, 75, 80];
     const diversityLabels = ["1주차", "2주차", "3주차", "4주차"];
     const diversityData = [3, 4, 5, 4];

    // F-S-DA-005: 데이터 내보내기 더미 함수
    const handleExport = () => {
        alert("📊 통계 데이터 (F-S-DA-005)를 CSV로 내보냅니다.");
        // 실제로는 API 호출 및 파일 다운로드 로직이 필요
    };

   return (
      <div>
         <h2>📊 운영 대시보드</h2>

        {/* F-S-DA-001: 주요 통계 조회 UI 추가 */}
        <div className="alert alert-info d-flex justify-content-between mb-4">
            <p className="mb-0">총 회원: <strong>{totalUsers}명</strong></p>
            <p className="mb-0">활성 스터디: <strong>{activeStudies}개</strong></p>
            <p className="mb-0">신규 가입 (오늘): <strong>{newSignups}명</strong></p>
            {/* F-S-DA-005: 데이터 내보내기 버튼 추가 */}
            <button className="btn btn-sm btn-primary" onClick={handleExport}>
                📥 데이터 내보내기
            </button>
        </div>

        {/* F-S-DA-002, 003: 차트 영역 (기존 코드 유지) */}
         <div className="row">
            <div className="col-md-6">
               <StudyCountChart labels={studyLabels} data={studyData} />
            </div>
            <div className="col-md-6">
               <MemberRatioChart labels={memberLabels} data={memberData} />
            </div>
            <div className="col-md-6 mt-4">
               <AttendanceChart labels={attendanceLabels} data={attendanceData} />
            </div>
            <div className="col-md-6 mt-4">
               <MatchingRateChart labels={matchingLabels} data={matchingData} />
            </div>
            <div className="col-md-12 mt-4">
               <DiversityChart labels={diversityLabels} data={diversityData} />
            </div>
         </div>
      </div>
   );
};

export default OpsChart;