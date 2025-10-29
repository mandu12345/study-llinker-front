import React from 'react';

// RecoManagement에서 사용하는 경고/확인 모달
const RecoAlertModal = ({ show, title, message, type, onClose, onConfirm }) => {
    if (!show) return null;

    // 모달 유형에 따른 스타일 조정
    let headerClass = 'bg-gray-400 text-gray-800'; 
    let titleIcon = '🔔';
    let buttonClass = 'bg-gray-500 hover:bg-gray-600'; 
    let buttonTextColor = 'text-gray-900'; 
    let modalBodyClass = 'bg-white'; 

    if (type === 'success') {
        // 성공 시 하늘색 (sky-500)
        headerClass = 'bg-sky-500 text-white'; 
        titleIcon = '✅';
        buttonClass = 'bg-sky-500 hover:bg-sky-600'; 
    } else if (type === 'error') {
        // 오류 시 빨간색 (red-600)
        headerClass = 'bg-red-600 text-white';
        titleIcon = '❌';
        buttonClass = 'bg-red-600 hover:bg-red-700';
    } else if (type === 'admin') {
        // 관리자 로그인 시 (sky-500)
        headerClass = 'bg-sky-500 text-white'; 
        titleIcon = '👑';
        buttonClass = 'bg-sky-500 hover:bg-sky-600'; 
    }

    // 모달 외부 배경색은 밝은 회색으로 유지
    const modalStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(169, 169, 169, 0.8)', 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1050
    };

    return (
        <div style={modalStyle}>
            {/* 모달 본체: max-w-lg, 흰색 배경 (modalBodyClass) 적용 */}
            <div className={`rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden min-h-[200px] flex flex-col ${modalBodyClass}`}>
                
                {/* Header: className 중복 제거 */}
                <div className={`p-4 font-bold flex items-center ${headerClass} flex-shrink-0`}>
                    <span className="text-2xl mr-3">{titleIcon}</span>
                    <h5 className="text-lg">{title}</h5>
                </div>
                
                {/* Body: 줄 바꿈 스타일 적용 및 여백 증가 */}
                <div className="p-8 flex-grow flex items-center">
                    <p 
                        className="text-gray-700 text-base leading-relaxed" 
                        style={{ whiteSpace: 'pre-wrap' }}
                    >
                        {message}
                    </p>
                </div>

                {/* Footer */}
                <div className="flex justify-end p-4 border-t border-gray-200 flex-shrink-0">
                    <button 
                        type="button" 
                        // 버튼 글씨색이 검은색(text-gray-900)으로 고정됩니다.
                        className={`px-6 py-2 rounded-lg transition duration-150 shadow-md ${buttonClass} ${buttonTextColor} font-semibold`} 
                        onClick={onConfirm || onClose}
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecoAlertModal;