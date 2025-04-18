"use client";

import React, { useState, useEffect } from "react";
import CompanySelection from "./CompanySelection";
import { useSites } from "@/lib/hooks/useSites";
import { useSiteCompanies } from "@/lib/hooks/useSiteCompanies";
import { Site, siteFields } from "@/types/site";
import InputField from "@/components/InputField";

const SiteEditForm = ({ onClose, site, company, permittedCompanies }: { onClose: () => void; site: Site; company: any; permittedCompanies: any[]; }) => {
    const { updateSite } = useSites();
    const { fetchSiteCompanies, siteCompanies, createSiteCompany, deleteSiteCompany } = useSiteCompanies();
    const [selectedCompany, setSelectedCompany] = useState<any>(null);
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

    // 📚 自動的に Site 型の初期値を生成
    const initialFormData: Site = {
        id: "",
        company_id: "", // ログイン会社（管理会社）
        name: "", // 現場名
        furigana: "", // 現場名フリガナ
        address: "", // 現場住所
        purpose: "", // 現場の用途
        owner_name: "", // 所有者名
        owner_furigana: "", // 所有者名フリガナ
        owner_post_number: "", // 所有者郵便番号
        owner_address: "", // 所有者住所
        owner_phone_number: "", // 所有者電話番号
        manager_name: "", // 管理者名
        manager_furigana: "", // 管理者名フリガナ
        manager_post_number: "", // 管理者郵便番号
        manager_address: "", // 管理者住所
        manager_phone_number: "", // 管理者電話番号
        num_floors_above: 0, // 階数（地上階数）
        num_floors_below: 0, // 階数（地下階数）
        building_area: 0.0, // 建築面積（㎡）
        total_floor_area: 0.0, // 延べ面積（㎡）
        confirmation_certificate_date: "", // 確認済証交付年月日
        confirmation_certificate_number: "", // 確認済証番号
        is_confirmation_by_building_officer: false, // 確認済証交付者_建築主事等
        is_confirmation_by_agency: false, // 確認済証交付者_指定機関
        confirmation_agency_name: "", // 確認済証交付者_指定機関名
        inspection_certificate_date: "", // 検査済証交付年月日
        inspection_certificate_number: "", // 検査済証番号
        is_inspection_by_building_officer: false, // 検査済証交付者_建築主事等
        is_inspection_by_agency: false, // 検査済証交付者_指定機関
        inspection_agency_name: "", // 検査済証交付者_指定機関名
        // ▼ 防火設備の概要（初期値）
        uses_zone_evacuation_safety_method: false, // 区画避難安全検証法の適用有無
        zone_evacuation_floor: 0, // 区画避難適用階（○階）

        uses_floor_evacuation_safety_method: false, // 階避難安全検証法の適用有無
        floor_evacuation_floor: 0, // 階避難適用階（○階）

        uses_full_building_evacuation_method: false, // 全館避難安全検証法の適用有無

        evacuation_safety_method: false, // その他の有無
        evacuation_safety_method_other: "", // その他（自由記述）

        has_fire_door: false, // 防火扉の有無
        fire_door_count: 0, // 防火扉の枚数（○枚）

        has_fire_shutter: false, // 防火シャッターの有無
        fire_shutter_count: 0, // 防火シャッターの枚数（○枚）

        has_fireproof_screen: false, // 耐火クロススクリーンの有無
        fireproof_screen_count: 0, // 耐火クロススクリーンの枚数（○枚）

        has_drencher: false, // ドレンチャーの有無
        drencher_count: 0, // ドレンチャーの台数（○台）

        has_other_fire_equipment: false, // その他防火設備の有無
        other_fire_equipment_count: 0, // その他防火設備の台数（○台）
    };

    const [formData, setFormData] = useState(initialFormData);

    // ✅ 初期データ設定
    useEffect(() => {
        if (site) {
            const { site_companies, ...cleanedSite } = site;
            setFormData(cleanedSite);
            fetchSiteCompanies(site.id); // 会社情報をフェッチ
        }
    }, [site, company]);

    // ✅ `siteCompanies` から協力会社をセット
    useEffect(() => {
        if (siteCompanies && siteCompanies?.length > 0 && permittedCompanies?.length > 0) {
            // ✅ `siteCompanies` の `company_id` に一致する `permittedCompanies` を見つける
            const matchedCompanies = permittedCompanies.filter((company) =>
                siteCompanies.some((siteCompany) => String(siteCompany.company_id) === String(company.id))
            );
    
            if (matchedCompanies.length > 0) {
                // ✅ 最初にマッチした会社を `selectedCompany` にセット
                setSelectedCompany(matchedCompanies[0]);
            } else {
                console.warn("⚠️ 一致する協力会社が見つかりませんでした。");
            }
        }
    }, [siteCompanies, permittedCompanies]);
    

    // ✅ 入力変更時
    const handleSiteDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value, type } = e.target;
    
        setFormData((prev) => ({
            ...prev,
            [id]: type === "checkbox"
                ? (e.target as HTMLInputElement).checked
                : type === "number"
                    ? (value !== "" ? parseInt(value, 10) : null)  // "" のみ null にする
                    : value
        }));
    };

    const handleSiteDataSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedCompany || !selectedCompany.id) {
            alert("協力会社を選択してください。");
            return;
        }

        // 🔍 バリデーションチェック
        const errors: { [key: string]: string } = {};
        siteFields.forEach((field) => {
            const value = formData[field.id as keyof Site];
            if (field.required && field.validation && !field.validation(value)) {
                errors[field.id] = `${field.label}が正しくありません`;
            }
        });

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            alert("⛔ 入力に不備があります。赤枠の項目を確認してください。");
            return;
        }

        try {
            const sanitizedFormData = {
                ...formData,
                confirmation_certificate_date: formData.confirmation_certificate_date || null,
                inspection_certificate_date: formData.inspection_certificate_date || null,
            };
            // **Step 1: 現場 (`sites`) を更新**
            const { success, data } = await updateSite(site.id, sanitizedFormData);
            if (!success) throw new Error();

            // console.log(formData);

            const newSiteId = data[0]?.id; // 更新された現場ID
            // console.log("✅ 現場更新成功! site_id:", newSiteId);

            // // **Step 2: `site_companies` を更新**
            // console.log("🚀 Step 2: `site_companies` 更新開始");

            // // **Step 2: `site_companies` の更新**
            // console.log("🚀 Step 2: `site_companies` を更新");

            const currentCompanyId = siteCompanies[0]?.company_id;
            const newCompanyId = selectedCompany?.id;

            if (currentCompanyId !== newCompanyId) {
                // 協力会社が変更された場合のみ更新
                if (currentCompanyId) {
                    // 旧協力会社の削除
                    const deleteResult = await deleteSiteCompany(currentCompanyId);
                    if (!deleteResult.success) {
                        throw new Error(deleteResult.message);
                    }
                }

                if (newCompanyId) {
                    // 新協力会社の追加
                    const createResult = await createSiteCompany({
                        site_id: site.id,
                        company_id: newCompanyId,
                    });
                    if (!createResult.success) {
                        throw new Error(createResult.message);
                    }
                }
            }

            alert("✅ 現場情報を更新しました！");
            onClose(); // モーダルを閉じる
            window.location.reload();
        } catch (error: any) {
            // console.error("❌ 登録エラー:", error.message);
            alert(`エラー: ${error.message}`);
        }
    };

    return (
        <div className="md:p-6">
            <h1 className="text-2xl font-bold mb-4">現場情報編集</h1>
            <form onSubmit={handleSiteDataSubmit}>
                <h2 className="text-lg font-bold mb-2">管理会社</h2>
                <p className="mb-4">{ company.name }</p>

                {/* 🚨 協力会社がいない場合の警告メッセージ */}
                {permittedCompanies.length === 0 ? (
                    <p className="border border-red-500 text-red-500 p-4 mb-4 rounded-lg">
                        協力会社が登録されていません。協力会社に当アプリのアカウント作成を依頼してください。
                    </p>
                ) : (
                    // 会社選択コンポーネント
                    <CompanySelection
                        selectedCompany={selectedCompany}
                        setSelectedCompany={setSelectedCompany}
                        permittedCompanies={permittedCompanies}
                    />
                )}

                {formData.id && permittedCompanies.length !== 0 && (
                    <>
                        {siteFields.map((field) => (
                            <InputField
                                key={field.id}
                                id={field.id}
                                label={field.label}
                                value={formData[field.id as keyof Site] as string | number | boolean}
                                type={field.type || "text"}
                                required={field.required}
                                onChange={handleSiteDataChange}
                                error={formErrors[field.id]}
                            />
                        ))}

                        {/* 更新ボタン */}
                        <div className="flex justify-end">
                            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                                更新
                            </button>
                        </div>
                    </>
                )}
            </form>
        </div>
    );
};

export default SiteEditForm;
