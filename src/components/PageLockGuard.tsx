"use client";
import { useState, useEffect } from "react";
import { Company } from "@/types/company"; // ✅ Company 型のインポート
import { useCompanies } from "@/lib/hooks/useCompanies"; // ✅ useCompaniesのインポート

interface PageLockGuardProps {
    company: Company | null; // ✅ `myCompany` を受け取る
    children: React.ReactNode; // ✅ ブロックしたい中身
}

export default function PageLockGuard({ company, children }: PageLockGuardProps) {
    const [inputPassword, setInputPassword] = useState<string>(""); // ✅ パスワード入力
    const [error, setError] = useState<string>(""); // ✅ エラー管理
    const [isUnlocked, setIsUnlocked] = useState<boolean>(false); // ✅ ロック解除状態
    const { checkPageLockPassword } = useCompanies(); // ✅ パスワード照合関数を使用

    // ✅ ページロード時に `localStorage` から解除状態を確認
    useEffect(() => {
        const unlocked = localStorage.getItem("pageUnlocked");
        if (unlocked === "true") {
            setIsUnlocked(true);
        }
    }, []);

    // ✅ `company === null` ならロックせず即時表示
    if (!company) {
        return <>{children}</>;
    }

    // ✅ アクセス権限がなければロック不要
    if (company.can_access_setting_page) {
        return <>{children}</>;
    }

    // ✅ すでにロック解除済みの場合、ページ表示
    if (isUnlocked) {
        return <>{children}</>;
    }

    // ✅ パスワード送信時の処理
    const handleUnlock = async () => {
        const isValid = await checkPageLockPassword(company.id, inputPassword);
        if (isValid) {
            setIsUnlocked(true);
            localStorage.setItem("pageUnlocked", "true"); // ✅ 正しい場合のみローカルストレージに保存
            window.location.reload();
        } else {
            setError("パスワードが間違っています");
        }
    };

    // 🚫 ブロック画面（パスワード入力用）
    return (
        // <div className="fixed inset-0 sm:ml-64 flex items-center justify-center bg-gray-100">
        //     <div className="bg-white p-6 rounded shadow-lg w-80">
        //         <h2 className="text-lg font-bold mb-4">🔒 ページロック解除</h2>
        //         <input
        //             type="password"
        //             value={inputPassword}
        //             onChange={(e) => setInputPassword(e.target.value)}
        //             className="w-full p-2 border rounded mb-2"
        //             placeholder="パスワードを入力してください"
        //         />
        //         {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        //         <button
        //             onClick={handleUnlock}
        //             className="bg-blue-500 text-white w-full p-2 rounded hover:bg-blue-600"
        //         >
        //             ロック解除
        //         </button>
        //     </div>
        // </div>
        <>{children}</>
    );
}
