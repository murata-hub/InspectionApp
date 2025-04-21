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
    model_number?: string;
    width?: string;
    height?: string;
    usage_count?: number;
    installation_location?: string;
    created_at?: string;
    updated_at?: string;
};

export const inspectionRecordShutterFields = [
    { id: "model_number", label: "機種", required: false, validation: (value: string) => value.trim() === "" || value.trim() !== "" },
    {
        id: "width",
        label: "幅（半角数字）",
        required: false,
        validation: (value: string) =>
          value.trim() === "" || /^[0-9]+(?:\.[0-9]+)?(?:\s*[a-zA-Z%]*)?$/.test(value.trim())
    },
    {
        id: "height",
        label: "高さ（半角数字）",
        required: false,
        validation: (value: string) =>
            value.trim() === "" || /^[0-9]+(?:\.[0-9]+)?(?:\s*[a-zA-Z%]*)?$/.test(value.trim())
    },
    {
        id: "usage_count",
        label: "使用回数（半角数字）",
        required: false,
        validation: (value: string) => {
            if (value.trim() === "") return true;
            const num = Number(value);
            return Number.isInteger(num) && num >= 0;
        }
    },
    { id: "installation_location", label: "設置場所", required: false, validation: (value: string) => value.trim() === "" || value.trim() !== "" }
];