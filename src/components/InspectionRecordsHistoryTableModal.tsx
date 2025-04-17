"use client";

import React from "react";

const InspectionRecordsHistoryTableModal = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => {
    if (!isOpen) return null;

    // 背景クリックで閉じる処理
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
            if (e.target === e.currentTarget) {
                    onClose();
            }
    };

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40"
            onClick={handleOverlayClick}
        >
            <div className="bg-white rounded-lg shadow-lg w-[95%] md:w-[90%] h-full relative">
                {/* 固定する✖ボタン */}
                <div className="absolute top-0 right-0 z-50">
                    <button onClick={onClose} className="text-gray-600 hover:text-gray-900 p-2">
                        ✖
                    </button>
                </div>
                {/* スクロール可能なコンテンツ領域 */}
                <div className="p-6 max-h-[90vh] overflow-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default InspectionRecordsHistoryTableModal;
