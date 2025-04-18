"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Logout from "@/components/Logout";
import { useCompanies } from "@/lib/hooks/useCompanies";

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();
    const [isUnlocked, setIsUnlocked] = useState(false);
    const { fetchMyCompanyType, myCompanyType, setMyCompanyType } = useCompanies();

    useEffect(() => {
        if (typeof window !== "undefined") {
            const unlocked = localStorage.getItem("pageUnlocked") !== null;
            setIsUnlocked(unlocked);
        }
    }, []);

    useEffect(() => {
        const companyTypeFromLocal = localStorage.getItem("company_type");
        if (companyTypeFromLocal) {
            // すでにあるならfetchしなくていい
            setMyCompanyType(companyTypeFromLocal);
            return;
        }
        if (userId) {
            fetchMyCompanyType(userId);
        }
    }, [userId]);

    useEffect(() => {
        const fetchSession = async () => {
            setLoading(true);
            const { data, error } = await supabase.auth.getUser();
            if (error || !data?.user) {
                setUserId(null);
            } else {
                setUserId(data.user.id);
            }
            setLoading(false);
        };

        fetchSession();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUserId(session?.user?.id || null);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (typeof window !== "undefined") {
                const mobile = window.innerWidth <= 768;
                if (mobile) {
                    setIsOpen(false);
                }
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [setIsOpen]);

    // ✅ **スマホの時だけページ遷移でサイドバーを閉じる**
    useEffect(() => {
        if (typeof window !== "undefined" && window.innerWidth <= 768) {
            setIsOpen(false);
        }
    }, [pathname, setIsOpen]);

    if (loading) {
        return <div></div>;
    }

    return (
        <>
            {/* サイドバー切り替えボタン */}
            <button
                type="button"
                title="sidebarChange"
                className="fixed top-4 left-4 z-40 p-2 bg-gray-700 text-white rounded-lg"
                onClick={() => setIsOpen(!isOpen)}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* スマホ時にオーバーレイを表示 */}
            {isOpen && window.innerWidth <= 768 && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* サイドバー本体 */}
            <aside
                className={`fixed top-0 left-0 transform ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                } w-64 p-6 bg-gray-800 text-white min-h-screen transition-transform duration-300 ease-in-out z-30`}
            >
                <h1 className="text-xl font-bold mt-16 mb-6">点検システム</h1>
                <div className="text-sm mb-4 text-yellow-500">{myCompanyType ? `${myCompanyType}として利用中` : ""}</div>
                {userId ? (
                    <>
                        <nav className="mb-8">
                            <ul>
                                <NavItem icon="🏠" label="ホーム" href="/" />
                                {myCompanyType === "協力会社" &&
                                    <>
                                        <NavItem icon="📝" label="検査記録作成" href="/inspection_records/new" />
                                        <NavItem icon="👷" label="検査者管理" href="/inspectors" />
                                        <NavItem icon="📋" label="検査記録管理" href="/inspection_records" />
                                    </>
                                }
                                {myCompanyType === "管理会社" &&
                                    <>
                                        <NavItem icon="📍" label="現場管理" href="/sites" />
                                        <NavItem icon="🚪" label="シャッター管理" href="/shutters" />
                                        <NavItem icon="📋" label="検査記録管理" href="/inspection_records" />
                                    </>
                                }

                                {/* <NavItem icon={!myCompanyType || isUnlocked ? "🔓" : "🔒"} label="設定" href="/profile" /> */}
                                <NavItem icon="⚙️" label="設定" href="/profile" />
                            </ul>
                        </nav>
                        <Logout />
                    </>
                ) : (
                    <>
                        <p className="text-gray-400">ログインしてください</p>
                    </>
                )}
            </aside>
        </>
    );
};

const NavItem = ({ icon, label, href }: { icon: string; label: string; href: string }) => (
    <li className="mb-3 rounded hover:bg-gray-700">
        <Link href={href} className="flex items-center p-3 space-x-2">
            <span>{icon}</span>
            <span>{label}</span>
        </Link>
    </li>
);

export default Sidebar;
