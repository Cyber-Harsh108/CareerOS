export default function Footer() {
  return (
    <footer className="border-t border-white/10 px-4 py-10 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
        <div>
          <h3 className="font-display text-xl font-bold text-white">CareerOS</h3>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            AI-powered career coaching with resume analysis, role pathways, progress tracking, and daily momentum.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">Product</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li><a href="#features" className="hover:text-accent">Features</a></li>
            <li><a href="#how-it-works" className="hover:text-accent">How It Works</a></li>
            <li><a href="#why-us" className="hover:text-accent">Why Choose Us</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">Built For</h4>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Students, job seekers, and early-career builders who want clarity, consistency, and a roadmap they can trust.
          </p>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl border-t border-white/10 pt-6 text-sm text-muted">
        Copyright 2026 CareerOS. All rights reserved.
      </div>
    </footer>
  )
}
