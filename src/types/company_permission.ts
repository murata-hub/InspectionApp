export type CompanyPermission = {
    id?: string;
    granter_company_id: string;
    granter_company_name?: string;
    receiver_company_id: string;
    receiver_company_name: string;
    approval: boolean;
    created_at?: string;
    updated_at?: string;
};
