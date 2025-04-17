"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Site } from "@/types/site";

export function useSites() {
    const [sites, setSites] = useState<Site[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSites = async (siteId?: string, companyId?: string) => {
        setLoading(true);
        try {
            let sitesResult;

            if (siteId) {
                // ID指定なら単独取得
                const { data, error } = await supabase
                    .from("sites")
                    .select("*")
                    .eq("id", siteId)
                    .single();

                if (error) throw error;
                sitesResult = [data]; // 単体でも配列にしておく

            } else if (companyId) {
                // site_companiesからその会社に関係する現場IDを取得
                const { data: scData, error: scError } = await supabase
                    .from("site_companies")
                    .select("site_id")
                    .eq("company_id", companyId);

                if (scError) throw scError;

                const siteIds = scData.map((sc) => sc.site_id);

                if (siteIds.length === 0) {
                    sitesResult = []; // 関連現場がなければ空配列
                } else {
                    const { data, error } = await supabase
                        .from("sites")
                        .select("*")
                        .in("id", siteIds);

                    if (error) throw error;
                    sitesResult = data;
                }

            } else {
                // 何も指定がない場合、自社の現場すべて（RLSによる制限あり）
                const { data, error } = await supabase
                    .from("sites")
                    .select("*");

                if (error) throw error;
                sitesResult = data;
            }

            setSites(sitesResult);
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const createSite = async (site: Site) => {
        try {
            const { data, error } = await supabase.from("sites").insert([site]).select("*");
    
            // UNIQUE制約違反のエラーハンドリング
            if (error) {
                if (error.code === "23505") {
                    console.warn("⚠️ すでに登録されているためスキップ:", site);
                    return { success: false, message: "すでに登録されています。" };
                }
                throw error;
            }
    
            setSites((prev) => (prev ? [...prev, data[0]] : [data[0]]));
            return { success: true, data, error };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };
    

    const updateSite = async (siteId: string, updatedData: Partial<Site>) => {
        try {
            const { data, error } = await supabase.from("sites").update(updatedData).eq("id", siteId).select("*");
            if (error) throw error;
            setSites((prev) => prev ? prev.map((s) => (s.id === siteId ? { ...s, ...updatedData } : s)) : null);
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    const deleteSite = async (siteId: string) => {
        try {
            const { data, error } = await supabase.from("sites").delete().eq("id", siteId);
            if (error) throw error;
            setSites((prev) => (prev ? prev.filter((s) => s.id !== siteId) : null));
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    return { sites, fetchSites, createSite, updateSite, deleteSite, loading, error };
}
