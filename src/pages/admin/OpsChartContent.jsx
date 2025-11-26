import React, { useEffect, useState } from "react";
import api from "../../api/axios";

import StudyCountChart from "./charts/StudyCountChart";
import MemberRatioChart from "./charts/MemberRatioChart";
import AttendanceChart from "./charts/AttendanceChart";
import MatchingRateChart from "./charts/MatchingRateChart";
import DiversityChart from "./charts/DiversityChart";

const OpsChartContent = () => {
    const [studyCount, setStudyCount] = useState({ labels: [], data: [] });
    const [memberRatio, setMemberRatio] = useState({ labels: [], data: [] });
    const [attendance, setAttendance] = useState({ labels: [], data: [] });
    const [matchingRate, setMatchingRate] = useState({ labels: [], data: [] });
    const [diversity, setDiversity] = useState({ labels: [], data: [] });

    useEffect(() => {

        // ----------------------------------------------------
        // 1) 일정 전체 조회 → 월별 일정 개수 차트
        // ----------------------------------------------------
        api.get("/study-schedules").then(res => {
            const schedules = res.data;

            const monthMap = {};
            schedules.forEach(s => {
                const month = s.date.substring(5, 7) + "월";
                monthMap[month] = (monthMap[month] || 0) + 1;
            });

            setStudyCount({
                labels: Object.keys(monthMap),
                data: Object.values(monthMap),
            });
        });


        // ----------------------------------------------------
        // 2) 출석률 계산 → 전체 출석 / 전체 일정
        // ----------------------------------------------------
        Promise.all([
            api.get("/attendance"),
            api.get("/study-schedules")
        ]).then(([attRes, schRes]) => {
            const attendanceList = attRes.data; 
            const schedules = schRes.data;

            const result = {};   // month ⇒ {totalSchedules, presentCount}

            schedules.forEach(s => {
                const month = s.date.substring(5, 7) + "월";
                result[month] = result[month] || { total: 0, present: 0 };
                result[month].total += 1;
            });

            attendanceList.forEach(a => {
                const month = a.date.substring(5, 7) + "월";
                if (!result[month]) return;

                if (a.status === "Present") {
                    result[month].present += 1;
                }
            });

            setAttendance({
                labels: Object.keys(result),
                data: Object.values(result).map(v =>
                    Math.round((v.present / v.total) * 100)
                )
            });
        });


        // ----------------------------------------------------
        // 3) 참여 비율 (추후 필요 시 계산 방식 변경 가능)
        // ----------------------------------------------------
        // 현재 관리자 프론트에는 멤버 비율 데이터가 없으므로
        // 예시로 일정 참여자 수 기준으로 비율을 계산
        api.get("/attendance").then(res => {
            const list = res.data;

            const statusCount = {
                Present: 0,
                Absent: 0,
                Late: 0
            };

            list.forEach(a => {
                if (a.status in statusCount) statusCount[a.status]++;
            });

            setMemberRatio({
                labels: Object.keys(statusCount),
                data: Object.values(statusCount)
            });
        });


        // ----------------------------------------------------
        // 4) 매칭 성공률 (임시 계산: 출석 Present 비율 사용)
        // ----------------------------------------------------
        api.get("/attendance").then(res => {
            const list = res.data;

            const total = list.length;
            const present = list.filter(a => a.status === "Present").length;

            const successRate = Math.round((present / total) * 100);

            setMatchingRate({
                labels: ["매칭 성공률"],
                data: [successRate]
            });
        });


        // ----------------------------------------------------
        // 5) 추천 다양성 지표 (출석 상태 종류 개수 기반)
        // ----------------------------------------------------
        api.get("/attendance").then(res => {
            const list = res.data;

            const byMonth = {};

            list.forEach(a => {
                const month = a.date.substring(5,7) + "월";
                byMonth[month] = byMonth[month] || new Set();
                byMonth[month].add(a.status);
            });

            setDiversity({
                labels: Object.keys(byMonth),
                data: Object.values(byMonth).map(set => set.size)
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

                <div className="col-md-6 mb-4">
                    <MatchingRateChart labels={matchingRate.labels} data={matchingRate.data} />
                </div>

                <div className="col-md-12 mb-4">
                    <DiversityChart labels={diversity.labels} data={diversity.data} />
                </div>
            </div>
        </div>
    );
};

export default OpsChartContent;
