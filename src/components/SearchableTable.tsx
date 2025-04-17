"use client";

import React, { useState } from "react";

const SearchableTable = ({
    headers,
    data,
}: {
    headers: string[];
    data: string[][];
}) => {
    const [searchTerm, setSearchTerm] = useState("");

    // 検索キーワードに一致するデータをフィルタリング
    const filteredData = data.filter((row) =>
        row.some((cell) => cell.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div>
            {/* 検索バー */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="🔍 検索..."
                    className="p-2 border rounded-full w-full shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="w-full overflow-x-auto">
                {/* テーブル */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-100">
                            <tr className="">
                                {headers.map((head, index) => (
                                    <th
                                        key={index}
                                        className={`p-4 text-gray-700 bg-gray-200 min-w-[150px] ${
                                            index === 0 ? "sticky left-0 bg-gray-200 z-10" :
                                            index === 1 ? "sticky left-[150px] bg-gray-200 z-10" :
                                            index === headers.length-1 ? "sticky right-0 bg-gray-200 z-10" :
                                            ""
                                        }`}
                                    >
                                        {head}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length > 0 ? (
                                filteredData.map((row, rowIndex) => (
                                    <tr key={rowIndex} className="border-b">
                                        {row.map((cell, cellIndex) => (
                                            <td
                                                key={cellIndex}
                                                className={`p-4 min-w-[150px] ${
                                                    cellIndex === 0 ? "sticky left-0 bg-white z-10" :
                                                    cellIndex === 1 ? "sticky left-[150px] bg-white z-10" :
                                                    ""
                                                }`}
                                            >
                                                {cell}
                                            </td>
                                        ))}
                                        <td className="p-4 min-w-[100px] sticky right-0 bg-white z-10">✏️ 🗑️</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={headers.length} className="p-4 text-center text-gray-500">
                                        該当するデータがありません
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SearchableTable;
