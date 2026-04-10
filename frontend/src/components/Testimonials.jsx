const testimonials = [
  {
    quote: 'The roadmap made my preparation finally feel manageable. I stopped jumping between random tutorials and actually made progress.',
    name: 'Rahul Sharma',
    role: 'Aspiring Software Engineer',
  },
  {
    quote: 'What stood out was the clarity. I could instantly see my strongest path and the exact gaps I needed to close.',
    name: 'Priya Verma',
    role: 'Full Stack Candidate',
  },
  {
    quote: 'The daily structure and streak tracking kept me consistent, which mattered more than motivation alone.',
    name: 'Amit Kumar',
    role: 'Campus Placement Prep',
  },
]

export default function Testimonials() {
  return (
    <section id="testimonials" className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <p className="text-xs font-mono uppercase tracking-[0.25em] text-accent">Testimonials</p>
          <h2 className="mt-4 font-display text-4xl font-bold text-white">What students feel after the chaos disappears.</h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {testimonials.map((item) => (
            <div key={item.name} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-8">
              <p className="text-4xl text-accent">"</p>
              <p className="mt-4 text-sm leading-7 text-slate-200">{item.quote}</p>
              <div className="mt-8">
                <p className="font-display text-lg font-bold text-white">{item.name}</p>
                <p className="text-sm text-muted">{item.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
