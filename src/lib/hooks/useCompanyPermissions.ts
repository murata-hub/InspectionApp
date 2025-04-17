"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { CompanyPermission } from "@/types/company_permission";

export function useCompanyPermissions() {
    const [companyPermissions, setCompanyPermissions] = useState<CompanyPermission[] | null>(null);
    const [myCompanyPermissions, setMyCompanyPermissions] = useState<CompanyPermission[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // 許可一覧を取得
    const fetchCompanyPermissions = async (granterCompanyId?: string, receiverCompanyId?: string) => {
        setLoading(true);
        try {
            let query = supabase.from("company_permissions").select("*");

            if (granterCompanyId) {
                query = query.eq("granter_company_id", granterCompanyId);
            }
            if (receiverCompanyId) {
                query = query.eq("receiver_company_id", receiverCompanyId);
            }

            const { data, error } = await query;
            if (error) throw error;
            setCompanyPermissions(Array.isArray(data) ? data : [data]);
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // 自分の会社の許可一覧を取得
    const fetchMyCompanyPermissions = async (userCompanyId: string) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("company_permissions")
                .select("*")
                .or(`granter_company_id.eq.${userCompanyId},receiver_company_id.eq.${userCompanyId}`);
            if (error) throw error;
            setMyCompanyPermissions(Array.isArray(data) ? data : [data]);
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // 許可を追加
    const createCompanyPermission = async (permission: CompanyPermission) => {
        try {
            const { data, error } = await supabase.from("company_permissions").insert([permission]).select("*");

            // UNIQUE制約違反のエラーハンドリング
            if (error) {
                if (error.code === "23505") {
                    console.warn("⚠️ すでに登録されているためスキップ:", permission);
                    return { success: false, message: "すでに登録されています。" };
                }
                throw error;
            }

            setCompanyPermissions((prev) => (prev ? [...prev, data[0]] : [data[0]]));
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    // 許可を更新
    const updateCompanyPermission = async (recordId: string, updatedData: Partial<CompanyPermission>) => {
        try {
            const { data, error } = await supabase
                .from("company_permissions")
                .update(updatedData)
                .eq("id", recordId);
            if (error) throw error;

            setCompanyPermissions((prev) =>
                prev ? prev.map((p) => (p.id === recordId ? { ...p, ...updatedData } : p)) : null
            );
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    // 許可を削除
    const deleteCompanyPermission = async (recordId: string) => {
        try {
            const { data, error } = await supabase
                .from("company_permissions")
                .delete()
                .eq("id", recordId);
            if (error) throw error;

            setCompanyPermissions((prev) =>
                prev ? prev.filter((p) => p.id !== recordId) : null
            );
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    return {
        companyPermissions,
        myCompanyPermissions,
        fetchCompanyPermissions,
        fetchMyCompanyPermissions,
        createCompanyPermission,
        updateCompanyPermission,
        deleteCompanyPermission,
        loading,
        error,
    };
}
