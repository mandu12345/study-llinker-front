import React from "react";
// 차트 컴포넌트들을 import 합니다. (경로 확인 필요)
import StudyCountChart from "./charts/StudyCountChart";
import MemberRatioChart from "./charts/MemberRatioChart";
import AttendanceChart from "./charts/AttendanceChart";
import MatchingRateChart from "./charts/MatchingRateChart";
import DiversityChart from "./charts/DiversityChart";

// OpsChart.jsx와 동일한 더미 데이터를 사용합니다.
const dummyData = {
    studyLabels: ["1월", "2월", "3월", "4월", "5월"],
    studyData: [5, 8, 6, 10, 7],
    memberLabels: ["10대", "20대", "30대"],
    memberData: [10, 40, 20],
    attendanceLabels: ["1주차", "2주차", "3주차", "4주차"],
    attendanceData: [85, 90, 88, 92],
    matchingLabels: ["1월", "2월", "3월", "4월", "5월"],
    matchingData: [60, 70, 65, 75, 80],
    diversityLabels: ["1주차", "2주차", "3주차", "4주차"],
    diversityData: [3, 4, 5, 4],
};

const OpsChartContent = () => {
    const { 
        studyLabels, studyData, memberLabels, memberData, 
        attendanceLabels, attendanceData, matchingLabels, matchingData, 
        diversityLabels, diversityData 
    } = dummyData;

    return (
        <div className="ops-chart-content">
            <h4 className="mb-4 text-primary">📊 그룹 운영 핵심 통계</h4>
            
            <div className="row">
                <div className="col-md-6 mb-4">
                    <StudyCountChart labels={studyLabels} data={studyData} />
                </div>
                <div className="col-md-6 mb-4">
                    <MemberRatioChart labels={memberLabels} data={memberData} />
                </div>
                <div className="col-md-6 mb-4">
                    <AttendanceChart labels={attendanceLabels} data={attendanceData} />
                </div>
                <div className="col-md-6 mb-4">
                    <MatchingRateChart labels={matchingLabels} data={matchingData} />
                </div>
                <div className="col-md-12 mb-4">
                    <DiversityChart labels={diversityLabels} data={diversityData} />
                </div>
            </div>
        </div>
    );
};

export default OpsChartContent;
