"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Inspector } from "@/types/inspector";

export function useInspectors() {
    const [inspectors, setInspectors] = useState<Inspector[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchInspectors = async (inspectorId?: string, companyId?: string) => {
        setLoading(true);
        try {
            let query = supabase.from("inspectors").select("*");
    
            if (inspectorId) {
                query = query.eq("id", inspectorId).single();
            } else if (companyId) {
                query = query.eq("company_id", companyId);
            }
    
            const { data, error } = await query;
            if (error) throw error;
            
            setInspectors(Array.isArray(data) ? data : [data]);
            return Array.isArray(data) ? data : [data];
        } catch (error: any) {
            setError(error.message);
            return null;
        } finally {
            setLoading(false);
        }
    };
    
    // **複数の `inspectorId` に対応した新しい取得関数**
    const fetchInspectorsByIds = async (inspectorIds: string[]) => {
        if (!inspectorIds || inspectorIds.length === 0) return [];

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("inspectors")
                .select("*")
                .in("id", inspectorIds); // 🔥 `in` を使用して複数の ID を取得

            if (error) throw error;

            setInspectors(data);
            return data;
        } catch (error: any) {
            setError(error.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const createInspector = async (inspector: Inspector) => {
        try {
            const { data, error } = await supabase
                .from("inspectors")
                .insert([inspector])
                .select("*");

            if (error) {
                // console.error("🔴 Supabase insert エラー:", error.message);
                return { success: false, error: error.message };
            }

            if (!data || data.length === 0) {
                // console.error("🔴 Supabase insert 成功したが、データが返ってこなかった");
                return { success: false, error: "登録されたデータが取得できませんでした" };
            }

            setInspectors((prev) => (prev ? [...prev, data[0]] : [data[0]]));
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    const updateInspector = async (inspectorId: string, updatedData: Partial<Inspector>) => {
        try {
            const { data, error } = await supabase.from("inspectors").update(updatedData).eq("id", inspectorId);
            if (error) throw error;
            setInspectors((prev) => prev ? prev.map((w) => (w.id === inspectorId ? { ...w, ...updatedData } : w)) : null);
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    const deleteInspector = async (inspectorId: string) => {
        try {
            const { data, error } = await supabase.from("inspectors").delete().eq("id", inspectorId);
            if (error) throw error;
            setInspectors((prev) => (prev ? prev.filter((w) => w.id !== inspectorId) : null));
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    return { inspectors, fetchInspectors, fetchInspectorsByIds, createInspector, updateInspector, deleteInspector, setInspectors, loading, error };
}
