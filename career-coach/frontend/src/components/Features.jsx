const features = [
  {
    title: 'Resume Analysis',
    description:
      'Turn unstructured resume text into usable signals: skills, projects, domain fit, and experience level.',
  },
  {
    title: 'Skill Gap Detection',
    description:
      'See what is missing for each role so you can stop guessing and start working on the highest-value improvements.',
  },
  {
    title: 'Personalized Roadmap',
    description:
      'Get an actionable weekly plan with daily tasks instead of vague advice that never turns into momentum.',
  },
]

export default function Features() {
  return (
    <section id="features" className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 max-w-2xl">
          <p className="text-xs font-mono uppercase tracking-[0.25em] text-accent">Core Features</p>
          <h2 className="mt-4 font-display text-4xl font-bold text-white sm:text-5xl">
            Everything the product already does, now introduced the right way.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-300">
            Your backend and AI are the real engine here. The landing page should make those strengths obvious before the user even uploads a resume.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-white/8 to-white/4 p-8 transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-accent/10 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
              <p className="text-sm font-mono text-accent">0{index + 1}</p>
              <h3 className="mt-6 font-display text-2xl font-bold text-white">{feature.title}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
