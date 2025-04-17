"use client";

import React, { useState, useEffect } from "react";
import LoginCheck from '@/components/LoginCheck';
import PageLockGuard from "@/components/PageLockGuard";
import InspectionRecordsTable from "@/components/InspectionRecordsTable";
import { useInspectionRecords } from "@/lib/hooks/useInspectionRecords";
import { useSites } from "@/lib/hooks/useSites";
import { useShutters } from "@/lib/hooks/useShutters";
import { useCompanies } from "@/lib/hooks/useCompanies";
import { useCompanyPermissions } from "@/lib/hooks/useCompanyPermissions";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Company } from "@/types/company";

const InspectionRecordsPage = () => {
    const [isNavigating, setIsNavigating] = useState(false);
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const { fetchInspectionRecords, inspectionRecords, error } = useInspectionRecords();

    const [companyId, setCompanyId] = useState<string | null>(null);
    const [siteId, setSiteId] = useState<string | null>(null);
    const [shutterId, setShutterId] = useState<string | null>(null);
    const { fetchSites, sites } = useSites();
    const { fetchShutters, shutters } = useShutters();
    const { fetchMyCompany, myCompany, fetchCompanies, companies } = useCompanies();
    const { fetchMyCompanyPermissions, myCompanyPermissions } = useCompanyPermissions();
    const [permittedCompanies, setPermittedCompanies] = useState<Company>([]);
    const [userCompanyId, setUserCompanyId] = useState<string | null>(null);
    
    useEffect(() => {
        const loadData = async () => {
            setLoading(true); // ✅ ローディング開始
            // ローカルストレージからuserCompanyIdを設定
            const user_id = localStorage.getItem("user_id");
            setUserCompanyId(user_id);
            
            if (user_id) {
                await fetchCompanies(user_id);
                await fetchMyCompanyPermissions(user_id);
            }
            await fetchSites(); // ✅ fetchSites の完了待機
            const site_id = localStorage.getItem("site_id");
            setSiteId(site_id);
            
            if (site_id) {
                await fetchShutters(undefined, site_id); // ✅ シャッターのフェッチ完了待機
            }
    
            const shutter_id = localStorage.getItem("shutter_id");
            setShutterId(shutter_id);
    
            if (shutter_id) {
                await fetchInspectionRecords(shutter_id); // ✅ 検査記録のフェッチ完了待機
            }
            setLoading(false); // ✅ すべてのフェッチ後に false
        };
    
        loadData(); // ✅ 非同期関数の実行
    }, []);
    
    // userCompanyId の変更時に検査者をフェッチ
    useEffect(() => {
        if (userCompanyId) {
            fetchMyCompany(userCompanyId);
        }
    }, [userCompanyId]);

    useEffect(() => {
        if (myCompany?.type === "協力会社") {
            setCompanyId(userCompanyId);
        } else {
            const selected_company_id = localStorage.getItem("selected_company_id")
            if (selected_company_id) {
                setCompanyId(selected_company_id);
            }
        }
    }, [myCompany, userCompanyId]);

    useEffect(() => {
        if (myCompany?.type === "管理会社" && companyId) {
            localStorage.setItem("selected_company_id", companyId);
            fetchSites(undefined, companyId);
        }
    }, [companyId]);

    useEffect(() => {
        if (siteId) {
            fetchShutters(undefined, siteId);
        }
    }, [siteId]);

    useEffect(() => {
        if (shutterId) {
            fetchInspectionRecords(shutterId);
        }
    }, [shutterId]);

    useEffect(() => {
        if (myCompanyPermissions && companies && myCompany) {
            // ✅ 自社が「許可を出した会社 (granter)」かつ承認済みのものだけを対象にする
            const permittedCompanyIds = myCompanyPermissions
                .filter(p => p.granter_company_id === myCompany.id && p.approval)
                .map(p => p.receiver_company_id);
    
            const permittedCompaniesList = companies
                .filter(c => permittedCompanyIds.includes(c.id))
                .map(company => {
                    const permission = myCompanyPermissions.find(
                        p => p.receiver_company_id === company.id && p.granter_company_id === myCompany.id
                    );
                    return {
                        ...company,
                        approval: permission?.approval ?? false
                    };
                });
    
            setPermittedCompanies(permittedCompaniesList);
            // console.log("✅ permittedCompaniesList:", permittedCompaniesList);
        }
    }, [myCompanyPermissions, companies, myCompany]);
    
    // ✅ サイト変更時の関数
    const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCompanyId = e.target.value;
        setCompanyId(selectedCompanyId); // ✅ State を更新
    };

    // ✅ サイト変更時の関数
    const handleSiteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedSiteId = e.target.value;
        setSiteId(selectedSiteId); // ✅ State を更新
        localStorage.setItem("site_id", selectedSiteId); // ✅ localStorage に保存
    };

    // ✅ シャッター変更時の関数
    const handleShutterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedShutterId = e.target.value;
        setShutterId(selectedShutterId); // ✅ State を更新
        localStorage.setItem("shutter_id", selectedShutterId); // ✅ localStorage に保存
    };
    
    return (
        <LoginCheck>
            <PageLockGuard
                company={myCompany}
            >
                {isNavigating && (
                    <LoadingSpinner />
                )}
                <div className="bg-white p-4 md:p-8 shadow rounded-lg">
                    <div className="sm:flex justify-between items-center mb-4">
                        <h1 className="text-xl font-bold mb-2 sm:mb-0">検査記録一覧</h1>

                        {myCompany?.type === "協力会社" &&
                            <button
                                type="button"
                                onClick={() => {
                                    setIsNavigating(true);
                                    router.push("/inspection_records/new");
                                }}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                            >
                                ＋ 新規作成
                            </button>
                        }
                    </div>

                    {/* ✅ 協力会社が登録されていない場合 */}
                    {!loading && myCompany?.type === "管理会社" && (                
                        (!permittedCompanies || permittedCompanies.length === 0) ? (
                            <div className="text-center text-red-500 p-4 border border-red-500 rounded-md mb-2">
                                📂 協力会社が登録されていません。<br />
                                <a href="/companies" className="text-blue-500 hover:underline">
                                    協力会社を登録する
                                </a>
                            </div>
                        ) : (
                            <div className="mb-4">
                                <label className="block font-bold mb-2" htmlFor="company_id">
                                    協力会社選択
                                </label>
                                <select
                                    className="w-full px-4 py-2 border rounded-lg"
                                    id="company_id"
                                    value={companyId || ""}
                                    onChange={handleCompanyChange}
                                    required
                                >
                                    <option value="">協力会社を選択してください</option>
                                    {permittedCompanies.map((company) => (
                                        <option key={company.id} value={company.id}>
                                            {company.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )
                    )}

                    {/* ✅ 現場が登録されていない場合 */}
                    {!loading && companyId && (
                        (!sites || sites.length === 0) ? (
                            <div className="text-center text-red-500 p-4 border border-red-500 rounded-md mb-2">
                                📂 現場が登録されていません。
                            </div>
                        ) : (
                            <div className="mb-4">
                                <label className="block font-bold mb-2" htmlFor="site_id">
                                    現場選択
                                </label>
                                <select
                                    className="w-full px-4 py-2 border rounded-lg"
                                    id="site_id"
                                    value={siteId || ""}
                                    onChange={handleSiteChange}
                                    required
                                >
                                    <option value="">現場を選択してください</option>
                                    {sites.map((site) => (
                                        <option key={site.id} value={site.id}>
                                            {site.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )
                    )}

                    {/* ✅ シャッターが登録されていない場合 */}
                    {!loading && companyId && (
                        (siteId && (!shutters || shutters.length === 0) ? (
                            <div className="text-center text-red-500 p-4 border border-red-500 rounded-md mb-2">
                                📂 シャッターが登録されていません。
                            </div>
                        ) : (
                            siteId && (
                                <>
                                    <div className="mb-4">
                                        <label className="block font-bold mb-2" htmlFor="shutter_id">
                                            シャッター選択
                                        </label>
                                        <select
                                            className="w-full px-4 py-2 border rounded-lg"
                                            id="shutter_id"
                                            value={shutterId || ""}
                                            onChange={handleShutterChange}
                                            required
                                        >
                                            <option value="">シャッターを選択してください</option>
                                            {shutters?.map((shutter) => (
                                                <option key={shutter.id} value={shutter.id}>
                                                    {shutter.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <label className="block font-bold mb-2">
                                        検査記録
                                    </label>
                                    {/* ✅ 検査記録一覧テーブル */}
                                    {!loading && !error && inspectionRecords && inspectionRecords.length > 0 ? (
                                        <InspectionRecordsTable inspectionRecords={inspectionRecords} />
                                    ) : (
                                        !loading && !error && (
                                            <div className="text-center p-6">📂 検査記録データがありません</div>
                                        )
                                    )}
                                </>
                            )
                        )
                    ))}

                    {/* 🔄 ローディング表示 */}
                    {loading && <div className="text-center p-6">🔄 検査記録データを取得中...</div>}

                    {/* ❌ エラー表示 */}
                    {error && (
                        <div className="text-center text-red-500 p-4 border border-red-500 rounded-md">
                            検査記録データの取得に失敗しました。<br />
                            <p className="text-xs">{error}</p>
                        </div>
                    )}
                </div>
            </PageLockGuard>
        </LoginCheck>
    );
};

export default InspectionRecordsPage;
