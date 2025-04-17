"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useInspectors } from "@/lib/hooks/useInspectors";
import InspectorCheckbox from "./InspectorCheckbox"; // ✅ 新コンポーネントをインポート

const InspectorsSelection = ({ selectedCompanies, selectedInspectors, setSelectedInspectors, companyId }) => {
    const { fetchInspectors, inspectors, loading } = useInspectors();
    const [ownInspectors, setOwnInspectors] = useState([]);
    const [companyInspectors, setCompanyInspectors] = useState({});
    // ✅ 会社の ID リストだけを useMemo で計算
    const selectedCompanyIds = useMemo(() => selectedCompanies.map(c => c.id), [selectedCompanies]);

    // ✅ 自社検査者 & フリー検査者を取得
    useEffect(() => {
        if (!companyId || ownInspectors.length > 0) return; // すでに取得済みなら実行しない
    
        const fetchAllInspectors = async () => {
            const companyInspectorsData = await fetchInspectors(null, companyId);
            setOwnInspectors(companyInspectorsData || []);
        };
    
        fetchAllInspectors();
    }, [companyId]); // ✅ `companyId` の変更時のみ実行
    

    // ✅ 選択された会社の検査者を取得 & 削除
    useEffect(() => {
        if (selectedCompanies.length === 0) {
            setCompanyInspectors({});
            return;
        }

        const fetchCompanyInspectors = async () => {
            const newCompanyInspectors = {};

            for (const company of selectedCompanies) {
                if (!company.id) continue;
                const companyInspectorsData = await fetchInspectors(null, company.id);
                newCompanyInspectors[company.id] = companyInspectorsData || [];
            }

            setCompanyInspectors(newCompanyInspectors);
        };

        fetchCompanyInspectors();
    }, [selectedCompanyIds]);

    // ✅ `selectedCompanies` から削除された会社のデータを `companyInspectors` から除去
    useEffect(() => {
        setCompanyInspectors((prev) => {
            const updatedCompanyInspectors = {};
            
            // `selectedCompanies` に含まれる会社だけを残す
            selectedCompanies.forEach(company => {
                if (prev[company.id]) {
                    updatedCompanyInspectors[company.id] = prev[company.id];
                }
            });

            return updatedCompanyInspectors;
        });
    }, [selectedCompanyIds]);

    // ✅ 検査者の選択・解除
    const toggleInspectorSelection = (inspector) => {
        setSelectedInspectors((prev) => {
            const isSelected = prev.some((w) => w.id === inspector.id);
            if (isSelected) {
                return prev.filter((w) => w.id !== inspector.id); // 選択解除
            } else {
                return [...prev, { id: inspector.id, name: inspector.name, shift: "" }]; // 追加
            }
        });
    };

    // ✅ シフトの変更
    const updateInspectorShift = (inspectorId, shift) => {
        setSelectedInspectors((prev) =>
            prev.map((w) => w.id === inspectorId ? { ...w, shift } : w)
        );
    };

    return (
        <div className="mb-4">    
            <h2 className="text-lg font-bold mb-2">検査者選択</h2>

            {/* 🔄 ローディング中の表示 */}
            {loading && <></>}

            {/* ✅ 自社の検査者 */}
            {ownInspectors.length > 0 ? (
                <>
                    <h3 className="font-semibold mb-2">自社の検査者<span className="text-red-500">*</span></h3>
                    <div className="border rounded-lg p-4 mb-2">
                        {ownInspectors.map((inspector, index) => (
                            <InspectorCheckbox
                                key={inspector.id}
                                inspector={inspector}
                                selectedInspectors={selectedInspectors}
                                toggleInspectorSelection={toggleInspectorSelection}
                                updateInspectorShift={updateInspectorShift}
                                isLast={index === ownInspectors.length - 1}
                            />
                        ))}
                    </div>
                </>
            ) : 
                <div className="text-center text-red-500 p-4 border border-red-500 rounded-md mb-2">
                    📂 自社の検査者が登録されていません。<br />
                    <a href="/inspectors" className="text-blue-500 hover:underline">検査者を登録する</a>
                </div>
            }

            {/* ✅ 協力会社の検査者 */}
            {Object.keys(companyInspectors).map((companyId) => {
                const company = selectedCompanies.find(c => c.id === companyId);
                const hasViewInspectorsPermission = company?.approval; // 検査者閲覧許可があるか
                const hasRole = company?.role; // 役割が選択されているか
                const hasManager = company?.manager; // 現場代理人名が選択されているか

                return (
                    <div key={companyId}>
                        <h3 className="font-semibold mb-2">{company?.name} の検査者</h3>

                        {/* 許可がない場合にエラーメッセージを表示 */}
                        {!hasViewInspectorsPermission ? (
                            <div className="text-center text-red-500 p-4 border border-red-500 rounded-md">
                                🚫 {company?.name} の検査者を閲覧する権限がありません。
                                プロフィールページからの設定を依頼してください。
                            </div>
                        ) : companyInspectors[companyId]?.length === 0 ? (
                            <div className="text-center text-red-500 p-4 border border-red-500 rounded-md">
                                📂 {company?.name} の検査者が登録されていません。
                                必要であれば検査者登録を依頼してください。
                            </div>
                        ) : !hasManager ? (
                            <div className="text-center text-red-500 p-4 border border-red-500 rounded-md">
                                📂 {company?.name} の現場代理人名を記入してください。
                            </div>
                        ) : !hasRole ? (
                            <div className="text-center text-red-500 p-4 border border-red-500 rounded-md">
                                📂 {company?.name} の役割を選択してください。
                            </div>
                        ) : (
                            <div className="border rounded-lg p-4 mb-2">
                                {companyInspectors[companyId].map((inspector, index) => (
                                    <InspectorCheckbox
                                        key={inspector.id}
                                        inspector={inspector}
                                        selectedInspectors={selectedInspectors}
                                        toggleInspectorSelection={toggleInspectorSelection}
                                        updateInspectorShift={updateInspectorShift}
                                        isLast={index === companyInspectors[companyId].length - 1}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default InspectorsSelection;
