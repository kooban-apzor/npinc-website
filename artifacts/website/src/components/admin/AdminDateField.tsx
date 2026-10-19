type AdminDateFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  required?: boolean;
};

const inputClass =
  "w-full bg-ink border border-line text-paper px-3 py-2 text-sm focus:border-brand focus:outline-none";

export default function AdminDateField({ label, value, onChange, onClear, required }: AdminDateFieldProps) {
  return (
    <div>
      <label className="block text-fog text-xs uppercase tracking-widest mb-2">
        {label}
        {required && <span className="text-brand"> *</span>}
      </label>
      <input
        type="date"
        value={value}
        required={required}
        onChange={e => onChange(e.target.value)}
        className={inputClass}
      />
      {value && onClear && (
        <button type="button" onClick={onClear} className="text-fog/60 text-xs mt-1 hover:text-fog">
          Clear
        </button>
      )}
    </div>
  );
}
