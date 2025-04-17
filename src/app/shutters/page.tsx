"use client";

import React, { useState, useEffect } from "react";
import LoginCheck from '@/components/LoginCheck';
import PageLockGuard from "@/components/PageLockGuard";
import ShuttersTable from "@/components/ShuttersTable";
import Modal from "@/components/Modal";
import ShutterRegisterForm from "@/components/ShutterRegisterForm";
import { useSites } from "@/lib/hooks/useSites";
import { useShutters } from "@/lib/hooks/useShutters";
import { useCompanies } from "@/lib/hooks/useCompanies";

const ShuttersPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { fetchSites, sites } = useSites();
    const { fetchShutters, setShutters, shutters, error } = useShutters();
    const [siteId, setSiteId] = useState<string | null>(null);
    const [siteName, setSiteName] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [userCompanyId, setUserCompanyId] = useState<string | null>(null);
    const { fetchMyCompany, myCompany } = useCompanies();

    useEffect(() => {
        const user_id = localStorage.getItem("user_id");
        setUserCompanyId(user_id);
        const siteData = localStorage.getItem("site");
        if (siteData) {
            const site = JSON.parse(siteData);
            setSiteId(site.id);
            setSiteName(site.name);
        }
        fetchSites();
    }, []);

    // userCompanyId の変更時に検査者をフェッチ
    useEffect(() => {
        if (userCompanyId) {
            fetchMyCompany(userCompanyId);
        }
    }, [userCompanyId]);

    useEffect(() => {
        if (siteId) {
            setLoading(true);
            fetchShutters(undefined, siteId).finally(() => setLoading(false));
        }
    }, [siteId]);
    
    const handleSiteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedSiteId = e.target.value;
        const selectedSiteName = sites?.find((site) => site.id === selectedSiteId)?.name || "";
    
        if (selectedSiteId === "") {
            // ✅ 「現場を選択してください」が選ばれたら localStorage を削除
            localStorage.removeItem("site");
            setSiteId(null);
            setSiteName(null);
            
            // ✅ シャッターリストをリセット
            fetchShutters(undefined, "").finally(() => {
                setLoading(false);
                setShutters([]); // ここでリセット
            });
        } else {
            setSiteId(selectedSiteId);
            setSiteName(selectedSiteName);
    
            // ✅ オブジェクト形式で localStorage に保存
            localStorage.setItem(
                "site",
                JSON.stringify({
                    id: selectedSiteId,
                    name: selectedSiteName,
                })
            );
    
            setLoading(true);
            fetchShutters(undefined, selectedSiteId).finally(() => setLoading(false));
        }
    };    
    
    return (
        <LoginCheck>
            <PageLockGuard
                company={myCompany}
            >
                <div className="bg-white p-4 md:p-8 shadow rounded-lg">
                    <div className="sm:flex justify-between items-center mb-4">
                        <h1 className="text-xl font-bold mb-2 sm:mb-0">シャッター 一覧</h1>
                        {/* ✅ セレクトボックスを追加 */}
                        <select
                            title="現場を選択"
                            value={siteId || ""}
                            onChange={handleSiteChange}
                            className="border p-2 rounded-md mb-2 sm:mb-0"
                        >
                            <option value="">現場を選択してください</option>
                            {sites && sites.map((site) => (
                                <option key={site.id} value={site.id}>
                                    {site.name}
                                </option>
                            ))}
                        </select>
                        
                        <button
                            onClick={() => {
                                if (!siteId) {
                                    alert("現場を選択してください。");
                                    return;
                                }
                                setIsModalOpen(true);
                            }}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                            ＋ 新規作成
                        </button>
                    </div>

                    {/* 🔄 ローディング表示 */}
                    {loading && <div className="text-center p-6">🔄 シャッターデータを取得中...</div>}

                    {/* ❌ エラー表示 */}
                    {error && (
                        <div className="text-center text-red-500 p-4 border border-red-500 rounded-md">
                            シャッターデータの取得に失敗しました。<br />
                            <p className="text-xs">{error}</p>
                        </div>
                    )}

                    {/* ✅ シャッター一覧テーブル */}
                    {!loading && !error && siteId && shutters && shutters.length > 0 ? (
                        <ShuttersTable
                            shutters={shutters}
                            siteId={siteId}
                            siteName={siteName}
                        />
                    ) : (
                        !loading && !error && (
                            <div className="text-center p-6">{ siteId && "📂 シャッターデータがありません。"}</div>
                        )
                    )}

                    {/* モーダル（新規登録） */}
                    <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                        <ShutterRegisterForm
                            onClose={() => setIsModalOpen(false)}
                            siteId={siteId || ""}
                            siteName={siteName || ""}
                        />
                    </Modal>
                </div>
            </PageLockGuard>
        </LoginCheck>
    );
};

export default ShuttersPage;
