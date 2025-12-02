import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const AttendanceChart = ({ labels, data }) => {
    // 1. 캔버스 엘리먼트와 차트 인스턴스를 저장할 참조(Ref) 생성
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null); 

    useEffect(() => {
        // 2. [클린업] 이전 차트 인스턴스가 존재하면 파괴합니다.
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        // 3. 캔버스 엘리먼트가 준비되었는지 확인
        if (!chartRef.current) return;
        
        const ctx = chartRef.current.getContext("2d");

        // 4. 새 차트 인스턴스 생성
        const newChartInstance = new Chart(ctx, {
            type: "line",
            data: {
                labels,
                datasets: [
                    {
                        label: "출석률 (%)",
                        data,
                        borderColor: "green",
                        fill: false,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // 필요에 따라 추가
                plugins: {
                    title: {
                        display: true,
                        text: '출석률 및 결석률 통계'
                    }
                }
            }
        });

        // 5. 새 인스턴스를 참조에 저장
        chartInstanceRef.current = newChartInstance;

        // 6. [클린업 함수] 컴포넌트가 사라지거나 업데이트되기 전에 차트 인스턴스를 파괴
        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
                chartInstanceRef.current = null;
            }
        };
    }, [labels, data]); // labels나 data가 변경될 때마다 재실행

    // 7. 캔버스에 ref를 연결
    return (
        <div style={{ height: '300px' }}> {/* 차트 높이를 지정하여 레이아웃 안정화 */}
            <canvas id="attendanceChart" ref={chartRef}></canvas>
        </div>
    );
};

export default AttendanceChart;