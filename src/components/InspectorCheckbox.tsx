import React from "react";

const InspectorCheckbox = ({ inspector, selectedInspectors, toggleInspectorSelection, updateInspectorShift, isLast }) => {
    const isSelected = selectedInspectors.some((w) => w.id === inspector.id);

    return (
        <div className={`flex items-center gap-4 ${isLast ? "" : "mb-2"}`}>
            <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleInspectorSelection(inspector)}
                className="w-5 h-5"
            />
            <span className="flex-1">{inspector.name}</span>
            <span className="flex-1">{inspector.employment_type}</span>
            {/* <select
                className="w-1/3 px-4 py-2 border rounded-lg"
                value={selectedInspectors.find((w) => w.id === inspector.id)?.shift || ""}
                onChange={(e) => updateInspectorShift(inspector.id, e.target.value)}
                disabled={!isSelected}
            >
                <option value="">シフトを選択</option>
                <option value="day">日勤</option>
                <option value="night">夜勤</option>
                <option value="weekend">週末</option>
                <option value="holiday">休日</option>
            </select> */}
        </div>
    );
};

export default InspectorCheckbox;
