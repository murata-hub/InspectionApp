"use client";

import React, { useState, useEffect } from "react";
import InspectionResultOrganizer from "./InspectionResultOrganizer";
import InspectionRecordsHistoryTable from "./InspectionRecordsHistoryTable";
import InspectionRecordsHistoryTableModal from "./InspectionRecordsHistoryTableModal";
import { InspectionRecord } from "@/types/inspection_record";
import { InspectionResult } from "@/types/inspection_result";
import { useCompanies } from "@/lib/hooks/useCompanies";
import { useSites } from "@/lib/hooks/useSites";
import { useShutters } from "@/lib/hooks/useShutters";
import { useInspectors } from "@/lib/hooks/useInspectors";
import { useInspectionRecords } from "@/lib/hooks/useInspectionRecords";
import { useInspectionResults } from "@/lib/hooks/useInspectionResults";
import { inspectionItems } from "@/data/inspectionItems";

const InspectionRecordRegisterForm = ({ onClose }: { onClose: () => void }) => {
    const { createInspectionRecord, fetchInspectionRecords, inspectionRecords } = useInspectionRecords();
    const { createInspectionResult } = useInspectionResults();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [siteId, setSiteId] = useState<string | null>(null);
    const [shutterId, setShutterId] = useState<string | null>(null);
    const { fetchMyCompany, myCompany } = useCompanies();
    const { fetchSites, sites } = useSites();
    const { fetchShutters, shutters } = useShutters();
    const { fetchInspectors, inspectors } = useInspectors();
    const today = new Date().toISOString().split("T")[0];
    const userId = localStorage.getItem("user_id");
    const [formData, setFormData] = useState<InspectionRecord>({
        company_id: userId || "",
        shutter_id: shutterId,
        inspection_date: today, // YYYY-MM-DD
        lead_inspector: "",
        lead_inspector_id: "",
        sub_inspector_1: "",
        sub_inspector_id_1: "",
        sub_inspector_2: "",
        sub_inspector_id_2: "",
        special_note: "",
    });
    const [inspectionResults, setInspectionResults] = useState<InspectionResult[]>(
        inspectionItems.map((item, index) => ({
            company_id: userId || "",
            inspection_record_id: null,
            inspection_number: `No.${index + 1}`,
            main_category: item.main_category,
            sub_category: item.sub_category || "",
            inspection_name: item.inspection_name,
            target_existence: true,
            inspection_result: "no_issue",
            situation_measures: "",
            inspector_number: "1",
            globalIndex: index, // フォーム認識用
        }))
    );

    useEffect(() => {
        const loadData = async () => {
            setLoading(true); // ✅ ローディング開始
            if (userId) {
                await fetchMyCompany(userId);
            }
            await fetchSites();
            await fetchInspectors();
            const site_id = localStorage.getItem("site_id");
            setSiteId(site_id);
            const shutter_id = localStorage.getItem("shutter_id");
            setShutterId(shutter_id);
            setLoading(false); // ✅ すべてのフェッチ後に false
        };
        
        loadData();
    }, []);

    useEffect(() => {
        if (siteId) {
            fetchShutters(undefined, siteId);
        }
    }, [siteId]);

    const handleResultChange = (index: number, updated: Partial<InspectionResult>) => {
        const newResults = [...inspectionResults];
        newResults[index] = { ...newResults[index], ...updated };
        setInspectionResults(newResults);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { id, value, type } = e.target;
    
        setFormData((prev) => ({
            ...prev,
            [id]: type === "checkbox"
                ? (e.target as HTMLInputElement).checked
                : type === "number"
                    ? (value !== "" ? parseInt(value, 10) : null)  // "" のみ null にする
                    : value
        }));
    };

    const handleInspectorChange = (
        e: React.ChangeEvent<HTMLSelectElement>,
        role: "lead" | "sub1" | "sub2"
    ) => {
        const name = e.target.value;
        const selected = inspectors?.find((i) => i.name === name);
        const id = selected?.id || "";
    
        if (role === "lead") {
            setFormData((prev) => ({
                ...prev,
                lead_inspector: name,
                lead_inspector_id: id,
            }));
        } else if (role === "sub1") {
            setFormData((prev) => ({
                ...prev,
                sub_inspector_1: name,
                sub_inspector_id_1: id,
            }));
        } else if (role === "sub2") {
            setFormData((prev) => ({
                ...prev,
                sub_inspector_2: name,
                sub_inspector_id_2: id,
            }));
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (!userId) {
                alert("ユーザーIDが不明です。処理を実行できません。");
            }
            // ✅ サニタイズ処理
            const sanitizedFormData = {
                ...formData,
                company_id: userId,
                shutter_id: shutterId, // ✅ shutterId も登録
            };
            // console.log(sanitizedFormData);

            // ✅ 検査記録の作成
            const createResult = await createInspectionRecord(sanitizedFormData);
    
            if (!createResult.success) {
                throw new Error(`Supabase 登録に失敗: ${createResult.error}`);
            }
    
            // console.log("新規の検査記録を登録しました。");

            // ✅ 登録された検査記録のIDを取得
            const recordId = createResult.data[0].id;

            // console.log(createResult.data[0]);

            // ✅ inspectionResults に inspection_record_id をセット globalIndexは除外
            const resultsToInsert = inspectionResults.map(({ globalIndex, ...result }) => ({
                ...result,
                company_id: userId,
                inspection_record_id: recordId,
            }));            

            // console.log(resultsToInsert);

            // ✅ 検査結果の登録（ループで一括登録）
            const resultPromises = resultsToInsert.map((result) => createInspectionResult(result));

            // ✅ すべての結果を並列処理
            const resultResponses = await Promise.all(resultPromises);

            // ✅ 失敗した結果をチェック
            const failedResults = resultResponses.filter((res) => !res.success);
            if (failedResults.length > 0) {
                console.warn(`⚠️ 一部の検査結果登録に失敗しました (${failedResults.length} 件)。`);
            }

            alert("✅ 検査結果の登録が完了しました。");
            
            // ✅ 成功したらモーダルを閉じる
            onClose();
            window.location.reload();
        } catch (err: any) {
            // console.error("🔴 エラー:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
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
        <div className="">
            {/* モーダル（新規登録） */}
            <InspectionRecordsHistoryTableModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <>
                    <div className="text-xl font-bold mb-4">検査履歴</div>
                    <InspectionRecordsHistoryTable inspectionRecords={inspectionRecords} />
                </>
            </InspectionRecordsHistoryTableModal>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold">検査記録作成</h1>
                {/* <button
                    onClick={async () => {
                        if (siteId && shutterId) {
                            await fetchInspectionRecords(shutterId);
                            setIsModalOpen(true);
                        } else {
                            alert("先に現場とシャッターを選択してください。");
                        }
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    履歴
                </button> */}
            </div>

            {/* ✅ ローディング中はスピナーを表示 */}
            {loading ? (
                <div className="text-center p-6">
                    <p className="text-gray-500">データを読み込み中...</p>
                </div>
            ) : (
                <>
                {!myCompany && (
                    <div className="text-center text-red-500 p-4 border border-red-500 rounded-md mb-2">
                    📂 プロフィール設定がされていません。<br />
                    <a href="/profile" className="text-blue-500 hover:underline">
                        プロフィール設定をする
                    </a>
                </div>
                )}
                {/* ✅ 現場の状態チェック */}
                {loading || sites === undefined ? (
                    <div className="text-center p-4 text-gray-500">現場を読み込み中...</div>
                ) : sites && (sites.length === 0 ? (
                        <div className="text-center text-red-500 p-4 border border-red-500 rounded-md mb-2">
                            📂 現場が登録されていません。
                        </div>
                    ) : (
                        <div className="mb-4">
                            <label className="block font-bold mb-2" htmlFor="site_id">
                                現場<span className="text-red-500">*</span>
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
                {siteId && (loading || shutters === undefined) ? (
                    <div className="text-center p-4 text-gray-500">シャッターを読み込み中...</div>
                ) : siteId && shutters && shutters.length === 0 ? (
                    <div className="text-center text-red-500 p-4 border border-red-500 rounded-md mb-2">
                        📂 シャッターが登録されていません。
                    </div>
                ) : (
                    siteId && (
                        <div className="mb-4">
                            <label className="block font-bold mb-2" htmlFor="shutter_id">
                                シャッター<span className="text-red-500">*</span>
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
                    )
                )}

                {/* ✅ 現場とシャッターが選択されている場合のみフォーム表示 */}
                {sites && sites.length > 0 && shutters && shutters.length > 0 && siteId && shutterId && (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block font-bold mb-2" htmlFor="inspection_date">検査日<span className="text-red-500">*</span></label>
                            <input className="w-full px-4 py-2 border rounded-lg" type="date" id="inspection_date" value={formData.inspection_date} onChange={handleChange} required />
                        </div>

                        {!inspectors || inspectors.length === 0 ? (
                            <div className="text-center text-red-500 p-4 border border-red-500 rounded-md mb-2">
                                📂 検査者が登録されていません。
                            </div>
                        ) : (
                            <>

                                <div className="mb-4">
                                    <label className="block font-bold mb-2" htmlFor="lead_inspector">
                                        代表検査者<span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        className="w-full px-4 py-2 border rounded-lg"
                                        id="lead_inspector"
                                        value={formData.lead_inspector}
                                        onChange={(e) => handleInspectorChange(e, "lead")}
                                        required
                                    >
                                        <option value="">検査者を選択してください</option>
                                        {inspectors.map((inspector) => (
                                            <option key={inspector.id} value={inspector.name}>
                                                {inspector.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label className="block font-bold mb-2" htmlFor="sub_inspector_1">
                                        検査者1
                                    </label>
                                    <select
                                        className="w-full px-4 py-2 border rounded-lg"
                                        id="sub_inspector_1"
                                        value={formData.sub_inspector_1}
                                        onChange={(e) => handleInspectorChange(e, "sub1")}
                                    >
                                        <option value="">検査者を選択してください（任意）</option>
                                        {inspectors.map((inspector) => (
                                        <option key={inspector.id} value={inspector.name}>
                                            {inspector.name}
                                        </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label className="block font-bold mb-2" htmlFor="sub_inspector_2">
                                        検査者2
                                    </label>
                                    <select
                                        className="w-full px-4 py-2 border rounded-lg"
                                        id="sub_inspector_2"
                                        value={formData.sub_inspector_2}
                                        onChange={(e) => handleInspectorChange(e, "sub2")}
                                    >
                                        <option value="">検査者を選択してください（任意）</option>
                                        {inspectors.map((inspector) => (
                                        <option key={inspector.id} value={inspector.name}>
                                            {inspector.name}
                                        </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label className="block font-bold mb-2">
                                        検査項目
                                    </label>
                                    {/* ✅ 大項目・小項目の整理コンポーネント */}
                                    <InspectionResultOrganizer
                                        inspectionResults={inspectionResults}
                                        onResultChange={handleResultChange}
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block font-bold mb-2" htmlFor="special_note">
                                        特記事項
                                    </label>
                                    <textarea
                                        id="special_note"
                                        name="special_note"
                                        className="w-full px-4 py-2 border rounded-lg"
                                        placeholder="特記事項があれば記述"
                                        value={formData.special_note}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700">登録</button>
                                </div>

                            </>
                        )}
                    </form>
                )}
                </>
            )}
        </div>
    );
};

export default InspectionRecordRegisterForm;
