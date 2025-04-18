"use client";

import React, { useState, useEffect } from "react";
import { InspectionRecord } from "@/types/inspection_record";
import { InspectionResult } from "@/types/inspection_result";
import { useInspectionResults } from "@/lib/hooks/useInspectionResults";
import { inspectionItems } from "@/data/inspectionItems";
import { useSites } from "@/lib/hooks/useSites";
import { useShutters } from "@/lib/hooks/useShutters";
import { useInspectors } from "@/lib/hooks/useInspectors";
import LoadingSpinner from "@/components/LoadingSpinner";

const InspectionRecordData = ({ inspectionRecord, showExcelButton }: { inspectionRecord: InspectionRecord; showExcelButton: boolean; }) => {
    const { fetchInspectionResults, inspectionResults, error } = useInspectionResults();
    const [loading, setLoading] = useState<boolean>(true);
    const [isExporting, setExporting] = useState(false);
    const [originalResults, setOriginalResults] = useState<InspectionResult[]>([]);
    const [companyType, setCompanyType] = useState<string | null>(null);
    const { fetchSites, sites } = useSites();
    const { fetchShutters, shutters } = useShutters();
    const { fetchInspectorsByIds } = useInspectors();

    useEffect(() => {
        const type = localStorage.getItem("company_type");
        setCompanyType(type);
    }, []);

    // 西暦→和暦変換関数
    function convertToJapaneseEra(date: Date): { era: string, year: number, month: number, day: number } {
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // 0-indexed
        const day = date.getDate();

        if (year >= 2019) {
            return { era: "令和", year: year - 2018, month, day };
        } else if (year >= 1989) {
            return { era: "平成", year: year - 1988, month, day };
        } else if (year >= 1926) {
            return { era: "昭和", year: year - 1925, month, day };
        } else {
            return { era: "不明", year, month, day };
        }
    }
    
    const handleExportToExcel = async () => {
        setExporting(true);
        try {
            console.log("🚀 Export Start");
            if (sites?.length && shutters?.length) {
                const ids: string[] = [inspectionRecord.lead_inspector_id];
                if (inspectionRecord.sub_inspector_id_1) {
                    ids.push(inspectionRecord.sub_inspector_id_1);
                }
                const inspectors = await fetchInspectorsByIds(ids);
                console.log("🕵️‍♂️ Inspectors:", inspectors);
                if (inspectors?.length) {
                    const lead_inspector = inspectors[0];
                    const sub_inspector = inspectors[1] || null;
                    const site: any = sites[0];
                    const shutter = shutters[0];
                    // ✅ 今日
                    const today = new Date();
                    const today_year = today.getFullYear();
                    const today_month = today.getMonth() + 1;
                    const today_day = today.getDate();
                    
                    // エクセルに利用するデータを整形
                    const excelJson = {
                        sheet1: {
                            inspection_record: inspectionRecord,
                            inspection_results: inspectionResults,
                            shutter: shutter,
                        },
                        sheet2: {
                            date: {
                                today_yaer: today_year,
                                today_month: today_month,
                                today_day: today_day
                            },
                            lead_inspector: lead_inspector,
                            sub_inspector: sub_inspector || null,
                            site: site
                        }
                    }
                    // ✅ site.confirmation_certificate_date
                    if (site.confirmation_certificate_date) {
                        const confirmationDate = new Date(site.confirmation_certificate_date);
                        const {
                            era: confirmation_certificate_era,
                            year: confirmation_certificate_year,
                            month: confirmation_certificate_month,
                            day: confirmation_certificate_day
                        } = convertToJapaneseEra(confirmationDate);
                        excelJson.sheet2.site.confirmation_certificate_era = confirmation_certificate_era;
                        excelJson.sheet2.site.confirmation_certificate_year = confirmation_certificate_year;
                        excelJson.sheet2.site.confirmation_certificate_month = confirmation_certificate_month;
                        excelJson.sheet2.site.confirmation_certificate_day = confirmation_certificate_day;
                    }

                    // ✅ site.inspection_certificate_date
                    if (site.inspection_certificate_date) {
                        const inspectionDate = new Date(site.inspection_certificate_date);
                        const {
                            era: inspection_certificate_era,
                            year: inspection_certificate_year,
                            month: inspection_certificate_month,
                            day: inspection_certificate_day
                        } = convertToJapaneseEra(inspectionDate);
                        excelJson.sheet2.site.inspection_certificate_era = inspection_certificate_era;
                        excelJson.sheet2.site.inspection_certificate_year = inspection_certificate_year;
                        excelJson.sheet2.site.inspection_certificate_month = inspection_certificate_month;
                        excelJson.sheet2.site.inspection_certificate_day = inspection_certificate_day;
                    }

                    console.log("📦 JSON to send:", JSON.stringify(excelJson, null, 2));

                    // const res = await fetch("/api/excel-export", {
                    //     method: "POST",
                    //     headers: { "Content-Type": "application/json" },
                    //     body: JSON.stringify(excelJson),
                    // });
                    // supabaseのエンドポイントとキーを取得
                    const apiInfoRes = await fetch("/api/excel-export");
                    if (!apiInfoRes.ok) throw new Error("API情報の取得に失敗しました");

                    const { supabaseEdgeUrl, supabaseAnonKey } = await apiInfoRes.json();
                                        
                    // ✅ Edge Function 経由で Lambda 呼び出し フロントエンドから実行する
                    console.log(supabaseEdgeUrl);
                    const res = await fetch(supabaseEdgeUrl, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${supabaseAnonKey}`,
                        },
                        body: JSON.stringify(excelJson),
                    });

                    console.log("📡 Response status:", res.status);

                    if (!res.ok) throw new Error("エクスポート失敗");

                    const { download_url } = await res.json();
                    console.log("📥 Download URL:", download_url);

                    // 🔽 ダイアログでユーザーに確認
                    const confirmed = window.confirm("Excelファイルへのデータ入力に成功しました。ダウンロードしますか？");
                        if (confirmed) {
                        const link = document.createElement("a");
                        link.href = download_url;
                        link.download = "inspection_report.xlsx";
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                    }
                }
            }
        } catch (err) {
            // console.error("Excel出力エラー:", err);
            alert("Excel出力に失敗しました。");
        } finally {
            setExporting(false);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            if (inspectionRecord.id) {
                await fetchInspectionResults(inspectionRecord.id);
                setLoading(false);
            }
            const siteId = localStorage.getItem("site_id");
            if (siteId) {
                await fetchSites(siteId);
                const shutterId = localStorage.getItem("shutter_id");
                if (siteId && shutterId) {
                    await fetchShutters(shutterId);
                }
            }
        };

        loadData();
    }, [inspectionRecord.id]);

    useEffect(() => {
        if (inspectionResults && inspectionResults.length > 0) {
            const sortedResults = sortInspectionResults(inspectionResults);
            // ✅ originalResults にデータ保存
            setOriginalResults(sortedResults);
        }
    }, [inspectionResults]);
    

    const sortInspectionResults = (results: InspectionResult[]) => {
        const itemOrder = inspectionItems.map((item) => item.inspection_name);
    
        return results.slice().sort((a, b) => {
            const indexA = itemOrder.indexOf(a.inspection_name);
            const indexB = itemOrder.indexOf(b.inspection_name);
            return indexA - indexB;
        });
    };    

    if (loading) {
        return <div className="text-center p-4">🔄 データを読み込み中...</div>;
    }

    if (error) {
        return (
            <div className="text-center text-red-500 p-4 border border-red-500 rounded-md">
                検査結果の取得に失敗しました。<br />
                <p className="text-xs">{error}</p>
            </div>
        );
    }

    if (!inspectionResults || inspectionResults.length === 0) {
        return <div className="text-center p-4">📂 検査結果がありません</div>;
    }

    return (
        <div className="overflow-x-auto p-0 sm:p-4 bg-white rounded-lg w-full">
            {isExporting && (
                <LoadingSpinner />
            )}
            <h2 className="text-xl font-bold mb-4">検査記録データ</h2>
            {/* Excelファイル出力ボタン */}
            {showExcelButton && companyType ==="管理会社" &&
                <button
                    className="p-2 bg-green-500 text-white rounded-lg shadow-sm hover:bg-green-600 min-w-[120px]"
                    onClick={handleExportToExcel}
                >
                    📂 Excel出力
                </button>
            }
            <table className="w-full border-collapse border border-gray-300 text-xs mt-4">
                <tbody>
                    <tr className="bg-gray-100">
                        <th className="border px-4 py-2 text-left w-1/4">点検日</th>
                        <td className="border px-4 py-2 w-1/4">{inspectionRecord.inspection_date}</td>
                    </tr>
                    <tr>
                        <th className="border px-4 py-2 text-left">代表検査者</th>
                        <td className="border px-4 py-2">{inspectionRecord.lead_inspector}</td>
                    </tr>
                    <tr>
                        <th className="border px-4 py-2 text-left">その他の検査者1</th>
                        <td className="border px-4 py-2">{inspectionRecord.sub_inspector_1 || "-"}</td>
                    </tr>
                    <tr>
                        <th className="border px-4 py-2 text-left">その他の検査者2</th>
                        <td className="border px-4 py-2">{inspectionRecord.sub_inspector_2 || "-"}</td>
                    </tr>
                </tbody>
            </table>

            <table className="w-full border-collapse border border-gray-300 text-xs mt-4">
                <tbody>
                    <tr className="bg-gray-100">
                        <th className="border px-4 py-2 text-left w-1/4">シャッター名（符号）</th>
                        <td className="border px-4 py-2 w-3/4">{shutters?.[0]?.name || "-"}</td>
                    </tr>
                    <tr>
                        <th className="border px-4 py-2 text-left">機種</th>
                        <td className="border px-4 py-2">{shutters?.[0]?.model_number || "-"}</td>
                    </tr>
                    <tr>
                        <th className="border px-4 py-2 text-left">幅</th>
                        <td className="border px-4 py-2">{shutters?.[0]?.width || "-"}</td>
                    </tr>
                    <tr>
                        <th className="border px-4 py-2 text-left">高さ</th>
                        <td className="border px-4 py-2">{shutters?.[0]?.height || "-"}</td>
                    </tr>
                    <tr>
                        <th className="border px-4 py-2 text-left">使用回数</th>
                        <td className="border px-4 py-2">{shutters?.[0]?.usage_count ?? "-"}</td>
                    </tr>
                    <tr>
                        <th className="border px-4 py-2 text-left">設置場所</th>
                        <td className="border px-4 py-2">{shutters?.[0]?.installation_location || "-"}</td>
                    </tr>
                </tbody>
            </table>

            <table className="w-full border-collapse border border-gray-300 text-xs mt-4">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border px-4 py-2  min-w-[50px] md:min-w-[50px]">番号</th>
                        <th className="border px-4 py-2  min-w-[100px] md:min-w-[150px]">検査大項目</th>
                        <th className="border px-4 py-2  min-w-[100px] md:min-w-[150px]">検査小項目</th>
                        <th className="border px-4 py-2  min-w-[100px] md:min-w-[150px]">検査事項名</th>
                        <th className="border px-4 py-2  min-w-[100px] md:min-w-[150px]">対象の有無</th>
                        <th className="border px-4 py-2  min-w-[100px] md:min-w-[150px]">検査結果</th>
                        <th className="border px-4 py-2  min-w-[100px] md:min-w-[150px]">状況・対策</th>
                        <th className="border px-4 py-2  min-w-[100px] md:min-w-[150px]">担当検査者</th>
                    </tr>
                </thead>
                <tbody>
                    {originalResults.map((result: InspectionResult) => (
                        <tr key={result.id} className="hover:bg-gray-50">
                            <td className="border px-4 py-2">{result.inspection_number}</td>
                            <td className="border px-4 py-2">{result.main_category}</td>
                            <td className="border px-4 py-2">{result.sub_category || "-"}</td>
                            <td className="border px-4 py-2">{result.inspection_name}</td>
                            <td className="border px-4 py-2">
                                {result.target_existence ? "✅" : "❌"}
                            </td>
                            <td className="border px-4 py-2">
                                {getResultLabel(result.inspection_result)}
                            </td>
                            <td className="border px-4 py-2">{result.situation_measures || "-"}</td>
                            <td className="border px-4 py-2">{result.inspector_number}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <p className="mt-4 text-xs"><span className="font-bold">特記事項:</span> {inspectionRecord.special_note || "なし"}</p>
        </div>
    );
};

// ✅ 検査結果の表示ラベルを取得
const getResultLabel = (result: string) => {
    switch (result) {
        case "no_issue":
            return "✅ 指摘なし";
        case "needs_correction":
            return "⚠️ 要是正";
        case "alert":
            return "👀 今後注意";
        case "existing_non_compliance":
            return "❗️ 既存不適格";
        default:
            return "❓ 不明";
    }
};

export default InspectionRecordData;
