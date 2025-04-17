"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoginCheck from "@/components/LoginCheck";
import LoadingSpinner from "@/components/LoadingSpinner";

const HomePage = () => {
    const [companyType, setCompanyType] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const type = localStorage.getItem("company_type");
        setCompanyType(type);
    }, []);

    const handleNavigation = (href: string) => {
        setLoading(true);
        router.push(href);
    };

    const Card = ({ href, icon, title }: { href: string; icon: string; title: string }) => (
        <button
            onClick={() => handleNavigation(href)}
            className="flex flex-col items-center justify-center p-6 w-full sm:w-48 h-40 bg-white rounded-2xl shadow hover:shadow-lg hover:bg-blue-50 transition duration-300"
        >
            <div className="text-4xl mb-2">{icon}</div>
            <div className="text-center font-semibold">{title}</div>
        </button>
    );

    return (
        <LoginCheck>
            {loading && (
                <LoadingSpinner />
            )}

            <div className="p-4 md:p-8">
                <h1 className="text-2xl font-bold mb-12 text-center">点検システム ホーム</h1>
                <div className="flex flex-wrap gap-4 justify-center">
                    {companyType === "協力会社" && (
                        <>
                            <Card href="/inspection_records/new" icon="📝" title="検査記録作成" />
                            <Card href="/inspectors" icon="👷" title="検査者管理" />
                            <Card href="/inspection_records" icon="📋" title="検査記録管理" />
                        </>
                    )}

                    {companyType === "管理会社" && (
                        <>
                            <Card href="/sites" icon="📍" title="現場管理" />
                            <Card href="/shutters" icon="🚪" title="シャッター管理" />
                            <Card href="/inspection_records" icon="📋" title="検査記録管理" />
                        </>
                    )}

                    <Card href="/profile" icon="⚙️" title="設定" />
                </div>
            </div>
        </LoginCheck>
    );
};

export default HomePage;
