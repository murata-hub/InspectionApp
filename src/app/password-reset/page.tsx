"use client";

import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import LoadingSpinner from "@/components/LoadingSpinner";
import Link from "next/link";

export default function PasswordResetPage() {
    const { requestPasswordReset, loading } = useAuth();
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setMessage("");

        const { success, error, message } = await requestPasswordReset(email);

        if (!success) {
            setError(error || "パスワードリセットに失敗しました");
        } else {
            setMessage(message || "リセットリンクを送信しました");
        }
    };

    return (
        <div>
            {loading && <LoadingSpinner />}
            <div className="flex min-h-screen items-center justify-center p-6 bg-gray-100">
                <div className="w-full max-w-md p-6 bg-white border border-gray-200 rounded-lg shadow-md">
                    <h1 className="text-2xl font-semibold text-gray-800 mb-6 text-center">パスワードリセット</h1>
                    {message && <p className="text-green-500 mb-4">{message}</p>}
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    <form onSubmit={handlePasswordReset} className="space-y-4">
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
                        <div className="text-center">
                            <button 
                                type="submit" 
                                className="w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600"
                                disabled={loading}
                            >
                                {loading ? "送信中..." : "リセットリンクを送信"}
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
        </div>
    );
}
