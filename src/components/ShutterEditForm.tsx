"use client";

import React, { useState, useEffect } from "react";
import { useShutters } from "@/lib/hooks/useShutters";
import { Shutter, shutterFields } from "@/types/shutter";
import InputField from "@/components/InputField";

const ShutterEditForm = ({
    onClose,
    siteId,
    siteName,
    editTarget,
}: {
    onClose: () => void;
    siteId: string;
    siteName: string;
    editTarget: Shutter;
}) => {
    const { updateShutter } = useShutters();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
    const userId = localStorage.getItem("user_id");

    const [formData, setFormData] = useState<Shutter>({
        id: editTarget.id,
        site_id: siteId,
        company_id: userId || "",
        name: editTarget.name || "",
        model_number: editTarget.model_number || "",
        width: editTarget.width || "",
        height: editTarget.height || "",
        usage_count: editTarget.usage_count || 0,
        installation_location: editTarget.installation_location || "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { id, value, type } = e.target;

        setFormData((prev) => ({
            ...prev,
            [id]: type === "checkbox"
                ? (e.target as HTMLInputElement).checked
                : type === "number"
                    ? (value !== "" ? parseInt(value, 10) : null)
                    : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // 🔍 入力バリデーションチェック
        const newErrors: { [key: string]: string | null } = {};
        let hasError = false;

        shutterFields.forEach((field) => {
            const value = formData[field.id as keyof Shutter]?.toString() || "";
            const isValid = field.validation ? field.validation(value) : true;

            if (!isValid) {
                newErrors[field.id] = `${field.label}の形式が正しくありません。`;
                hasError = true;
            } else {
                newErrors[field.id] = null;
            }
        });

        setErrors(newErrors);

        if (hasError) {
            setLoading(false);
            return;
        }

        if (!editTarget.id) {
            alert("編集対象が不明です。処理を実行できません。");
            return;
        }

        try {
            if (!userId) {
                alert("ユーザーIDが不明です。処理を実行できません。");
                return;
            }

            const sanitizedFormData = {
                ...formData,
                site_id: siteId,
                company_id: userId,
            };

            // console.log("🟡 編集データ:", sanitizedFormData);

            const updateResult = await updateShutter(editTarget.id, sanitizedFormData);

            if (!updateResult.success) {
                throw new Error(`Supabase 更新に失敗: ${updateResult.error}`);
            }

            alert("シャッター情報を更新しました。");

            onClose();
            window.location.reload();
        } catch (err: any) {
            // console.error("🔴 エラー:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="md:p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">シャッター編集</h1>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block font-bold mb-2" htmlFor="name">現場</label>
                    <p className="">{siteName}</p>
                </div>

                {shutterFields.map((field) => (
                    <InputField
                        key={field.id}
                        id={field.id}
                        label={field.label}
                        value={formData[field.id as keyof Shutter] as string | number | boolean}
                        type={field.type || "text"}
                        required={field.required}
                        onChange={handleChange}
                        error={errors[field.id] || undefined}
                    />
                    
                ))}

                <div className="flex justify-end">
                    <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-700">更新</button>
                </div>
            </form>
        </div>
    );
};

export default ShutterEditForm;
