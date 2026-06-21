type AdminDateFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  required?: boolean;
};

const inputClass =
  "w-full bg-[#0E0E0E] border border-[#2A2A2A] text-[#F7F4EE] px-3 py-2 text-sm focus:border-[#C6A15B] focus:outline-none";

export default function AdminDateField({ label, value, onChange, onClear, required }: AdminDateFieldProps) {
  return (
    <div>
      <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-2">
        {label}
        {required && <span className="text-[#C6A15B]"> *</span>}
      </label>
      <input
        type="date"
        value={value}
        required={required}
        onChange={e => onChange(e.target.value)}
        className={inputClass}
      />
      {value && onClear && (
        <button type="button" onClick={onClear} className="text-[#555] text-xs mt-1 hover:text-[#B8B8B8]">
          Clear
        </button>
      )}
    </div>
  );
}
