interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export default function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  className = "",
}: NumberFieldProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
        {label}
      </label>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${className}`}
      />
    </div>
  );
}
