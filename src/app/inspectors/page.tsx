"use client";

import React, { useState, useEffect } from "react";
import LoginCheck from '@/components/LoginCheck';
import PageLockGuard from "@/components/PageLockGuard";
import InspectorsTable from "@/components/InspectorsTable";
import Modal from "@/components/Modal";
import InspectorRegisterForm from "@/components/InspectorRegisterForm";
import { useInspectors } from "@/lib/hooks/useInspectors";
import { useCompanies } from "@/lib/hooks/useCompanies";

const InspectorsPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const { fetchInspectors, inspectors, loading, error } = useInspectors();
    const { fetchMyCompany, myCompany } = useCompanies();
    const [userCompanyId, setUserCompanyId] = useState<string | null>(null);
    
    useEffect(() => {
        // ローカルストレージからuserCompanyIdを設定
        const user_id = localStorage.getItem("user_id");
        setUserCompanyId(user_id);
    }, []);

    // userCompanyId の変更時に検査者をフェッチ
    useEffect(() => {
        if (userCompanyId) {
            fetchMyCompany(userCompanyId);
            fetchInspectors(undefined, userCompanyId);
        }
    }, [userCompanyId]);

    return (
        <LoginCheck>
            <PageLockGuard
                company={myCompany}
            >
                <div className="bg-white p-4 md:p-8 shadow rounded-lg">
                    <div className="sm:flex justify-between items-center mb-4">
                        <h1 className="text-xl font-bold mb-2 sm:mb-0">検査者一覧</h1>
                        
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                            ＋ 新規作成
                        </button>
                    </div>

                    {/* 🔄 ローディング表示 */}
                    {loading && <div className="text-center p-6">🔄 検査者データを取得中...</div>}

                    {/* ❌ エラー表示 */}
                    {error && (
                        <div className="text-center text-red-500 p-4 border border-red-500 rounded-md">
                            検査者データの取得に失敗しました。<br />
                            <p className="text-xs">{error}</p>
                        </div>
                    )}

                    {/* ✅ 検査者一覧テーブル */}
                    {!loading && !error && inspectors && inspectors.length > 0 ? (
                        <InspectorsTable inspectors={inspectors} />
                    ) : (
                        !loading && !error && (
                            <div className="text-center p-6">📂 検査者データがありません。</div>
                        )
                    )}

                    {/* モーダル（新規登録） */}
                    <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                        <InspectorRegisterForm onClose={() => setIsModalOpen(false)} />
                    </Modal>
                </div>
            </PageLockGuard>
        </LoginCheck>
    );
};

export default InspectorsPage;
