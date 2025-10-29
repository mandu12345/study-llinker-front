import React, { useState, useEffect } from "react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import RecoAlertModal from './RecoAlertModal'; // 알림 모달 import

const RecoManagement = () => {
    // F-S-RM-001: 현재 적용 알고리즘 상태 (초기값을 T-L Hybrid로 변경)
    const [algorithm, setAlgorithm] = useState("TagLocation_Hybrid");
    // T-L Hybrid 모델을 위한 가중치 (기본값 설정)
    const [tagWeight, setTagWeight] = useState(0.6);
    const [locWeight, setLocWeight] = useState(0.4);

    // 모달 상태 관리
    const [modal, setModal] = useState({ show: false, title: '', message: '', type: '' });

    // 모니터링 데이터 (최근 10회 기록)
    const [chartData, setChartData] = useState([
        { time: "00:00", successRate: 75, diversity: 4.2 },
    ]);

    // 모달 닫기 핸들러
    const handleCloseModal = () => {
        setModal({ show: false, title: '', message: '', type: '' });
    };

    // F-S-RM-001: 알고리즘 및 가중치 저장
    const handleAlgorithmSave = () => {
        // T-L Hybrid 모델일 경우에만 가중치 합산 체크
        if (algorithm === "TagLocation_Hybrid" && (tagWeight + locWeight).toFixed(1) !== "1.0") {
            setModal({
                show: true,
                title: "설정 오류",
                message: "태그 가중치와 위치 가중치의 합은 1.0(100%)이 되어야 합니다.",
                type: "error"
            });
            return;
        }

        // 실제로는 백엔드 API 호출하여 알고리즘 모델과 가중치를 저장해야 함
        let message = `추천 알고리즘 모델을 [${algorithm}]로 변경하고 저장했습니다.`;
        if (algorithm === "TagLocation_Hybrid") {
            message += `\n(가중치: 태그 ${tagWeight}, 위치 ${locWeight} 적용)`;
        }

        setModal({
            show: true,
            title: "설정 완료",
            message: message,
            type: "success"
        });
    };

    // F-S-RM-002: 수동 새로고침
    const handleMonitorRefresh = () => {
        updateChartData();
        setModal({
            show: true,
            title: "모니터링 갱신",
            message: "추천 결과 모니터링 데이터를 새로 고침했습니다.",
            type: "success"
        });
    };

    // ✅ 자동 갱신 (10초마다 데이터 추가)
    useEffect(() => {
        const interval = setInterval(() => {
            updateChartData();
        }, 10000); 
        return () => clearInterval(interval);
    }, [chartData]);

    // ✅ 차트 데이터 갱신 함수
    const updateChartData = () => {
        const now = new Date();
        const newTime = now.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

        const last = chartData[chartData.length - 1] || { successRate: 75, diversity: 4.2 };
        const newEntry = {
            time: newTime,
            successRate: Math.min(100, (parseFloat(last.successRate) + Math.random() * 3 - 1).toFixed(1)), 
            diversity: (parseFloat(last.diversity) + (Math.random() * 0.3 - 0.1)).toFixed(2), 
        };

        setChartData((prev) => [...prev.slice(-9), newEntry]);
    };

    // 최신 데이터 (텍스트 표시용)
    const latest = chartData[chartData.length - 1];

    // 가중치 핸들러
    const handleTagWeightChange = (e) => {
        const newTagW = parseFloat(e.target.value) || 0;
        setTagWeight(newTagW);
        setLocWeight(parseFloat((1.0 - newTagW).toFixed(1)));
    };

    return (
        <div className="reco-management">
            <h2>💡 추천 관리</h2>

            {/* F-S-RM-001: 추천 알고리즘 설정 */}
            <div className="card mb-4 shadow-sm">
                <div className="card-header fw-bold">추천 알고리즘 설정</div>
                <div className="card-body">
                    
                    <p>현재 적용 모델: <strong>{algorithm}</strong></p>
                    
                    {/* 알고리즘 선택 드롭다운: 옵션 변경 완료 */}
                    <div className="mb-4">
                        <label className="form-label">모니터링 대상 알고리즘 선택</label>
                        <select
                            className="form-select w-50"
                            value={algorithm}
                            onChange={(e) => setAlgorithm(e.target.value)}
                        >
                            <option value="TagLocation_Hybrid">위치 + 태그유사도</option>
                            <option value="CollaborativeFiltering">협업 필터링 (CF)</option>
                            <option value="Popularity">인기 기반</option>
                        </select>
                    </div>

                    {/* ✅ T-L Hybrid 가중치 설정 UI 추가 (알고리즘 선택 시에만 표시) */}
                    {algorithm === "TagLocation_Hybrid" && (
                        <div className="mb-4 p-3 border rounded">
                            <p className="fw-bold mb-2">하이브리드 가중치 조정 (총합 1.0)</p>
                            <div className="d-flex align-items-center mb-2">
                                <label className="form-label mb-0 w-50 me-2">태그 유사도 가중치 (β)</label>
                                <input 
                                    type="number" 
                                    step="0.1" 
                                    min="0.0" 
                                    max="1.0" 
                                    className="form-control w-25 me-2" 
                                    value={tagWeight} 
                                    onChange={handleTagWeightChange} // 태그 가중치 변경 시 위치 가중치 자동 계산
                                />
                                <span className="fw-bold text-primary">{tagWeight * 100}%</span>
                            </div>
                            <div className="d-flex align-items-center">
                                <label className="form-label mb-0 w-50 me-2">위치 근접도 가중치 (α)</label>
                                {/* 위치 가중치는 태그 가중치에 따라 자동 계산됨 */}
                                <input 
                                    type="number" 
                                    disabled 
                                    className="form-control w-25 me-2 bg-light" 
                                    value={locWeight} 
                                />
                                <span className="fw-bold text-primary">{locWeight * 100}%</span>
                            </div>
                            <small className="text-muted mt-2 d-block">추천점수 = (1 / (1 + 거리(km))) * α + (태그유사도 점수) * β</small>
                        </div>
                    )}
                    
                    <button className="btn btn-primary" onClick={handleAlgorithmSave}>
                        알고리즘 설정 저장
                    </button>
                </div>
            </div>

            {/* F-S-RM-002: 추천 결과 모니터링 + 실시간 시각화 */}
            <div className="card shadow-sm">
                <div className="card-header d-flex justify-content-between align-items-center fw-bold">
                    추천 결과 모니터링 (10초마다 자동 갱신)
                    <button className="btn btn-sm btn-outline-secondary" onClick={handleMonitorRefresh}>
                        새로 고침
                    </button>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-4">
                            <p>현재 모델: <strong>{algorithm}</strong></p>
                            <p>매칭 성공률: <strong>{latest.successRate}%</strong></p>
                            <p>추천 다양성 지표: <strong>{latest.diversity}</strong></p>
                            <p>최근 측정 시각: <strong>{latest.time}</strong></p>
                        </div>

                        {/* ✅ 라인차트 (시간별 변화 추적) */}
                        <div className="col-md-8">
                            <div style={{ width: "100%", height: 300 }}>
                                <ResponsiveContainer>
                                    <LineChart
                                        data={chartData}
                                        margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="time" />
                                        <YAxis yAxisId="left" orientation="left" domain={[60, 100]} />
                                        <YAxis yAxisId="right" orientation="right" domain={[3, 5]} />
                                        <Tooltip />
                                        <Legend />
                                        <Line
                                            yAxisId="left"
                                            type="monotone"
                                            dataKey="successRate"
                                            stroke="#36A2EB"
                                            strokeWidth={2}
                                            dot={{ r: 3 }}
                                            name="매칭 성공률(%)"
                                        />
                                        <Line
                                            yAxisId="right"
                                            type="monotone"
                                            dataKey="diversity"
                                            stroke="#FFCE56"
                                            strokeWidth={2}
                                            dot={{ r: 3 }}
                                            name="추천 다양성 지표"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* 알림 모달 렌더링 */}
            <RecoAlertModal
                show={modal.show}
                title={modal.title}
                message={modal.message}
                type={modal.type}
                onClose={handleCloseModal}
            />
        </div>
    );
};

export default RecoManagement;
