// components/InputField.tsx
import React from "react";

interface InputFieldProps {
    id: string;
    label: string;
    value: string | number | boolean;
    type?: string;
    required?: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
}

const InputField: React.FC<InputFieldProps> = ({
    id,
    label,
    value,
    type = "text",
    required = false,
    onChange,
    error
}) => {
    const isCheckbox = type === "checkbox";

    return (
        <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2" htmlFor={id}>
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                className={`${isCheckbox ? "w-5 h-5" : "w-full"} px-4 py-2 border rounded-lg`}
                type={type}
                id={id}
                {...(isCheckbox
                    ? { checked: Boolean(value) }
                    : { value: value as string | number })}
                onChange={onChange}
                required={required}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
};

export default InputField;
