"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import { useSites } from "@/lib/hooks/useSites";
import SiteData from "@/components/SiteData";
import SiteEditForm from "@/components/SiteEditForm";
import PaginationControls from "@/components/PaginationControls";
import { useSiteCompanies } from "@/lib/hooks/useSiteCompanies";
import { siteFields } from "@/types/site";

const SitesTable = ({ sites, company, permittedCompanies }) => {
    const { fetchSiteCompanies, siteCompanies } = useSiteCompanies();
    const [siteData, setSiteData] = useState([]);
    const [isSiteModalOpen, setIsSiteModalOpen] = useState(false);
    const [isSiteEditModalOpen, setIsSiteEditModalOpen] = useState(false);
    const [selectedSite, setSelectedSite] = useState(null);
    const { deleteSite } = useSites();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageData = siteData.slice(startIndex, endIndex);
    const totalPages = Math.ceil(siteData.length / itemsPerPage);


    // 初回マウント時に `fetchSiteCompanies` を実行
    useEffect(() => {
        if (sites.length > 0) {
            sites.forEach((site) => {
                fetchSiteCompanies(site.id);
            });
        }
    }, [sites]);

    // `siteCompanies` の変更を監視し、`siteData` を更新
    useEffect(() => {
        if (!siteCompanies) return;
    
        const updatedSites = sites.map((site) => {
            const companies = siteCompanies.filter(c => c.site_id === site.id);
    
            // `role` を数値化してソート（管理会社は除外）
            const sortedCompanies = companies;
    
            return { ...site, site_companies: sortedCompanies };
        });
    
        setSiteData(updatedSites);
    }, [siteCompanies, sites]);

    // ✅ 表示用モーダル表示ハンドラー
    const handleViewRecord = (Record) => {
        setSelectedSite(Record);
        setIsSiteModalOpen(true);
    };

    // ✅ 編集用モーダル表示ハンドラー
    const handleViewRecordEdit = (Record) => {
        setSelectedSite(Record);
        setIsSiteEditModalOpen(true);
    };

    // ✅ 削除ハンドラー
    const handleDeleteRecord = async (id) => {
        const isConfirmed = confirm("本当にこの現場を削除しますか？");
        if (!isConfirmed) return;

        try {
            const result = await deleteSite(id);

            if (result.success) {
                alert("✅ 現場を削除しました。");
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
                isOpen={isSiteModalOpen}
                onClose={() => setIsSiteModalOpen(false)}
            >
                {selectedSite && (
                    <SiteData site={selectedSite} />
                )}
            </Modal>
            <Modal
                isOpen={isSiteEditModalOpen}
                onClose={() => setIsSiteEditModalOpen(false)}
            >
                {selectedSite && (
                    <SiteEditForm
                        site={selectedSite}
                        company={company}
                        permittedCompanies={permittedCompanies}
                        onClose={() => setIsSiteEditModalOpen(false)}
                    />
                )}
            </Modal>
            <div className="flex text-xs md:text-base">
                <table className="border-collapse border border-gray-300 text-center">
                    <thead className="text-gray-700">
                        <tr className="bg-gray-200">
                            <th className="border border-gray-300 px-2 py-1 min-w-[50px] md:min-w-[70px]">番号</th>
                            <th className="border border-gray-300 px-0 py-0 min-w-[100px] md:min-w-[150px]">現場名</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentPageData.map((site, index) => (
                            <tr key={site.id} className="bg-gray-200">
                                <td className="border border-gray-300 px-0 py-0 h-[100px]">
                                    <div className="w-full h-full flex flex-col">
                                        <div className="border-b border-gray-300 border-dashed text-center px-2 flex-1 flex items-center justify-center">
                                            {(currentPage - 1) * itemsPerPage + index + 1}
                                        </div>
                                        <div className="text-center px-2 flex-1 flex items-center justify-center">
                                            {/* 👀 モーダル表示ボタン */}
                                            <button
                                                onClick={() => handleViewRecord(site)}
                                                className="block text-blue-500 hover:text-blue-700 text-lg"
                                                title="表示"
                                            >
                                                👀
                                            </button>
                                            {/* ✏️ 編集ボタン */}
                                            <button
                                                className="block ml-2 text-yellow-500 hover:text-yellow-700 text-lg"
                                                title="編集"
                                                onClick={() => handleViewRecordEdit(site)}
                                            >
                                                ✏️
                                            </button>
                                            {/* 🗑️ 削除ボタン */}
                                            <button
                                                className="block ml-2 text-red-500 hover:text-red-700 text-lg"
                                                title="削除"
                                                onClick={() => handleDeleteRecord(site.id)}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                </td>
                                <td className="border border-gray-300 px-0 py-0 h-[100px]">
                                    <div className="overflow-hidden line-clamp-3">{site.name}</div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                <div className="overflow-y-auto w-full">
                    <table className="w-full border-collapse border border-gray-300 text-center">
                        <thead className="text-gray-700">
                            <tr className="bg-gray-200">
                                {siteFields.map((field) => (
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
                            {currentPageData.map((site) => (
                                <tr key={site.id} className="bg-white">
                                    {siteFields.map((field) => {
                                        const value = site[field.id];
                                
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

export default SitesTable;
