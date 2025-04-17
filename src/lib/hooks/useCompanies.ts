// app/lib/hooks/useCompanies.ts
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Company } from "@/types/company";

export function useCompanies() {
    const [companies, setCompanies] = useState<Company[] | null>(null);
    const [myCompany, setMyCompany] = useState<Company | null>(null);
    const [myCompanyType, setMyCompanyType] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // ✅ **自分の会社情報を取得**
    const fetchMyCompany = async (userId: string) => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from("companies")
                .select(`
                    id,
                    name,
                    representative_name,
                    type,
                    can_access_setting_page,
                    created_at,
                    updated_at
                `)
                .eq("id", userId)
                .single();
    
            if (error) throw error;
            setMyCompany(data);
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };
    

    // // ✅ **自分以外の会社情報を取得**
    // const fetchCompanies = async (excludeId: string) => {
    //     setLoading(true);
    //     setError(null);
    //     try {
    //         const { data, error } = await supabase
    //             .from("companies")
    //             .select("*")
    //             .not("id", "eq", excludeId);

    //         if (error) throw error;
    //         setCompanies(data);
    //     } catch (error: any) {
    //         setError(error.message);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // ✅ **自分以外の会社情報を取得（id, name, representative_name のみ）**
    const fetchCompanies = async (excludeId: string) => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from("companies")
                .select("id, name, representative_name")
                .not("id", "eq", excludeId);

            if (error) throw error;
            setCompanies(data);
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // ✅ **自分の会社のタイプ（type）だけを取得**
    const fetchMyCompanyType = async (userId: string) => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from("companies")
                .select("type")
                .eq("id", userId)
                .single();

            if (error) throw error;
            setMyCompanyType(data.type || null);
            return data.type || null;
        } catch (error: any) {
            setError(error.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // ✅ **特定の会社情報をIDで取得**
    const fetchCompanyById = async (companyId: string): Promise<Company | null> => {
        try {
            const { data, error } = await supabase
                .from("companies")
                .select("id, name, representative_name")
                .eq("id", companyId)
                .single();

            if (error) {
                // console.error("❌ 会社情報の取得エラー:", error.message);
                return null;
            }
            return data;
        } catch (error: any) {
            // console.error("❌ APIエラー:", error.message);
            return null;
        }
    };

    const createCompany = async (company: Company) => {
        try {
            const { data, error } = await supabase.from("companies").insert([company]).select("*");
            if (error) throw error;
            setCompanies((prev) => (prev ? [...prev, data[0]] : [data[0]]));
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    const updateCompany = async (companyId: string, updatedData: Partial<Company>) => {
        try {
            const { data, error } = await supabase.from("companies").update(updatedData).eq("id", companyId);
            if (error) throw error;
            setCompanies((prev) => prev ? prev.map((c) => (c.id === companyId ? { ...c, ...updatedData } : c)) : null);
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    const deleteCompany = async (companyId: string) => {
        try {
            const { data, error } = await supabase.from("companies").delete().eq("id", companyId);
            if (error) throw error;
            setCompanies((prev) => (prev ? prev.filter((c) => c.id !== companyId) : null));
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    // ✅ **パスワード照合関数**
    const checkPageLockPassword = async (userId: string, inputPassword: string): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            // ✅ `page_lock_password` だけを取得（他の情報は不要）
            const { data, error } = await supabase
                .from("companies")
                .select("page_lock_password")
                .eq("id", userId)
                .single();

            if (error) throw error;

            // ✅ パスワードが一致するかチェック
            if (data?.page_lock_password === inputPassword) {
                return true; // パスワード一致
            } else {
                return false; // パスワード不一致
            }
        } catch (error: any) {
            setError(error.message);
            return false; // エラー時もfalseを返す
        } finally {
            setLoading(false);
        }
    };

    return { 
        companies, 
        myCompany, 
        myCompanyType,
        fetchMyCompany, 
        fetchMyCompanyType,
        setMyCompanyType,
        fetchCompanies, 
        fetchCompanyById,
        createCompany, 
        updateCompany, 
        deleteCompany, 
        checkPageLockPassword,
        loading,
        error 
    };
}
