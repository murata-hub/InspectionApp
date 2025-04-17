import React from "react";
import { InspectionResult } from "@/types/inspection_result";

type Props = {
    index: number;
    result: InspectionResult;
    onChange: (index: number, updated: Partial<InspectionResult>) => void;
};

const InspectionResultRegisterForm: React.FC<Props> = ({ index, result, onChange }) => {
    // ✅ 入力変更時のハンドラー
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type, checked } = e.target;

        // ✅ ラジオボタンまたはチェックボックスの処理
        const updatedValue = type === "checkbox" ? checked : value;
        onChange(index, { [name]: updatedValue });
    };

    return (
        <div className="bg-white p-4 mb-4">
            {/* ✅ 検査事項名 */}
            <div className="font-semibold mb-4">{result.inspection_name}</div>

            {/* ✅ 対象の有無 */}
            <div className="mb-4">
                <label className="flex items-center">
                    <span className="mr-2 font-bold">🔸  対象の有無</span>
                    <input
                        type="checkbox"
                        name="target_existence"
                        checked={!!result.target_existence}
                        onChange={handleInputChange}
                    />
                </label>
            </div>

            {/* ✅ 検査結果 3択 (ラジオボタン) */}
            <div className="mb-4">
                <div className="sm:flex gap-4">
                    <label className="block font-bold">🔸  検査結果</label>
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name={`inspection_result-${index}`}
                            value="no_issue"
                            checked={result.inspection_result === "no_issue"}
                            onChange={() => onChange(index, { inspection_result: "no_issue" })}
                        />
                        <span className="ml-2">指摘なし</span>
                    </label>

                    <label className="flex items-center">
                        <input
                            type="radio"
                            name={`inspection_result-${index}`}
                            value="needs_correction"
                            checked={result.inspection_result === "needs_correction"}
                            onChange={() => onChange(index, { inspection_result: "needs_correction" })}
                        />
                        <span className="ml-2">要是正</span>
                    </label>

                    <label className="flex items-center">
                        <input
                            type="radio"
                            name={`inspection_result-${index}`}
                            value="alert"
                            checked={result.inspection_result === "alert"}
                            onChange={() => onChange(index, { inspection_result: "alert" })}
                        />
                        <span className="ml-2">今後注意</span>
                    </label>

                    <label className="flex items-center">
                        <input
                            type="radio"
                            name={`inspection_result-${index}`}
                            value="existing_non_compliance"
                            checked={result.inspection_result === "existing_non_compliance"}
                            onChange={() => onChange(index, { inspection_result: "existing_non_compliance" })}
                        />
                        <span className="ml-2">既存不適格</span>
                    </label>
                </div>
            </div>

            {/* ✅ 状況・対策 & 担当検査者番号 横並び */}
            <div className="flex gap-4 mt-4">
                <div className="w-1/2">
                    <label className="block font-bold mb-2">🔸  状況、対策等</label>
                    <textarea
                        name="situation_measures"
                        className="w-full p-2 border rounded"
                        placeholder="状況、対策等"
                        value={result.situation_measures || ""}
                        onChange={handleInputChange}
                    />
                </div>

                {/* ✅ 担当検査者番号 */}
                <div className="w-1/2">
                    <label className="block font-bold mb-2">🔸  担当検査者番号</label>
                    <input
                        type="text"
                        name="inspector_number"
                        className="w-full px-4 py-2 border rounded"
                        placeholder="担当検査者番号を入力"
                        value={result.inspector_number || ""}
                        onChange={handleInputChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default InspectionResultRegisterForm;
