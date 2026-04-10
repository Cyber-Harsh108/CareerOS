import { Link } from 'react-router-dom'

export default function CTA() {
  const userId = localStorage.getItem('userId')
  const href = userId ? '/upload' : '/login'

  return (
    <section className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-accent/20 bg-gradient-to-r from-accent/15 via-white/5 to-cyan-400/10 p-10 text-center sm:p-14">
        <p className="text-xs font-mono uppercase tracking-[0.25em] text-accent">Start Now</p>
        <h2 className="mt-4 font-display text-4xl font-bold text-white sm:text-5xl">
          Ready to turn your resume into a plan you can actually follow?
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300">
          Keep the backend, keep the AI, and give the product the first impression it deserves.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            to={href}
            className="rounded-full bg-accent px-8 py-3 font-display text-sm font-bold uppercase tracking-[0.15em] text-ink transition-transform hover:scale-[1.02] hover:bg-accent/90"
          >
            Get Started
          </Link>
        </div>
      </div>
    </section>
  )
}
