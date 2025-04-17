"use client";

import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import Link from "next/link";
import PasswordInput from "@/components/PasswordInput";

export default function LoginPage() {
    const { login, loading, error } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [localError, setLocalError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        const { success, error } = await login(email, password);
        if (success) {
            // ロック解除成功状態を削除
            localStorage.removeItem("pageUnlocked");
        } else {
            setLocalError(error || "ログインに失敗しました");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-6 bg-gray-100">
            <div className="w-full max-w-md p-6 bg-white border border-gray-200 rounded-lg shadow-md">
                <h1 className="text-2xl font-semibold text-gray-800 mb-6 text-center">ログイン</h1>
                {localError && <p className="text-red-500 mb-4">{localError}</p>}
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">メールアドレス:</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>
                    
                    <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} />

                    <div className="text-center">
                        <button 
                            type="submit" 
                            className="w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600"
                            disabled={loading}
                        >
                            {loading ? "ログイン中..." : "ログイン"}
                        </button>
                    </div>
                </form>
                <div className="text-center mt-4">
                    <Link href="/register" className="text-sm text-blue-500 hover:underline">
                        新規登録はこちら
                    </Link>
                </div>
                <div className="text-center mt-2">
                    <Link href="/password-reset" className="text-sm text-blue-500 hover:underline">
                        パスワードをお忘れですか？
                    </Link>
                </div>
            </div>
        </div>
    );
}
