"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { InspectionResult } from "@/types/inspection_result";

export function useInspectionResults() {
    const [inspectionResults, setInspectionResults] = useState<InspectionResult[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchInspectionResults = async (inspectionRecordId?: string) => {
        setLoading(true);
        try {
            let query = supabase.from("inspection_results").select("*");

            if (inspectionRecordId) {
                query = query.eq("inspection_record_id", inspectionRecordId);
            }

            const { data, error } = await query;
            if (error) throw error;
            setInspectionResults(data);
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const createInspectionResult = async (result: InspectionResult) => {
        try {
            const { data, error } = await supabase.from("inspection_results").insert([result]).select("*");
            // UNIQUE制約違反のエラーハンドリング
            if (error) {
                if (error.code === "23505") {
                    console.warn("⚠️ すでに登録されているためスキップ:", result);
                    return { success: false, message: "すでに登録されています。" };
                }
                throw error;
            }

            setInspectionResults((prev) => (prev ? [...prev, data[0]] : [data[0]]));
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    const updateInspectionResult = async (id: string, updatedData: Partial<InspectionResult>) => {
        try {
            const { data, error } = await supabase.from("inspection_results").update(updatedData).eq("id", id);
            if (error) throw error;

            setInspectionResults((prev) =>
                prev ? prev.map((r) => (r.id === id ? { ...r, ...updatedData } : r)) : null
            );
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    const deleteInspectionResult = async (id: string) => {
        try {
            const { data, error } = await supabase.from("inspection_results").delete().eq("id", id);
            if (error) throw error;

            setInspectionResults((prev) => (prev ? prev.filter((r) => r.id !== id) : null));
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    return {
        inspectionResults,
        setInspectionResults,
        fetchInspectionResults,
        createInspectionResult,
        updateInspectionResult,
        deleteInspectionResult,
        loading,
        error,
    };
}
