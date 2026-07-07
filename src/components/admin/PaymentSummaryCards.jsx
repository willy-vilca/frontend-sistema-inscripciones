import { CheckCircle2, CircleDollarSign, Clock3 } from 'lucide-react'

const cards = [
  {
    key: 'totalPagos',
    label: 'Pagos importados',
    icon: CircleDollarSign,
    tone: 'bg-slate-900 text-white',
  },
  {
    key: 'pagosDisponibles',
    label: 'Disponibles',
    icon: CheckCircle2,
    tone: 'bg-emerald-600 text-white',
  },
  {
    key: 'pagosUsados',
    label: 'Usados',
    icon: Clock3,
    tone: 'bg-red-700 text-white',
  },
]

export function PaymentSummaryCards({ summary }) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <article
            key={card.key}
            className="rounded-md border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">{card.label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-950">
                  {summary?.[card.key] ?? 0}
                </p>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-md ${card.tone}`}>
                <Icon size={22} aria-hidden="true" />
              </div>
            </div>
          </article>
        )
      })}
    </section>
  )
}
