"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth"; // useAuth フックを利用

export default function Logout() {
    const router = useRouter();
    const { logout } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        const { success, error } = await logout();

        if (success) {
            // alert("ログアウトしました。");
        } else {
            // console.error("ログアウト中にエラーが発生しました:", error);
        }
    };

    // ✅ ログアウト後に自動的にログインページへリダイレクト
    useEffect(() => {
        if (isLoggingOut) {
            router.push("/login");
        }
    }, [isLoggingOut, router]);

    return (
        <button
            onClick={handleLogout}
            className="bg-red-500 text-white cursor-pointer p-2 rounded-lg"
            disabled={isLoggingOut}
        >
            ログアウト
        </button>
    );
}
