"use client";

import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import LoadingSpinner from "@/components/LoadingSpinner";
import Link from "next/link";
import PasswordInput from "@/components/PasswordInput";

export default function RegisterPage() {
    const { register, loading } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        const { success, error } = await register(email, password);

        if (!success) {
            setError(error || "登録に失敗しました");
        } else {
            setSuccess("登録が成功しました！確認メールを送信しましたので、メールを確認してください。");
        }
    };

    return (
        <div>
            {loading && <LoadingSpinner />}
            <div className="flex min-h-screen items-center justify-center p-6 bg-gray-100">
                <div className="w-full max-w-md p-6 bg-white border border-gray-200 rounded-lg shadow-md">
                    <h1 className="text-2xl font-semibold text-gray-800 mb-6 text-center">登録</h1>
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    {success && <p className="text-green-500 mb-4">{success}</p>}
                    {!success && (
                        <>
                        <form onSubmit={handleRegister} className="space-y-4 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">メールアドレス:</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="メールアドレスを入力してください"
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
                                    {loading ? "登録中..." : "登録"}
                                </button>
                            </div>
                        </form>
                        <div className="text-center mt-4">
                            <Link href="/login" className="text-sm text-blue-500 hover:underline">
                                ログインページへ
                            </Link>
                        </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
