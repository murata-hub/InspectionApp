"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { SiteCompany } from "@/types/site_company";

export function useSiteCompanies() {
    const [siteCompanies, setSiteCompanies] = useState<SiteCompany[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSiteCompanies = async (siteId?: string, companyId?: string) => {
        setLoading(true);
        try {
            let query = supabase.from("site_companies").select("*");

            if (siteId) {
                query = query.eq("site_id", siteId);
            } else if (companyId) {
                query = query.eq("company_id", companyId);
            }

            const { data, error } = await query;
            if (error) throw error;
            setSiteCompanies(Array.isArray(data) ? data : [data]);
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const createSiteCompany = async (siteCompany: SiteCompany) => {
        try {
            const { data, error } = await supabase.from("site_companies").insert([siteCompany]).select("*");

            // UNIQUE制約違反のエラーハンドリング
            if (error) {
                if (error.code === "23505") {
                    console.warn("⚠️ すでに登録されているためスキップ:", siteCompany);
                    return { success: false, message: "すでに登録されています。" };
                }
                throw error;
            }
            
            setSiteCompanies((prev) => (prev ? [...prev, data[0]] : [data[0]]));
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    const updateSiteCompany = async (id: string, updatedData: Partial<SiteCompany>) => {
        try {
            const { data, error } = await supabase.from("site_companies").update(updatedData).eq("id", id);
            if (error) throw error;
            setSiteCompanies((prev) => prev ? prev.map((s) => (s.id === id ? { ...s, ...updatedData } : s)) : null);
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    const deleteSiteCompany = async (id: string) => {
        try {
            const { data, error } = await supabase.from("site_companies").delete().eq("id", id);
            if (error) throw error;
            setSiteCompanies((prev) => (prev ? prev.filter((s) => s.id !== id) : null));
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    return { siteCompanies, fetchSiteCompanies, createSiteCompany, updateSiteCompany, deleteSiteCompany, loading, error };
}
