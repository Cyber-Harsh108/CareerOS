const steps = [
  {
    title: 'Upload Resume',
    description: 'Drop in your PDF resume and let the app extract the text directly in the browser.',
  },
  {
    title: 'AI Analysis',
    description: 'The backend and model identify your skills, projects, domain, and likely experience level.',
  },
  {
    title: 'Choose Your Path',
    description: 'Compare role matches and inspect what each 4-week roadmap focuses on before you commit.',
  },
  {
    title: 'Execute Daily',
    description: 'Track tasks, streaks, system goals, custom goals, and AI next-best-action recommendations.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-white/10 bg-white/5 p-8 sm:p-10">
        <div className="mb-12 max-w-2xl">
          <p className="text-xs font-mono uppercase tracking-[0.25em] text-accent">How It Works</p>
          <h2 className="mt-4 font-display text-4xl font-bold text-white">A smooth journey from resume to roadmap.</h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.title} className="rounded-[1.5rem] border border-white/10 bg-ink/60 p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-ink">
                {index + 1}
              </div>
              <h3 className="font-display text-xl font-bold text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
