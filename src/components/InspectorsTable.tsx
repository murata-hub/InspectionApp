"use client";

import React, { useState } from "react";
import Modal from "@/components/Modal";
import { useInspectors } from "@/lib/hooks/useInspectors";
import InspectorData from "@/components/InspectorData";
import InspectorEditForm from "@/components/InspectorEditForm";
import PaginationControls from "@/components/PaginationControls";
import { inspectorAllFields } from "@/types/inspector";

const InspectorsTable = ({ inspectors }) => {
    const { deleteInspector } = useInspectors();
    const [isInspectorModalOpen, setIsInspectorModalOpen] = useState(false);
    const [isInspectorEditModalOpen, setIsInspectorEditModalOpen] = useState(false);
    const [selectedInspector, setSelectedInspector] = useState(null);
    
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageData = inspectors.slice(startIndex, endIndex);
    const totalPages = Math.ceil(inspectors.length / itemsPerPage);

    const inspectorFields = inspectorAllFields.slice(1);

    // ✅ 表示用モーダル表示ハンドラー
    const handleViewRecord = (Record) => {
        setSelectedInspector(Record);
        setIsInspectorModalOpen(true);
    };

    // ✅ 編集用モーダル表示ハンドラー
    const handleViewRecordEdit = (Record) => {
        setSelectedInspector(Record);
        setIsInspectorEditModalOpen(true);
    };

    // ✅ 削除ハンドラー
    const handleDeleteRecord = async (id) => {
        const isConfirmed = confirm("本当にこの検査者を削除しますか？");
        if (!isConfirmed) return;

        try {
            const result = await deleteInspector(id);

            if (result.success) {
                alert("✅ 検査者を削除しました。");
                window.location.reload();
            } else {
                alert(`⚠️ 削除に失敗しました: ${result.error}`);
            }
        } catch (error) {
            // console.error("削除エラー:", error);
            alert("⚠️ 削除時にエラーが発生しました。");
        }
    };

    return (
        <div className="">
            <Modal
                isOpen={isInspectorModalOpen}
                onClose={() => setIsInspectorModalOpen(false)}
            >
                {selectedInspector && (
                    <InspectorData inspector={selectedInspector} />
                )}
            </Modal>
            <Modal
                isOpen={isInspectorEditModalOpen}
                onClose={() => setIsInspectorEditModalOpen(false)}
            >
                {selectedInspector && (
                    <InspectorEditForm
                        editTarget={selectedInspector}
                        onClose={() => setIsInspectorEditModalOpen(false)}
                    />
                )}
            </Modal>
            <div className="flex text-xs md:text-base">
                <table className="border-collapse border border-gray-300 text-center">
                    <thead className="text-gray-700">
                        <tr className="bg-gray-200">
                            <th className="border border-gray-300 px-2 py-1 min-w-[50px] md:min-w-[70px]">番号</th>
                            <th className="border border-gray-300 px-2 py-1 min-w-[50px] md:min-w-[150px]">氏名</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentPageData.map((inspector, index) => (
                            <tr key={inspector.id} className="bg-gray-200">
                                <td className="border border-gray-300 px-0 py-0 h-[100px]">
                                    <div className="w-full h-full flex flex-col">
                                        <div className="border-b border-gray-300 border-dashed text-center px-2 flex-1 flex items-center justify-center">
                                            {(currentPage - 1) * itemsPerPage + index + 1}
                                        </div>
                                        <div className="text-center px-2 flex-1 flex items-center justify-center">
                                            {/* 👀 モーダル表示ボタン */}
                                            <button
                                                onClick={() => handleViewRecord(inspector)}
                                                className="block text-blue-500 hover:text-blue-700 text-lg"
                                                title="表示"
                                            >
                                                👀
                                            </button>
                                            {/* ✏️ 編集ボタン */}
                                            <button
                                                className="block ml-2 text-yellow-500 hover:text-yellow-700 text-lg"
                                                title="編集"
                                                onClick={() => handleViewRecordEdit(inspector)}
                                            >
                                                ✏️
                                            </button>
                                            {/* 🗑️ 削除ボタン */}
                                            <button
                                                className="block ml-2 text-red-500 hover:text-red-700 text-lg"
                                                title="削除"
                                                onClick={() => handleDeleteRecord(inspector.id)}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                </td>

                                <td className="border border-gray-300 px-0 py-0 h-[100px]">
                                    <div className="w-full h-full flex flex-col">
                                        <div className="text-center px-2 flex-1 flex items-center justify-center">
                                            {inspector.name}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                <div className="overflow-y-auto w-full">
                    <table className="w-full border-collapse border border-gray-300 text-center">
                        <thead className="text-gray-700">
                            <tr className="bg-gray-200">
                                {inspectorFields.map((field) => (
                                    <th
                                        key={field.id}
                                        className="border border-gray-300 px-2 py-1 whitespace-nowrap w-auto min-w-[100px] md:min-w-[150px]"
                                    >
                                        {field.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {currentPageData.map((inspector) => (
                                <tr key={inspector.id} className="bg-white">
                                    {inspectorFields.map((field) => {
                                        const value = inspector[field.id];
                                
                                        return (
                                            <td
                                                key={field.id}
                                                className="border border-gray-300 px-2 py-1 h-[100px]"
                                            >
                                                <div className="overflow-hidden line-clamp-3 text-center">
                                                    {typeof value === "boolean"
                                                    ? value
                                                        ? "✅"
                                                        : "❌"
                                                    : value !== undefined && value !== null
                                                        ? String(value)
                                                        : ""}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
            />
        </div>
    );
};

export default InspectorsTable;
