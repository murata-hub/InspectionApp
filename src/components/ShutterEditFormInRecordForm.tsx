"use client";

import React, { useState } from "react";
import { Shutter, shutterFields } from "@/types/shutter";
import InputField from "@/components/InputField";

const ShutterEditFormInRecordForm = ({
    formData,
    errors,
    onChange
}: {
    formData: Shutter;
    errors: { [key: string]: string | null };
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}) => {
    const shutterFormFields = shutterFields.slice(1);

    return (
        <form>
            {shutterFormFields.map((field) => (
                <InputField
                    key={field.id}
                    id={field.id}
                    label={field.label}
                    value={formData[field.id as keyof Shutter] as string | number | boolean}
                    type={field.type || "text"}
                    required={field.required}
                    onChange={onChange}
                    error={errors[field.id] || undefined}
                />
            ))}
        </form>
    );
};

export default ShutterEditFormInRecordForm;
