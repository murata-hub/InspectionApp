"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Shutter } from "@/types/shutter";

export function useShutters() {
    const [shutters, setShutters] = useState<Shutter[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchShutters = async (shutterId?: string, siteId?: string) => {
        setLoading(true);
        try {
            let query = supabase.from("shutters").select("*");

            if (shutterId) {
                query = query.eq("id", shutterId).single();
            } else if (siteId) {
                query = query.eq("site_id", siteId);
            }

            const { data, error } = await query;
            if (error) throw error;
            setShutters(Array.isArray(data) ? data : [data]);
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const createShutter = async (shutter: Shutter) => {
        try {
            const { data, error } = await supabase.from("shutters").insert([shutter]).select("*");

            if (error) {
                if (error.code === "23505") {
                    console.warn("⚠️ すでに登録されているためスキップ:", shutter);
                    return { success: false, message: "すでに登録されています。" };
                }
                throw error;
            }

            setShutters((prev) => (prev ? [...prev, data[0]] : [data[0]]));
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    const updateShutter = async (shutterId: string, updatedData: Partial<Shutter>) => {
        try {
            const { data, error } = await supabase.from("shutters").update(updatedData).eq("id", shutterId);
            if (error) throw error;
            setShutters((prev) => prev ? prev.map((s) => (s.id === shutterId ? { ...s, ...updatedData } : s)) : null);
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    const deleteShutter = async (shutterId: string) => {
        try {
            const { data, error } = await supabase.from("shutters").delete().eq("id", shutterId);
            if (error) throw error;
            setShutters((prev) => (prev ? prev.filter((s) => s.id !== shutterId) : null));
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    return {
        shutters,
        setShutters,
        fetchShutters,
        createShutter,
        updateShutter,
        deleteShutter,
        loading,
        error
    };
}
