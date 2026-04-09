const reasons = [
  'Roadmaps are tailored to your existing profile instead of generic learning advice.',
  'Skill gaps are shown clearly so users know what is blocking each role.',
  'The dashboard keeps people moving with streaks, goals, and visible progress.',
  'The AI coach adds guidance on top of a stable rules-based product flow.',
]

export default function WhyChooseUs() {
  return (
    <section id="why-us" className="px-4 py-24 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.25em] text-accent">Why Choose Us</p>
          <h2 className="mt-4 font-display text-4xl font-bold text-white">Built for focused career progress, not just flashy AI output.</h2>
          <p className="mt-4 text-base leading-7 text-slate-300">
            The product already has a strong engine. This front-end introduction should communicate trust, clarity, and ambition before the user starts.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {reasons.map((reason, index) => (
            <div key={reason} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
              <p className="text-sm font-mono text-accent">0{index + 1}</p>
              <p className="mt-4 text-sm leading-7 text-slate-200">{reason}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
