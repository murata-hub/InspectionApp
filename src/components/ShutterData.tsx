"use client";

import React from "react";
import { Shutter, shutterFields } from "@/types/shutter";

const ShutterData = ({ shutter }: { shutter: Shutter }) => {
    const splitShutterFields = shutterFields.map(field => ({
        ...field,
        label: field.label.split("（")[0],
    }));  

    const renderValue = (value: any) => {
        if (typeof value === "boolean") return value ? "✅" : "❌";
        if (value === null || value === undefined || value === "") return "-";
        if (typeof value === "string" && value.includes("T")) return value.split("T")[0]; // ISO日付対応
        return value;
    };

    return (
        <div className="overflow-x-auto p-0 sm:p-4 bg-white rounded-lg w-full">
            <h2 className="text-xl font-bold mb-4">{shutter.name}（シャッター詳細）</h2>
            <table className="w-full border-collapse border border-gray-300 text-xs">
                <tbody>
                    {splitShutterFields.map((field) => (
                        <tr key={field.id}>
                            <th className="text-left border px-4 py-2 w-1/3 bg-gray-50">{field.label}</th>
                            <td className="border px-4 py-2">{renderValue(shutter[field.id as keyof Shutter])}</td>
                        </tr>
                    ))}
                    <tr>
                        <th className="text-left border px-4 py-2 bg-gray-50">更新日時</th>
                        <td className="border px-4 py-2">{shutter.updated_at?.split("T")[0]}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default ShutterData;
