export type Shutter = {
    id?: string;
    company_id: string;
    site_id: string;
    name: string;
    model_number: string;
    width: string;
    height: string;
    usage_count: number;
    installation_location: string
    created_at?: string;
    updated_at?: string;
};

export const shutterFields = [
    { id: "name", label: "シャッター名（符号）", required: true, validation: (value: string) => value.trim() !== "" },
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