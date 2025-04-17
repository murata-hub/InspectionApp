export type InspectionRecord = {
    id?: string;
    company_id: string;
    shutter_id?: string | null;
    inspection_date: string; // YYYY-MM-DD
    lead_inspector: string;
    lead_inspector_id: string;
    sub_inspector_1?: string;
    sub_inspector_id_1?: string;
    sub_inspector_2?: string;
    sub_inspector_id_2?: string;
    special_note?: string;
    created_at?: string;
    updated_at?: string;
};