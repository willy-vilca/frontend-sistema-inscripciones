export function FormSection({ title, children, description }) {
  return (
    <section className="border-b border-slate-200 px-6 py-8 last:border-b-0">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-950">{title}</h3>
        {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
      </div>
      {children}
    </section>
  )
}
