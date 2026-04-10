const stats = [
  { value: 'Resume In', label: 'Upload a PDF and extract real text in-browser' },
  { value: '3 Paths', label: 'Compare career directions with tailored match scores' },
  { value: '4 Weeks', label: 'Receive a structured roadmap with daily tasks' },
]

export default function Stats() {
  return (
    <section className="px-4 py-6 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.value} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <p className="font-display text-4xl font-bold text-white">{stat.value}</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
