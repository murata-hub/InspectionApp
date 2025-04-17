"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { InspectionRecord } from "@/types/inspection_record";

export function useInspectionRecords() {
    const [inspectionRecords, setInspectionRecords] = useState<InspectionRecord[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchInspectionRecords = async (shutterId?: string) => {
        setLoading(true);
        try {
            let query = supabase.from("inspection_records").select("*").order("inspection_date", { ascending: false });

            if (shutterId) {
                query = query.eq("shutter_id", shutterId);
            }

            const { data, error } = await query;
            if (error) throw error;
            setInspectionRecords(data);
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const createInspectionRecord = async (record: InspectionRecord) => {
        try {
            const { data, error } = await supabase.from("inspection_records").insert([record]).select("*");

            // UNIQUE制約違反のエラーハンドリング
            if (error) {
                if (error.code === "23505") {
                    console.warn("⚠️ すでに登録されているためスキップ:", record);
                    return { success: false, message: "すでに登録されています。" };
                }
                throw error;
            }

            setInspectionRecords((prev) => (prev ? [...prev, data[0]] : [data[0]]));
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    const updateInspectionRecord = async (id: string, updatedData: Partial<InspectionRecord>) => {
        try {
            const { data, error } = await supabase.from("inspection_records").update(updatedData).eq("id", id).select("*");
            if (error) throw error;
            setInspectionRecords((prev) =>
                prev ? prev.map((r) => (r.id === id ? { ...r, ...updatedData } : r)) : null
            );
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    const deleteInspectionRecord = async (id: string) => {
        try {
            const { data, error } = await supabase.from("inspection_records").delete().eq("id", id);
            if (error) throw error;
            setInspectionRecords((prev) => (prev ? prev.filter((r) => r.id !== id) : null));
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    return {
        inspectionRecords,
        fetchInspectionRecords,
        createInspectionRecord,
        updateInspectionRecord,
        deleteInspectionRecord,
        loading,
        error
    };
}
