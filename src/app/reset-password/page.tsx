"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import Link from "next/link";
import PasswordInput from "@/components/PasswordInput"; 

export default function ResetPasswordPage() {
    const { updatePassword, loading } = useAuth();
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();

        const { success, error } = await updatePassword(newPassword);

        if (!success) {
            setError(error || "パスワード更新に失敗しました。");
        } else {
            setMessage("パスワードが正常に更新されました。トップページにリダイレクトします。");
            setTimeout(() => {
                router.push("/");
            }, 1000);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-6 bg-gray-100">
            <div className="w-full max-w-md p-6 bg-white border border-gray-200 rounded-lg shadow-md">
                <h1 className="text-2xl font-semibold text-gray-800 mb-6 text-center">新しいパスワードを設定</h1>
                {message && <p className="text-green-500 mb-4">{message}</p>}
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <form onSubmit={handlePasswordReset} className="space-y-4">
                    <PasswordInput
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <div className="text-center">
                        <button 
                            type="submit" 
                            className="w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600"
                            disabled={loading}
                        >
                            {loading ? "更新中..." : "パスワードを更新"}
                        </button>
                    </div>
                </form>
                <div className="text-center mt-4">
                    <Link href="/login" className="text-sm text-blue-500 hover:underline">
                        ログインページへ
                    </Link>
                </div>
            </div>
        </div>
    );
}
