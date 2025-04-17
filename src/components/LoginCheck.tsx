"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth"; // `useAuth()` を利用

// ✅ ユーザーIDの Context 作成
const UserContext = createContext<{ userId: string | null }>({ userId: null });

export function useUser() {
    return useContext(UserContext);
}

export default function LoginCheck({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { getUserId, logout } = useAuth();
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasRedirected, setHasRedirected] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            if (hasRedirected) return; // ✅ 追加：一度リダイレクトしたらもう何もしない
            const uid = await getUserId();
            if (!uid) {
                if (pathname !== "/login") {
                    // console.log("❌ セッションが取得できませんでした");
                    setHasRedirected(true); // ✅ ここで止めるフラグを立てる
                    await logout();
                    router.push("/login");
                }
                setLoading(false);
                return;
            }
            setUserId(uid);
            setLoading(false);
        };
        checkUser();
    }, [getUserId, logout, router, pathname, hasRedirected]); // ✅ hasRedirected を使って二度目以降は止める

    if (loading) {
        return <div className="flex justify-center items-center h-screen">読込中...</div>;
    }

    return (
        <UserContext.Provider value={{ userId }}>
            <div className="p-4 pt-12 md:p-8 md:pt-8">
                {children}
            </div>
        </UserContext.Provider>
    );
}
