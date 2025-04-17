"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useCompanies } from "@/lib/hooks/useCompanies";

export function useAuth() {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();
    const { fetchMyCompanyType } = useCompanies();

    // ✅ ページロード時にセッションを取得
    useEffect(() => {
        const fetchSession = async () => {
            setLoading(true);
            const { data, error } = await supabase.auth.getUser();
            if (error || !data?.user) {
                localStorage.removeItem("user_id");
                setUser(null);
            } else {
                localStorage.setItem("user_id", data.user.id);
                setUser(data.user);
            }
            setLoading(false);
        };

        fetchSession();
    }, []);

    // ✅ ユーザーID取得関数
    const getUserId = async () => {
        if (user) return user.id;

        const storedUserId = localStorage.getItem("user_id");
        if (storedUserId) {
            return storedUserId; // キャッシュがあればそれを返す
        }

        const { data, error } = await supabase.auth.getUser();
        if (error || !data?.user) {
            localStorage.removeItem("user_id");
            return null;
        }

        localStorage.setItem("user_id", data.user.id);
        setUser(data.user);
        return data.user.id;
    };

    // ✅ ユーザー登録
    const register = async (email: string, password: string) => {
        setLoading(true);
        setError(null);

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
        if (!passwordRegex.test(password)) {
            setLoading(false);
            setError("パスワードは8文字以上で、大文字、小文字、数字を含める必要があります。");
            return { success: false, error: "パスワードの要件を満たしていません。" };
        }

        try {
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error) throw error;
            return { success: true, user: data.user };
        } catch (error: any) {
            setError(error.message);
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    // ✅ ユーザーログイン
    const login = async (email: string, password: string) => {
        localStorage.removeItem("user_id");
        localStorage.removeItem("company_type");
        localStorage.removeItem("site");
        localStorage.removeItem("site_id");
        localStorage.removeItem("shutter_id");
        localStorage.removeItem("selected_company_id");
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            if (!data.user?.confirmed_at) {
                throw new Error("メールアドレスが確認されていません。");
            }

            // 🔹 ローカルストレージに保存
            localStorage.setItem("user_id", data.user.id);
            setUser(data.user);

            // 一応会社タイプも取得
            const myCompanyType = await fetchMyCompanyType(data.user.id);
            if (myCompanyType) {
                localStorage.setItem("company_type", myCompanyType);
            }
            // 🔹 ルートへリダイレクト
            router.push("/");
            return { success: true, user: data.user };
        } catch (error: any) {
            setError(error.message);
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    // ✅ ユーザーログアウト
    const logout = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
    
            localStorage.removeItem("user_id");
            localStorage.removeItem("company_type");
            localStorage.removeItem("site");
            localStorage.removeItem("site_id");
            localStorage.removeItem("shutter_id");
            localStorage.removeItem("selected_company_id");
            setUser(null);
            return { success: true };
        } catch (error: any) {
            setError(error.message);
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };
    

    // ✅ パスワードリセットリンク送信
    const requestPasswordReset = async (email: string) => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${process.env.NEXT_PUBLIC_REDIRECT_URL}/reset-password`,
            });
            if (error) throw error;
            return { success: true, message: "パスワードリセットのリンクを送信しました。" };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    // ✅ パスワード更新
    const updatePassword = async (newPassword: string) => {
        try {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
            if (!passwordRegex.test(newPassword)) {
                throw new Error("パスワードは8文字以上で、大文字、小文字、数字を含める必要があります。");
            }

            // 🔹 Supabase では `access_token` を渡さなくても動く
            const { error } = await supabase.auth.updateUser({ password: newPassword });

            if (error) throw error;

            // 🔹 ユーザー情報を取得して localStorage にセット
            const { data, error: userError } = await supabase.auth.getUser();
            if (!userError && data?.user) {
                localStorage.setItem("user_id", data.user.id);
                setUser(data.user);
            }

            return { success: true, message: "パスワードが正常に更新されました。" };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    // ✅ ユーザーセッション取得
    const getSession = async () => {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error || !user) throw new Error("ユーザー情報の取得に失敗しました。");
            return { success: true, user };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    return { 
        register, 
        login, 
        logout,
        requestPasswordReset, 
        updatePassword, 
        getSession, 
        getUserId, 
        loading, 
        error 
    };
}
