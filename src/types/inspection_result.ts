export type InspectionResult = {
    id?: string;
    company_id: string;
    inspection_record_id?: string | null;
    inspection_number: string;
    main_category: string;
    sub_category?: string;
    inspection_name: string;
    target_existence: boolean;
    inspection_result: string;
    situation_measures?: string;
    inspector_number: string;
    created_at?: string;
    updated_at?: string;
    globalIndex?: number;
};