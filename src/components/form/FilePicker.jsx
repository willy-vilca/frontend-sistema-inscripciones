import { Upload } from 'lucide-react'

export function FilePicker({ label, accept, file, onChange, required }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required ? <span className="text-red-700"> *</span> : null}
      </span>
      <div className="flex min-h-12 overflow-hidden rounded-md border border-slate-300 bg-white">
        <div className="flex flex-1 items-center px-4 text-sm text-slate-600">
          <span className="truncate">{file ? file.name : 'Seleccione un documento'}</span>
        </div>
        <span className="inline-flex items-center gap-2 bg-slate-100 px-4 text-sm font-semibold text-slate-700">
          <Upload size={17} aria-hidden="true" />
          Buscar
        </span>
      </div>
      <input
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
    </label>
  )
}
