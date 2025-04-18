"use client";

import "./globals.css";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/lib/hooks/useAuth";
import { useCompanies } from "@/lib/hooks/useCompanies";


const Layout = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { getUserId } = useAuth();
    const { fetchMyCompanyType, myCompanyType, setMyCompanyType } = useCompanies();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        const companyTypeFromLocal = localStorage.getItem("company_type");
        if (companyTypeFromLocal) {
            // すでにあるならfetchしなくていい
            setMyCompanyType(companyTypeFromLocal);
            setIsLoading(false);
            return;
        }
        const fetchCompanyType = async () => {
            const userId = await getUserId();
            if (!userId) {
                setIsLoading(false);
                router.push("/");
                return;
            }
            await fetchMyCompanyType(userId);
            setIsLoading(false);
        }
        fetchCompanyType();
    }, []);

    useEffect(() => {
        if (myCompanyType) {
            localStorage.setItem("company_type", myCompanyType);
        }
    }, [myCompanyType]);

    return (
        <html lang="ja">
            <body className="bg-gray-100 text-gray-700">
                <div className="flex h-screen relative">
                    {/* サイドバー */}
                    <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

                    {/* メインコンテンツ */}
                    <div 
                        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
                            isSidebarOpen ? "md:ml-64" : "md:ml-0"
                        }`}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center h-screen">読み込み中...</div>
                        ) : (
                        <main className="flex-1 overflow-auto">
                            {children}
                        </main>
                        )}
                    </div>
                </div>
            </body>
        </html>
    );
};

export default Layout;
