import React from "react";

type FormFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  error?: string;
};

const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
  className = "",
  error,
}) => {
  return (
    <div className={`flex flex-col ${className}`}>
      <label className={`mb-1 font-semibold ${error ? "text-red-700" : ""}`}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`p-2 border rounded focus:outline-none focus:ring-2 ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:ring-blue-500"
        }`}
      />
      {error && <span className="mt-1 text-sm text-red-600">{error}</span>}
    </div>
  );
};

export default FormField;
