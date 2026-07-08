export function FormField({ label, children, required }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required ? <span className="text-red-700"> *</span> : null}
      </span>
      {children}
    </label>
  )
}
