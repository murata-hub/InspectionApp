"use client";

import React, { useState, useEffect } from "react";
import InspectionResultEditOrganizer from "./InspectionResultEditOrganizer";
import { InspectionRecord, inspectionRecordShutterFields } from "@/types/inspection_record";
import { InspectionResult } from "@/types/inspection_result";
import { useInspectors } from "@/lib/hooks/useInspectors";
import { useCompanies } from "@/lib/hooks/useCompanies";
import { useInspectionRecords } from "@/lib/hooks/useInspectionRecords";
import { useInspectionResults } from "@/lib/hooks/useInspectionResults";
import { inspectionItems } from "@/data/inspectionItems";
import InputField from "@/components/InputField";

const InspectionRecordEditForm = ({ onClose, inspectionRecord }: { onClose: () => void; inspectionRecord: InspectionRecord; }) => {
    const { updateInspectionRecord } = useInspectionRecords();
    const { fetchInspectionResults, setInspectionResults, inspectionResults, updateInspectionResult } = useInspectionResults();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
    const { fetchMyCompany, myCompany } = useCompanies();
    const { fetchInspectors, inspectors } = useInspectors();
    const userId = localStorage.getItem("user_id");
    const [formData, setFormData] = useState<InspectionRecord>({
        company_id: userId || "",
        shutter_id: "",
        inspection_date: "",
        lead_inspector: "",
        lead_inspector_id: "",
        sub_inspector_1: "",
        sub_inspector_id_1: "",
        sub_inspector_2: "",
        sub_inspector_id_2: "",
        special_note: "",
        model_number: "",
        width: "",
        height: "",
        usage_count: 0,
        installation_location: "",
    });
    const [originalResults, setOriginalResults] = useState<InspectionResult[]>([]);
    const [editResults, setEditResults] = useState<InspectionResult[]>([]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true); // ✅ ローディング開始
            if (userId) {
                await fetchMyCompany(userId);
            }
            await fetchInspectors();
            if (inspectionRecord.id) {
                fetchInspectionResults(inspectionRecord.id);
            }
            setLoading(false); // ✅ すべてのフェッチ後に false
        };
        loadData();
    }, []);

    useEffect(() => {
        setFormData(inspectionRecord);
    }, [inspectionRecord]);

    useEffect(() => {
        if (inspectionResults && inspectionResults.length > 0) {
            const sortedResults = sortInspectionResults(inspectionResults);
            // ✅ originalResults にデータ保存
            setOriginalResults(sortedResults);
            // ✅ 編集用にコピーしたデータをセット
            setEditResults([...sortedResults]);
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

    const handleResultChange = (index: number, updated: Partial<InspectionResult>) => {
        const newResults = [...editResults];
        newResults[index] = { ...newResults[index], ...updated };
    
        // ✅ 変更後の結果を並び替え
        const sortedResults = sortInspectionResults(newResults);
    
        // ✅ 変更があった場合のみセット
        if (JSON.stringify(sortedResults) !== JSON.stringify(editResults)) {
            setEditResults(sortedResults);
        }
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

        // 🔍 入力バリデーションチェック
        const newErrors: { [key: string]: string | null } = {};
        let hasError = false;

        inspectionRecordShutterFields.forEach((field) => {
            const value = formData[field.id as keyof InspectionRecord]?.toString() || "";
            const isValid = field.validation ? field.validation(value) : true;

            if (!isValid) {
                newErrors[field.id] = `${field.label}の形式が正しくありません。`;
                hasError = true;
            } else {
                newErrors[field.id] = null;
            }
        });
        setErrors(newErrors);

        if (hasError) {
            setLoading(false);
            alert("入力形式が正しくないものがあります。ご確認ください。");
            return;
        }

        try {
            // console.log(formData);

            if (!inspectionRecord.id) {
                return;
            }

            // ✅ 検査記録の作成
            const updateResult = await updateInspectionRecord(inspectionRecord.id ,formData);
    
            if (!updateResult.success) {
                throw new Error(`Supabase 登録に失敗: ${updateResult.error}`);
            }

            // console.log(updateResult.data[0]);

            // ✅ 変更があった inspectionResults だけを抽出
            const changedResults = editResults.filter((result, index) => {
                return JSON.stringify(result) !== JSON.stringify(originalResults[index]);
            });

            // console.log(changedResults);

            // ✅ 変更があった結果だけ更新
            const resultPromises = changedResults.map((result) => {
                if (result.id) {
                    // ✅ result.id がある場合は更新
                    return updateInspectionResult(result.id, result);
                } else {
                    // ✅ result.id がない場合は新規作成（例外処理）
                    console.warn(`⚠️ result.id が存在しない検査結果があります: ${result}`);
                    return { success: false, error: "result.id が見つかりません" };
                }
            });

            // ✅ すべての結果を並列処理
            const resultResponses = await Promise.all(resultPromises);
            // console.log(resultResponses);

            // ✅ 失敗した結果をチェック
            const failedResults = resultResponses.filter((res) => !res.success);
            if (failedResults.length > 0) {
                console.warn(`⚠️ 一部の検査結果登録に失敗しました (${failedResults.length} 件)。`);
            }

            alert("✅ 検査記録と検査結果の更新が完了しました。");
            
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

    return (
        <div className="">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">検査記録編集</h1>
            </div>

            {/* ✅ 現場とシャッターが選択されている場合のみフォーム表示 */}
            <form onSubmit={handleSubmit}>
                {inspectionRecordShutterFields.map((field) => (
                    <InputField
                        key={field.id}
                        id={field.id}
                        label={field.label}
                        value={formData[field.id as keyof InspectionRecord] as string | number | boolean ?? ""}
                        type={field.type || "text"}
                        required={field.required}
                        onChange={handleChange}
                        error={errors[field.id] || undefined}
                    />
                ))}

                <div className="mb-4">
                    <label className="block font-bold mb-2" htmlFor="inspection_date">検査日<span className="text-red-500">*</span></label>
                    <input className="w-full px-4 py-2 border rounded-lg" type="date" id="inspection_date" value={formData.inspection_date} onChange={handleChange} required />
                </div>

                {!inspectors || inspectors.length === 0 ? (
                    <div className="text-center text-red-500 p-4 border border-red-500 rounded-md mb-2">
                        📂 検査者が登録されていません。<br />
                        {myCompany?.type === "協力会社" && 
                            <a href="/inspectors" className="text-blue-500 hover:underline">
                                検査者を登録する
                            </a>
                        }
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
                            { inspectionResults && inspectionResults.length > 0 ? (
                                <InspectionResultEditOrganizer
                                    inspectionResults={editResults}
                                    onResultChange={handleResultChange}
                                />
                            ) : (
                                <p>データが登録されていません。再度作成してください。</p>
                            )}
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
                            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700">更新</button>
                        </div>

                    </>
                )}
            </form>
        </div>
    );
};

export default InspectionRecordEditForm;
