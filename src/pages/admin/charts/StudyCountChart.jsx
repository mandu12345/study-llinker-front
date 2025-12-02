import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const StudyCountChart = ({ labels, data }) => {
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    useEffect(() => {
        // 1. 이전 인스턴스 파괴
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        if (!chartRef.current) return;
        
        const ctx = chartRef.current.getContext("2d");

        // 2. 새 차트 인스턴스 생성
        const newChartInstance = new Chart(ctx, {
            type: "bar",
            data: {
                labels,
                datasets: [
                    {
                        label: "스터디 개설 수",
                        data,
                        backgroundColor: "rgba(54, 162, 235, 0.6)",
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: '월별 스터디 개설 추이' }
                }
            }
        });

        chartInstanceRef.current = newChartInstance;

        // 3. 클린업 함수: 컴포넌트 업데이트/제거 시 차트 파괴
        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
                chartInstanceRef.current = null;
            }
        };
    }, [labels, data]);

    return (
        <div style={{ height: '300px' }}>
            <canvas ref={chartRef}></canvas>
        </div>
    );
};

export default StudyCountChart;
