export type Site = {
    id?: string; // UUID
    company_id: string; // 会社ID
    name: string; // 現場名
    furigana?: string; // 現場名フリガナ
    address: string; // 現場住所
    purpose?: string; // 現場の用途
    owner_name: string; // 所有者名
    owner_furigana?: string; // 所有者名フリガナ
    owner_post_number?: string; // 所有者郵便番号
    owner_address: string; // 所有者住所
    owner_phone_number?: string; // 所有者電話番号
    manager_name?: string; // 管理者名
    manager_furigana?: string; // 管理者名フリガナ
    manager_post_number?: string; // 管理者郵便番号
    manager_address?: string; // 管理者住所
    manager_phone_number?: string; // 管理者電話番号
    num_floors_above?: number; // 階数（地上階数）
    num_floors_below?: number; // 階数（地下階数）
    building_area?: number; // 建築面積（㎡）
    total_floor_area?: number; // 延べ面積（㎡）
    confirmation_certificate_date?: string; // 確認済証交付年月日
    confirmation_certificate_number?: string; // 確認済証番号
    is_confirmation_by_building_officer?: boolean; // 確認済証交付者_建築主事等
    is_confirmation_by_agency?: boolean; // 確認済証交付者_指定機関
    confirmation_agency_name?: string; // 確認済証交付者_指定機関名
    inspection_certificate_date?: string; // 検査済証交付年月日
    inspection_certificate_number?: string; // 検査済証番号
    is_inspection_by_building_officer?: boolean; // 検査済証交付者_建築主事等
    is_inspection_by_agency?: boolean; // 検査済証交付者_指定機関
    inspection_agency_name?: string; // 検査済証交付者_指定機関名
    // ▼ 防火設備の概要
    uses_zone_evacuation_safety_method?: boolean; // 区画避難安全検証法の適用有無
    zone_evacuation_floor?: number; // 区画避難適用階（○階）

    uses_floor_evacuation_safety_method?: boolean; // 階避難安全検証法の適用有無
    floor_evacuation_floor?: number; // 階避難適用階（○階）

    uses_full_building_evacuation_method?: boolean; // 全館避難安全検証法の適用有無

    evacuation_safety_method?: boolean; // その他の有無
    evacuation_safety_method_other?: string; // その他（自由記述：「その他（○○）」など）

    has_fire_door?: boolean; // 防火扉の有無
    fire_door_count?: number; // 防火扉の枚数（○枚）

    has_fire_shutter?: boolean; // 防火シャッターの有無
    fire_shutter_count?: number; // 防火シャッターの枚数（○枚）

    has_fireproof_screen?: boolean; // 耐火クロススクリーンの有無
    fireproof_screen_count?: number; // 耐火クロススクリーンの枚数（○枚）

    has_drencher?: boolean; // ドレンチャーの有無
    drencher_count?: number; // ドレンチャーの台数（○台）

    has_other_fire_equipment?: boolean; // その他防火設備の有無
    other_fire_equipment_count?: number; // その他防火設備の台数（○台）
    created_at?: string; // 作成日時
    updated_at?: string; // 更新日時
};

export const siteFields = [
    // 現場名（必須）
    { id: "name", label: "現場名", required: true, validation: (value: string) => value.trim() !== "" },
    // 現場名フリガナ（必須）
    { id: "furigana", label: "現場名フリガナ", required: true, validation: (value: string) => value.trim() !== "" },
    // 所在地（必須）
    { id: "address", label: "所在地", required: true, validation: (value: string) => value.trim() !== "" },
    // 現場の用途（必須）
    { id: "purpose", label: "現場の用途", required: true, validation: (value: string) => value.trim() !== "" },
    // 所有者名（必須）
    { id: "owner_name", label: "所有者名", required: true, validation: (value: string) => value.trim() !== "" },
    // 所有者名フリガナ（必須）
    { id: "owner_furigana", label: "所有者名フリガナ", required: true, validation: (value: string) => value.trim() !== "" },
    // 所有者郵便番号（7桁の数字である必要あり）
    { id: "owner_post_number", label: "所有者郵便番号", required: true, validation: (value: string) => /^(\d{7}|\d{3}-\d{4})$/.test(value) },
    // 所有者住所（必須）
    { id: "owner_address", label: "所有者住所", required: true, validation: (value: string) => value.trim() !== "" },
    // 所有者電話番号（半角数字・ハイフンのみ許可）
    { id: "owner_phone_number", label: "所有者電話番号", required: true, validation: (value: string) => /^[0-9-]+$/.test(value) },
    // 管理者名（必須）
    { id: "manager_name", label: "管理者名", required: true, validation: (value: string) => value.trim() !== "" },
    // 管理者名フリガナ（必須）
    { id: "manager_furigana", label: "管理者名フリガナ", required: true, validation: (value: string) => value.trim() !== "" },
    // 管理者郵便番号（7桁の数字である必要あり）
    { id: "manager_post_number", label: "管理者郵便番号", required: true, validation: (value: string) => /^(\d{7}|\d{3}-\d{4})$/.test(value) },
    // 管理者住所（必須）
    { id: "manager_address", label: "管理者住所", required: true, validation: (value: string) => value.trim() !== "" },
    // 管理者電話番号（半角数字・ハイフンのみ許可）
    { id: "manager_phone_number", label: "管理者電話番号", required: true, validation: (value: string) => /^[0-9-]+$/.test(value) },
    // 階数（地上）（0 以上の数値である必要あり）
    { id: "num_floors_above", label: "階数（地上）", type: "number", required: true, validation: (value: number) => value >= 0 },
    // 階数（地下）（0 以上の数値である必要あり）
    { id: "num_floors_below", label: "階数（地下）", type: "number", required: true, validation: (value: number) => value >= 0 },
    // 建築面積（㎡）（0 より大きく、小数点以下 2 桁以内である必要あり）
    {
        id: "building_area",
        label: "建築面積（㎡）",
        type: "number",
        required: true,
        validation: (value: number) => value > 0 && /^\d+(\.\d{1,2})?$/.test(String(value)),
    },
    // 延べ面積（㎡）（0 より大きく、小数点以下 2 桁以内である必要あり）
    {
        id: "total_floor_area",
        label: "延べ面積（㎡）",
        type: "number",
        required: true,
        validation: (value: number) => value > 0 && /^\d+(\.\d{1,2})?$/.test(String(value)),
    },
    // 確認済証交付年月日（有効な日付形式である必要あり）
    { id: "confirmation_certificate_date", label: "確認済証交付年月日", type: "date", required: true, validation: (value: string) => !!Date.parse(value) },
    // 確認済証番号（必須）
    { id: "confirmation_certificate_number", label: "確認済証番号", required: true, validation: (value: string) => value.trim() !== "" },
    // 確認済証交付者_建築主事等（チェックボックス：true/false）
    {
        id: "is_confirmation_by_building_officer",
        label: "確認済証交付者_建築主事等",
        type: "checkbox",
        required: false
    },
    // 確認済証交付者_指定機関（チェックボックス：true/false）
    {
        id: "is_confirmation_by_agency",
        label: "確認済証交付者_指定機関",
        type: "checkbox",
        required: false
    },
    // 確認済証交付者_指定機関名（任意）
    {
        id: "confirmation_agency_name",
        label: "確認済証交付者_指定機関名",
        required: false,
        validation: (value: string) => value === "" || value.trim() !== "",
    },
    // 検査済証交付年月日（有効な日付形式である必要あり）
    { id: "inspection_certificate_date", label: "検査済証交付年月日", type: "date", required: true, validation: (value: string) => !!Date.parse(value) },
    // 検査済証番号（必須）
    { id: "inspection_certificate_number", label: "検査済証番号", required: true, validation: (value: string) => value.trim() !== "" },
    // 検査済証交付者_建築主事等（チェックボックス：true/false）
    {
        id: "is_inspection_by_building_officer",
        label: "検査済証交付者_建築主事等",
        type: "checkbox",
        required: false
    },
    // 検査済証交付者_指定機関（チェックボックス：true/false）
    {
        id: "is_inspection_by_agency",
        label: "検査済証交付者_指定機関",
        type: "checkbox",
        required: false
    },
    // 検査済証交付者_指定機関名（任意）
    {
        id: "inspection_agency_name",
        label: "検査済証交付者_指定機関名",
        required: false,
        validation: (value: string) => value === "" || value.trim() !== "",
    },
    // 区画避難安全検証法（チェックボックス）
    {
        id: "uses_zone_evacuation_safety_method",
        label: "区画避難安全検証法の適用有無",
        type: "checkbox",
        required: false
    },
    // 区画避難適用階（0以上の整数）
    {
        id: "zone_evacuation_floor",
        label: "区画避難適用階（○階）",
        type: "number",
        required: false,
        validation: (value: number) => value >= 0
    },
    // 階避難安全検証法（チェックボックス）
    {
        id: "uses_floor_evacuation_safety_method",
        label: "階避難安全検証法の適用有無",
        type: "checkbox",
        required: false
    },
    // 階避難適用階（0以上の整数）
    {
        id: "floor_evacuation_floor",
        label: "階避難適用階（○階）",
        type: "number",
        required: false,
        validation: (value: number) => value >= 0
    },
    // 全館避難安全検証法（チェックボックス）
    {
        id: "uses_full_building_evacuation_method",
        label: "全館避難安全検証法の適用有無",
        type: "checkbox",
        required: false
    },
    // その他の有無（チェックボックス）
    {
        id: "evacuation_safety_method",
        label: "その他避難安全検証法の有無",
        type: "checkbox",
        required: false
    },
    // その他の自由記述（任意）
    {
        id: "evacuation_safety_method_other",
        label: "その他避難安全検証法（自由記述）",
        required: false,
        validation: (value: string) => value === "" || value.trim() !== ""
    },
    // 防火扉の有無（チェックボックス）
    {
        id: "has_fire_door",
        label: "防火扉の有無",
        type: "checkbox",
        required: false
    },
    // 防火扉の枚数（0以上の整数）
    {
        id: "fire_door_count",
        label: "防火扉の枚数（○枚）",
        type: "number",
        required: false,
        validation: (value: number) => value >= 0
    },
    // 防火シャッターの有無（チェックボックス）
    {
        id: "has_fire_shutter",
        label: "防火シャッターの有無",
        type: "checkbox",
        required: false
    },
    // 防火シャッターの枚数（0以上の整数）
    {
        id: "fire_shutter_count",
        label: "防火シャッターの枚数（○枚）",
        type: "number",
        required: false,
        validation: (value: number) => value >= 0
    },
    // 耐火クロススクリーンの有無（チェックボックス）
    {
        id: "has_fireproof_screen",
        label: "耐火クロススクリーンの有無",
        type: "checkbox",
        required: false
    },
    // 耐火クロススクリーンの枚数（0以上の整数）
    {
        id: "fireproof_screen_count",
        label: "耐火クロススクリーンの枚数（○枚）",
        type: "number",
        required: false,
        validation: (value: number) => value >= 0
    },
    // ドレンチャーの有無（チェックボックス）
    {
        id: "has_drencher",
        label: "ドレンチャーの有無",
        type: "checkbox",
        required: false
    },
    // ドレンチャーの台数（0以上の整数）
    {
        id: "drencher_count",
        label: "ドレンチャーの台数（○台）",
        type: "number",
        required: false,
        validation: (value: number) => value >= 0
    },
    // その他防火設備の有無（チェックボックス）
    {
        id: "has_other_fire_equipment",
        label: "その他防火設備の有無",
        type: "checkbox",
        required: false
    },
    // その他防火設備の台数（0以上の整数）
    {
        id: "other_fire_equipment_count",
        label: "その他防火設備の台数（○台）",
        type: "number",
        required: false,
        validation: (value: number) => value >= 0
    }
];
