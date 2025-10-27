import React, { useState, useEffect } from 'react';

const GroupEditModal = ({ show, group, onSave, onClose }) => {
    const [editedGroup, setEditedGroup] = useState(group);
    const [error, setError] = useState(''); // 에러 메시지 상태 추가
    
    useEffect(() => {
        if (show) {
            setEditedGroup(group);
            setError('');
        }
    }, [show, group]);

    if (!show) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedGroup(prev => ({ 
            ...prev, 
            [name]: name === 'members' || name === 'max' ? parseInt(value) || 0 : value 
        }));
    };

    const handleSave = () => {
        if (editedGroup.members > editedGroup.max) {
            setError("⚠️ 현재 인원은 최대 인원을 초과할 수 없습니다.");
            return;
        }
        onSave(editedGroup);
    };

    const modalStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // 배경을 약간 더 어둡게
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1050
    };

    return (
        <div style={modalStyle}>
            {/* 모달 본체: 그림자 강화, 둥근 모서리, Tailwind 클래스 활용 */}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
                <div className="p-6">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
                        <h5 className="text-2xl font-bold text-indigo-700">📚 스터디 그룹 정보 수정</h5>
                        <button type="button" className="text-gray-500 hover:text-gray-800 text-3xl transition duration-150" onClick={onClose}>&times;</button>
                    </div>
                    
                    <div className="space-y-4">
                        
                        {/* 그룹명 */}
                        <label className="block">
                            <span className="text-sm font-medium text-gray-600">그룹명</span>
                            <input 
                                type="text" 
                                name="title" 
                                value={editedGroup.title} 
                                onChange={handleChange} 
                                className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </label>
                        
                        {/* 카테고리 */}
                        <label className="block">
                            <span className="text-sm font-medium text-gray-600">카테고리</span>
                            <select 
                                name="category" 
                                value={editedGroup.category} 
                                onChange={handleChange} 
                                className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="IT">IT (기술)</option>
                                <option value="AI">AI (인공지능)</option>
                                <option value="Culture">Culture (문화/예술)</option>
                            </select>
                        </label>
                        
                        {/* 리더 */}
                        <label className="block">
                            <span className="text-sm font-medium text-gray-600">리더</span>
                            <input 
                                type="text" 
                                name="leader" 
                                value={editedGroup.leader} 
                                onChange={handleChange} 
                                className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </label>
                        
                        {/* 인원 수 */}
                        <div className="flex space-x-4">
                            <label className="block w-1/2">
                                <span className="text-sm font-medium text-gray-600">현재 인원</span>
                                <input 
                                    type="number" 
                                    name="members" 
                                    value={editedGroup.members} 
                                    onChange={handleChange} 
                                    className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5"
                                />
                            </label>
                            <label className="block w-1/2">
                                <span className="text-sm font-medium text-gray-600">최대 인원</span>
                                <input 
                                    type="number" 
                                    name="max" 
                                    value={editedGroup.max} 
                                    onChange={handleChange} 
                                    className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5"
                                />
                            </label>
                        </div>
                    </div>

                    {/* 에러 메시지 영역 */}
                    {error && (
                        <div className="text-sm text-red-600 mt-3 p-2 bg-red-100 rounded-lg">{error}</div>
                    )}

                    {/* 푸터 버튼 */}
                    <div className="flex justify-end pt-5 border-t mt-5">
                        <button type="button" className="px-4 py-2 text-gray-900 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-150 me-3" onClick={onClose}>닫기</button>
                        <button type="button" className="px-4 py-2 text-gray-900 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition duration-150 shadow-md" onClick={handleSave}>저장</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupEditModal;
