import React from "react";
import StudyCountChart from "./charts/StudyCountChart";
import MemberRatioChart from "./charts/MemberRatioChart";
import AttendanceChart from "./charts/AttendanceChart";
import MatchingRateChart from "./charts/MatchingRateChart";
import DiversityChart from "./charts/DiversityChart";

const OpsChart = () => {
  // 더미 데이터 (나중에 API 연동 시 교체)
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

  return (
    <div>
      <h2>📊 운영 대시보드</h2>
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
