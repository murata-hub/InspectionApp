"use client";

import { Site, siteFields } from "@/types/site";

const SiteData = ({ site }: { site: Site }) => {
    const renderValue = (value: any) => {
        if (typeof value === "boolean") return value ? "✅" : "❌";
        if (value === null || value === undefined || value === "") return "-";
        return value;
    };
    return (
        <div className="overflow-x-auto p-0 sm:p-4 bg-white rounded-lg w-full">
            <h2 className="text-xl font-bold mb-4">{site.name}（現場詳細）</h2>
            <table className="w-full border-collapse border border-gray-300 text-xs">
                <tbody>
                    {siteFields.map((field) => (
                        <tr key={field.id}>
                            <th className="text-left border px-4 py-2 w-1/3 bg-gray-50">{field.label}</th>
                            <td className="border px-4 py-2">{renderValue(site[field.id as keyof Site])}</td>
                        </tr>
                    ))}
                    <tr>
                        <th className="text-left border px-4 py-2 bg-gray-50">更新日時</th>
                        <td className="border px-4 py-2">{site.updated_at?.split("T")[0]}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default SiteData;
