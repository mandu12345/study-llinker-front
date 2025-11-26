import React, { useEffect, useState } from "react";
import api from "../../api/axios";

import StudyCountChart from "./charts/StudyCountChart";
import MemberRatioChart from "./charts/MemberRatioChart";
import AttendanceChart from "./charts/AttendanceChart";

const OpsChartContent = () => {
    const [studyCount, setStudyCount] = useState({ labels: [], data: [] });
    const [memberRatio, setMemberRatio] = useState({ labels: [], data: [] });
    const [attendance, setAttendance] = useState({ labels: [], data: [] });

    useEffect(() => {

        // ----------------------------------------------------
        // 1) 월별 스터디 생성 수 (백엔드 API 사용)
        // GET /api/stats/study-count
        // ----------------------------------------------------
        api.get("/stats/study-count").then(res => {
            setStudyCount({
                labels: res.data.labels,
                data: res.data.data
            });
        });


        // ----------------------------------------------------
        // 2) 카테고리 비율
        // GET /api/stats/member-ratio
        // ----------------------------------------------------
        api.get("/stats/member-ratio").then(res => {
            setMemberRatio({
                labels: res.data.labels,
                data: res.data.data
            });
        });


        // ----------------------------------------------------
        // 3) 출석 상태 비율
        // GET /api/stats/attendance
        // ----------------------------------------------------
        api.get("/stats/attendance").then(res => {
            setAttendance({
                labels: res.data.labels,
                data: res.data.data
            });
        });

    }, []);


    return (
        <div className="ops-chart-content">
            <h4 className="mb-4 text-primary">📊 그룹 운영 핵심 통계</h4>

            <div className="row">
                <div className="col-md-6 mb-4">
                    <StudyCountChart labels={studyCount.labels} data={studyCount.data} />
                </div>

                <div className="col-md-6 mb-4">
                    <MemberRatioChart labels={memberRatio.labels} data={memberRatio.data} />
                </div>

                <div className="col-md-6 mb-4">
                    <AttendanceChart labels={attendance.labels} data={attendance.data} />
                </div>
            </div>
        </div>
    );
};

export default OpsChartContent;
