import React, { useState, useEffect } from 'react';

const GroupEditModal = ({ show, group, onSave, onClose }) => {
    const [editedGroup, setEditedGroup] = useState(group);
    
    useEffect(() => {
        if (show) {
            setEditedGroup(group);
        }
    }, [show, group]);

    if (!show) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedGroup(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const modalStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999
    };

    return (
        <div style={modalStyle}>
            <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-4">스터디 그룹 수정</h2>

                {/* 그룹명 */}
                <label className="block mb-3">
                    <span className="text-sm text-gray-700">그룹명</span>
                    <input
                        type="text"
                        name="title"
                        value={editedGroup.title}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded p-2"
                    />
                </label>

                {/* 설명 */}
                <label className="block mb-3">
                    <span className="text-sm text-gray-700">설명</span>
                    <textarea
                        name="description"
                        value={editedGroup.description || ""}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded p-2"
                    />
                </label>

                {/* 카테고리 */}
                <label className="block mb-3">
                    <span className="text-sm text-gray-700">카테고리</span>
                    <input
                        type="text"
                        name="category"
                        value={editedGroup.category}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded p-2"
                    />
                </label>

                {/* 최대 인원 */}
                <label className="block mb-3">
                    <span className="text-sm text-gray-700">최대 인원</span>
                    <input
                        type="number"
                        name="max_members"
                        value={editedGroup.max_members}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded p-2"
                    />
                </label>

                {/* 위치 좌표 */}
                <div className="flex gap-3 mb-3">
                    <label className="flex-1">
                        <span className="text-sm text-gray-700">위도 (latitude)</span>
                        <input
                            type="number"
                            name="latitude"
                            value={editedGroup.latitude || ""}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded p-2"
                        />
                    </label>

                    <label className="flex-1">
                        <span className="text-sm text-gray-700">경도 (longitude)</span>
                        <input
                            type="number"
                            name="longitude"
                            value={editedGroup.longitude || ""}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded p-2"
                        />
                    </label>
                </div>

                {/* 버튼 */}
                <div className="flex justify-end gap-3 mt-4">
                    <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>
                        닫기
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                        onClick={() => onSave(editedGroup)}
                    >
                        저장
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GroupEditModal;
