"use client";

import React, { useState, useEffect } from "react";
import InspectionResultRegisterForm from "./InspectionResultRegisterForm";
import { InspectionResult } from "@/types/inspection_result";

type Props = {
    inspectionResults: InspectionResult[];
    onResultChange: (index: number, updated: Partial<InspectionResult>) => void;
};

const InspectionResultOrganizer: React.FC<Props> = ({ inspectionResults, onResultChange }) => {
    const [expandedMain, setExpandedMain] = useState<string | null>(null);
    const [expandedSub, setExpandedSub] = useState<string | null>(null);

    // ✅ 大項目ごとに小項目をグループ化
    const groupedByMain = inspectionResults.reduce((acc, item) => {
        if (!item.main_category) return acc;
        if (!acc[item.main_category]) {
            acc[item.main_category] = {};
        }
        if (item.sub_category) {
            if (!acc[item.main_category][item.sub_category]) {
                acc[item.main_category][item.sub_category] = [];
            }
            acc[item.main_category][item.sub_category].push(item);
        } else {
            if (!acc[item.main_category]["_no_sub"]) {
                acc[item.main_category]["_no_sub"] = [];
            }
            acc[item.main_category]["_no_sub"].push(item);
        }
        return acc;
    }, {} as { [main: string]: { [sub: string]: InspectionResult[] } });

    // ✅ 大項目の展開・閉じる
    const toggleMainCategory = (main: string) => {
        // ✅ すでに開いている場合は閉じる
        if (expandedMain === main) {
            setExpandedMain(null);
            setExpandedSub(null); // サブもリセット
            return;
        }

        // ✅ 小項目なし（_no_sub）の場合は自動展開
        if (groupedByMain[main]["_no_sub"]) {
            setExpandedMain(main);
            setExpandedSub("_no_sub"); // 小項目なしを即展開
        } else {
            setExpandedMain(main);
            setExpandedSub(null); // サブリセット
        }
    };


    // ✅ 小項目の展開・閉じる
    const toggleSubCategory = (sub: string) => {
        setExpandedSub(expandedSub === sub ? null : sub);
    };

    return (
        <div className="mb-6">
            {/* ✅ 大項目のリスト */}
            {Object.keys(groupedByMain).map((main, index) => (
                <div key={index} className="mb-4 border-b border-gray-300">
                    {/* ✅ 大項目ボタン */}
                    <button
                        type="button"
                        onClick={() => toggleMainCategory(main)}
                        className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 font-bold"
                    >
                        {main}
                    </button>

                    {/* ✅ 小項目のリスト or 小項目なしの場合は即時表示 */}
                    {expandedMain === main && (
                        <div className="pl-4 bg-gray-50">
                            {Object.keys(groupedByMain[main]).map((sub, subIndex) => (
                                <div key={subIndex} className="mb-2">
                                    {/* ✅ 小項目ボタン（小項目がある場合のみ） */}
                                    {sub !== "_no_sub" ? (
                                        <button
                                            type="button"
                                            onClick={() => toggleSubCategory(sub)}
                                            className="w-full text-left px-4 py-2 bg-gray-200 hover:bg-gray-300"
                                        >
                                            {sub}
                                        </button>
                                    ) : null}

                                    {/* ✅ 小項目なし or 小項目選択時 */}
                                    {(sub === "_no_sub" || expandedSub === sub) && (
                                        <div className="bg-gray-100">
                                            {groupedByMain[main][sub].map((result, resultIndex) => (
                                                <InspectionResultRegisterForm
                                                    key={result.globalIndex}
                                                    index={result.globalIndex} // ✅ グローバルインデックスを渡す！
                                                    result={result}
                                                    onChange={onResultChange}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}

            {/* ✅ 該当項目がない場合 */}
            {Object.keys(groupedByMain).length === 0 && (
                <p className="text-gray-500">該当する検査項目がありません。</p>
            )}
        </div>
    );
};

export default InspectionResultOrganizer;
