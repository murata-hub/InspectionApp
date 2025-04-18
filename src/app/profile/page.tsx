"use client";

import { useEffect, useState } from "react";
import LoginCheck from "@/components/LoginCheck";
import PageLockGuard from "@/components/PageLockGuard";
import { useCompanies } from "@/lib/hooks/useCompanies";
import { useCompanyPermissions } from "@/lib/hooks/useCompanyPermissions";
import { Company } from "@/types/company";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function ProfilePage() {
    const [form, setForm] = useState({
        id: "",
        name: "",
        representative_name: "",
        type: "",
        can_access_setting_page: false,
        page_lock_password: ""
    } as Company);

    const [copied, setCopied] = useState(false);

    const [isRegistered, setIsRegistered] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({}); // ✅ エラーメッセージ管理

    const [userCompanyId, setUserCompanyId] = useState<string | null>(null);
    // ✅ パスワードの表示/非表示トグル状態
    const [showPassword, setShowPassword] = useState(false);
    // ✅ パスワード変更フラグ
    const [isEditingPassword, setIsEditingPassword] = useState<boolean>(false);
    const [granterCompanyId, setGranterCompanyId] = useState("");

    type CompanyInfo = {
        id: string;
        name?: string;
    };
    // ✅ オブジェクトの配列として初期化
    const [approvedCompanies, setApprovedCompanies] = useState<CompanyInfo[]>([]);
    const [pendingCompanies, setPendingCompanies] = useState<CompanyInfo[]>([]);

    const { fetchMyCompany, createCompany, updateCompany, myCompany, loading } = useCompanies();
    const { fetchMyCompanyPermissions, createCompanyPermission, updateCompanyPermission, deleteCompanyPermission, myCompanyPermissions } = useCompanyPermissions();

    useEffect(() => {
        const user_id = localStorage.getItem("user_id") || "";
        if (!user_id) {
            // console.error("❌ ユーザーIDが見つかりません。");
            // alert("ユーザーIDが見つかりません。");
            setIsLoading(false);
            return;
        }
        setUserCompanyId(user_id);

        setForm((prev) => ({ ...prev, id: user_id }));

        fetchMyCompany(user_id);

        fetchMyCompanyPermissions(user_id);
        setIsLoading(false);
    }, [userCompanyId]);

    useEffect(() => {
        if (myCompany) {
            setForm((prev) => ({
                ...prev,
                ...myCompany,
            }));
            setIsRegistered(true);
        }
    }, [myCompany]);

    useEffect(() => {
        if (myCompanyPermissions && myCompany) {

            let approved = [] as CompanyInfo[];
            let pending = [] as CompanyInfo[];
    
            if (myCompany.type === "管理会社") {
                // ✅ 管理会社の場合: granter_company_id でフィルタ
                approved = myCompanyPermissions
                    .filter((p) => p.approval && p.granter_company_id === myCompany.id)
                    .map((p) => ({
                        id: p.receiver_company_id,
                        name: p.receiver_company_name,
                    }));
    
                pending = myCompanyPermissions
                    .filter((p) => !p.approval && p.granter_company_id === myCompany.id)
                    .map((p) => ({
                        id: p.receiver_company_id,
                        name: p.receiver_company_name,
                    }));
            } else if (myCompany.type === "協力会社") {
                // ✅ 協力会社の場合: receiver_company_id でフィルタ
                approved = myCompanyPermissions
                    .filter((p) => p.approval && p.receiver_company_id === myCompany.id)
                    .map((p) => ({
                        id: p.granter_company_id,
                        name: p.granter_company_name,
                    }));
    
                pending = myCompanyPermissions
                    .filter((p) => !p.approval && p.receiver_company_id === myCompany.id)
                    .map((p) => ({
                        id: p.granter_company_id,
                        name: p.granter_company_name,
                    }));
            }
    
            setApprovedCompanies(approved);
            setPendingCompanies(pending);
        }
    }, [myCompanyPermissions, myCompany]);    
    

    // ✅ **バリデーション関数**
    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!form.name.trim()) newErrors.name = "会社名を入力してください。";
        if (!form.representative_name.trim()) newErrors.representative_name = "代表者名を入力してください。";
        if (!form.type?.trim()) newErrors.type = "契約形態を選択してください。";
        // ✅ 協力会社の場合、選択された会社があるか確認
        if (form.type === "協力会社" && !granterCompanyId && !isRegistered) {
            newErrors.granterCompanyId = "管理会社IDを入力してください。";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // ✅ エラーがなければ true を返す
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // console.log(form);

        if (!validateForm()) {
            alert("必須項目を入力してください。");
            return;
        }

        // console.log("📤 送信データ:", form);
        const action = isRegistered ? updateCompany : createCompany;

        // ✅ パスワードが空の場合、更新データから除外
        const updatedData = { ...form };
        if (isRegistered && !form.page_lock_password) {
            delete updatedData.page_lock_password;
        }

        try {
            const { success, error } = isRegistered ? await action(form.id, updatedData) : await action(form);

            if (!success) {
                throw new Error(error || "エラーが発生しました");
            }
            localStorage.setItem("company_type", form.type);

            // 会社登録後にパーミッションを処理
            if (form.type === "協力会社") {
                await handlePermissionsUpdate(form.id, granterCompanyId, form.name);
            }

            alert("登録/更新が成功しました！");
            window.location.reload(); // サイドバー更新のためページリロード
        } catch (error) {
            // console.error("❌ データ送信エラー:", error);
            alert("データの送信に失敗しました。");
        }
    };

    const handlePermissionsUpdate = async (companyId: string, granterCompanyId: string, companyName: string) => {
        // console.log("🔄 協力会社の申請を作成中...");
        if (isRegistered && !granterCompanyId) {
            return;
        }
    
        try {
            // ✅ 新規パーミッション作成（approval: false）
            const { success, error } = await createCompanyPermission({
                granter_company_id: granterCompanyId,
                receiver_company_id: companyId,
                receiver_company_name: companyName,
                approval: false, // 申請中状態
            });
    
            if (!success) {
                throw new Error(error || "申請の作成に失敗しました");
            }
    
            // console.log("✅ 申請が正常に作成されました！");
        } catch (error) {
            // console.error("❌ パーミッション作成エラー:", error);
            alert("管理会社への申請に失敗しました。");
        }
    };

    const approveRequest = async (companyId: string) => {
        // console.log(`✅ ${companyId} の承認を処理中...`);
        try {
            if (myCompanyPermissions && myCompany) {
                // 申請中のパーミッション情報を取得
                const permissionToApprove = myCompanyPermissions.find(
                    (p) => p.receiver_company_id === companyId && !p.approval
                );

                if (!permissionToApprove || !permissionToApprove.id) {
                    alert("承認リクエストが見つかりません。");
                    return;
                }
        
                // ✅ 承認 API コール
                const { success, error } = await updateCompanyPermission(permissionToApprove.id, {
                    approval: true,
                    granter_company_name: myCompany.name
                });
        
                if (!success) {
                    throw new Error(error || "承認に失敗しました。");
                }
        
                alert("✅ 申請を承認しました！");
                window.location.reload(); // サイドバー更新のためページリロード
            }
        } catch (error) {
            // console.error("❌ 承認エラー:", error);
            alert("承認処理に失敗しました。");
        }
    };    

    // ✅ パスワード用のリアルタイムバリデーション関数
    const handlePasswordChange = (value: string) => {
        if (/^[A-Za-z0-9]{6,20}$/.test(value)) {
            setForm({ ...form, page_lock_password: value });
            setErrors({ ...errors, page_lock_password: "" }); // ✅ エラーリセット
        } else {
            setForm({ ...form, page_lock_password: value });
            setErrors({
                ...errors,
                page_lock_password: "半角英数字6〜20文字で入力してください。",
            });
        }
    };

    // ✅ **選択済みの会社を解除**
    const removeApprovedCompany = async (companyId: string, byGranter: boolean) => {
        if (!confirm("本当にこの会社との関連を解除しますか？")) {
            return;
        }
    
        try {
            // ✅ 承認済みのパーミッション情報を取得
            let permissionToDelete;
            if (byGranter) {
                permissionToDelete = myCompanyPermissions?.find(
                    (p) => p.receiver_company_id === companyId && p.approval
                );
            } else {
                permissionToDelete = myCompanyPermissions?.find(
                    (p) => p.granter_company_id === companyId && p.approval
                );
            }
    
            if (!permissionToDelete || !permissionToDelete.id) {
                alert("パーミッションが見つかりませんでした。");
                return;
            }
    
            // ✅ パーミッション削除
            const { success, error } = await deleteCompanyPermission(permissionToDelete.id);
            if (!success) {
                throw new Error(error || "パーミッションの削除に失敗しました。");
            }
    
            alert(`${byGranter ? "承認を解除しました！" : "関連を解除しました！"}`);
            window.location.reload();
        } catch (error) {
            // console.error("❌ 承認解除エラー:", error);
            alert("承認解除に失敗しました。");
        }
    };

    return (
        <LoginCheck>
            <PageLockGuard
                company={myCompany}
            >   
                <div className="bg-white p-4 md:p-8 shadow rounded-lg">
                    <h1 className="text-xl font-bold mb-4">会社プロフィール設定</h1>

                    {isLoading ? (
                        <p className="text-center">🔄 データを取得中...</p>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block font-bold mb-2">会社名<span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                            </div>

                            <div className="mb-4">
                                <label className="block font-bold mb-2">代表者名<span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="representative_name"
                                    value={form.representative_name}
                                    onChange={(e) => setForm({ ...form, representative_name: e.target.value })}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                                {errors.representative_name && <p className="text-red-500 text-sm">{errors.representative_name}</p>}
                            </div>

                            <div className="mb-4">
                                <label className="block font-bold mb-2">利用モード<span className="text-red-500">*</span></label>
                                <select
                                    name="type"
                                    value={form.type}
                                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                                    className="w-full p-2 border rounded"
                                    required
                                >
                                    <option value="">選択してください</option>
                                    <option value="管理会社">管理会社</option>
                                    <option value="協力会社">協力会社</option>
                                </select>
                                {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
                            </div>

                            {form.type === "協力会社" && (
                                <div className="mb-4">
                                    <label className="block font-bold mb-2">
                                        管理会社の設定<span className="text-red-500">*</span>
                                    </label>
                                    {pendingCompanies.length > 0 ? (
                                        // ✅ 申請中の場合の正しい構文
                                        pendingCompanies.map((company) => (
                                            <p key={company.id} className="text-green-500">
                                                会社ID {company.id} の会社に申請中
                                            </p>
                                        ))
                                    ) : (
                                        <>
                                            {approvedCompanies.length === 0 ? (
                                                <div className="flex space-x-2">
                                                    <input
                                                        type="text"
                                                        value={granterCompanyId}
                                                        onChange={(e) => setGranterCompanyId(e.target.value)}
                                                        className="w-full p-2 border rounded"
                                                        placeholder="管理会社の会社IDを入力"
                                                    />
                                                </div>
                                            ) : (
                                                <ul className="mt-2">
                                                    {approvedCompanies.map((company) => (
                                                        <li
                                                            key={company.id}
                                                            className="flex justify-between items-center border p-2 rounded bg-gray-200"
                                                        >
                                                            {company.name}
                                                            <button
                                                                type="button"
                                                                onClick={() => removeApprovedCompany(company.id, false)}
                                                                className="bg-red-500 text-white px-2 py-1 rounded"
                                                            >
                                                                解除
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            {errors.granterCompanyId && <p className="text-red-500 text-sm mb-4">{errors.granterCompanyId}</p>}

                            <div className="mb-4 relative">
                                {/* <div className="flex items-center justify-between">
                                    <label className="block font-bold mb-2">
                                        {isRegistered
                                            ? "設定・管理ページのページロックパスワード（任意変更）"
                                            : <p>設定・管理ページのページロックパスワード<span className="text-red-500">*</span></p>
                                        }
                                    </label>
                                    {isRegistered && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditingPassword(!isEditingPassword);
                                                if (!isEditingPassword) {
                                                    // ✅ 編集開始時に値をリセット
                                                    setForm({ ...form, page_lock_password: "" });
                                                }
                                            }}
                                            className="text-sm text-blue-500 underline"
                                        >
                                            {isEditingPassword ? "キャンセル" : "変更する"}
                                        </button>
                                    )}
                                </div> */}

                                {/* {(!isRegistered || isEditingPassword) && (
                                    <>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="page_lock_password"
                                            value={form.page_lock_password || ""}
                                            onChange={(e) => handlePasswordChange(e.target.value)}
                                            className="w-full p-2 border rounded"
                                            placeholder="半角英数6文字以上20文字以内"
                                            minLength={6}
                                            maxLength={20}
                                            pattern="[A-Za-z0-9]{6,20}"
                                            required={!isRegistered} // ✅ 新規登録の場合のみ必須
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-10 text-gray-500"
                                        >
                                            {showPassword ? (
                                                <EyeSlashIcon className="w-5 h-5" />
                                            ) : (
                                                <EyeIcon className="w-5 h-5" />
                                            )}
                                        </button>
                                        {errors.page_lock_password && (
                                            <p className="text-red-500 text-sm">{errors.page_lock_password}</p>
                                        )}
                                    </>
                                )} */}
                            </div>

                            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                                {isRegistered ? "更新" : "登録"}
                            </button>
                        </form>
                    )}
                </div>

                {!isLoading && (
                    <>
                        {myCompany && (
                            <>
                                {myCompany?.type === "管理会社" && (
                                    <div className="mt-8 bg-white p-4 md:p-8 shadow rounded-lg">
                                        {isRegistered && (
                                            <>
                                                <div className="text-xl font-bold mb-4">あなたの会社のID <span className="text-sm text-red-500">※ 協力会社に教えてください。</span></div>
                                                
                                                <div className="sm:flex items-center sm:space-x-2">
                                                    <p className="font-mono bg-gray-100 px-2 py-1 rounded">{myCompany.id}</p>
                                                    <div className="relative inline-block">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(myCompany.id);
                                                                setCopied(true);
                                                                setTimeout(() => setCopied(false), 500);
                                                            }}
                                                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 mt-2 sm:mt-0"
                                                        >
                                                            コピー
                                                        </button>
                                                        {copied && (
                                                            <div className="absolute w-32 text-center -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-sm px-2 py-1 rounded shadow">
                                                                コピーしました！
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        {pendingCompanies.length > 0 && (
                                            <ul className="mt-2">
                                                {pendingCompanies.map((company) => (
                                                    <li
                                                        key={company.id}
                                                        className="flex justify-between items-center border p-2 rounded bg-gray-200"
                                                    >
                                                        {company.name}
                                                        <button
                                                            onClick={() => approveRequest(company.id)}
                                                            className="bg-green-500 text-white px-2 py-1 rounded"
                                                        >
                                                            承認
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        {approvedCompanies.length > 0 && (
                                            <>
                                                <div className="text-xl font-bold mt-4 mb-4">承認済みの協力会社</div>
                                                <ul className="mt-2">
                                                    {approvedCompanies.map((company) => (
                                                        <li
                                                            key={company.id}
                                                            className="flex justify-between items-center border p-2 rounded bg-gray-200 mt-2"
                                                        >
                                                            {company.name}
                                                            <button
                                                                type="button"
                                                                onClick={() => removeApprovedCompany(company.id, true)}
                                                                className="bg-red-500 text-white px-2 py-1 rounded"
                                                            >
                                                                解除
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </PageLockGuard>
        </LoginCheck>
    );
}
