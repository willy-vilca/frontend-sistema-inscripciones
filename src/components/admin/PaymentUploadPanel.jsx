import { useRef, useState } from 'react'
import { FileSpreadsheet, Upload } from 'lucide-react'

export function PaymentUploadPanel({ onUpload, uploading }) {
  const inputRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)

  const handleSubmit = (event) => {
    event.preventDefault()
    if (selectedFile) {
      onUpload(selectedFile)
    }
  }

  return (
    <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-red-50 text-red-700">
              <FileSpreadsheet size={21} aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-950">Importar pagos del banco</h3>
              <p className="text-sm text-slate-600">
                Sube el archivo Excel con la columna Nro Movimiento para validar inscripciones.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3 md:w-auto md:min-w-[360px]">
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
          />

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex min-h-11 items-center justify-between rounded-md border border-slate-300 bg-white px-4 py-2 text-left text-sm text-slate-700 transition hover:border-slate-500"
          >
            <span className="truncate">
              {selectedFile ? selectedFile.name : 'Seleccionar archivo Excel'}
            </span>
            <FileSpreadsheet size={18} aria-hidden="true" />
          </button>

          <button
            type="submit"
            disabled={!selectedFile || uploading}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <Upload size={18} aria-hidden="true" />
            {uploading ? 'Importando...' : 'Importar pagos'}
          </button>
        </form>
      </div>
    </section>
  )
}
