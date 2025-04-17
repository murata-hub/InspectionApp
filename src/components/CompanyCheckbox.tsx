import React, { useState } from "react";

const CompanyCheckbox = ({ company, selectedCompanies, toggleCompanySelection, isLast }) => {

    return (
        <div className={`flex items-center gap-4 ${isLast ? "" : "mb-2"}`}>
            {/* ✅ チェックボックス */}
            <input
                type="checkbox"
                checked={selectedCompanies.some((c) => c.id === company.id)}
                onChange={() => toggleCompanySelection(company)}
                className="w-5 h-5"
            />
            {/* ✅ 会社名 */}
            <span className="flex-1">{company.name}</span>
        </div>
    );
};

export default CompanyCheckbox;
