"use client";

import React, { useEffect, useState } from "react";

const CompanySelection = ({ selectedCompany, setSelectedCompany, permittedCompanies }) => {
    // ✅ 会社の選択変更
    const handleCompanyChange = (e) => {
        const selectedCompanyId = e.target.value;
        const selectedCompanyData = permittedCompanies.find((c) => c.id === selectedCompanyId);
        setSelectedCompany(selectedCompanyData || null);
    };

    return (
        <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">協力会社を選択<span className="text-red-500">*</span></label>
            <select
                className="w-full px-4 py-2 border rounded-lg"
                value={selectedCompany?.id || ""}
                onChange={handleCompanyChange}
            >
                <option value="" disabled>
                    協力会社を選択してください
                </option>
                {permittedCompanies.map((company) => (
                    <option key={company.id} value={company.id}>
                        {company.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default CompanySelection;
