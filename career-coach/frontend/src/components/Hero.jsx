import { Link } from 'react-router-dom'

export default function Hero() {
  const userId = localStorage.getItem('userId')
  const primaryHref = userId ? '/upload' : '/login'

  return (
    <section id="top" className="relative overflow-hidden px-4 pb-24 pt-16 sm:px-6 sm:pt-24">
      <div className="absolute left-[-10%] top-10 h-72 w-72 rounded-full bg-accent/15 blur-[120px]" />
      <div className="absolute right-[-5%] top-32 h-80 w-80 rounded-full bg-cyan-400/10 blur-[140px]" />

      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative z-10">
          <p className="mb-5 inline-flex rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-xs font-mono uppercase tracking-[0.25em] text-accent">
            Personalized AI Career Guidance
          </p>
          <h1 className="max-w-3xl font-display text-5xl font-extrabold leading-[0.95] text-white sm:text-6xl lg:text-7xl">
            Turn your resume into a clear path toward your next role.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            CareerOS analyzes your current profile, spots the skill gaps holding you back, and builds a focused roadmap with daily momentum.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              to={primaryHref}
              className="rounded-full bg-accent px-7 py-3 text-center font-display text-sm font-bold uppercase tracking-[0.15em] text-ink transition-transform hover:scale-[1.02] hover:bg-accent/90"
            >
              Start Your Journey
            </Link>
            <a
              href="#how-it-works"
              className="rounded-full border border-white/10 px-7 py-3 text-center text-sm font-semibold text-white transition-colors hover:border-accent/30 hover:bg-white/5"
            >
              See How It Works
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-300">
            <div>
              <span className="block font-display text-2xl font-bold text-white">PDF In</span>
              <span>Resume upload with browser-side extraction</span>
            </div>
            <div>
              <span className="block font-display text-2xl font-bold text-white">3 Roles</span>
              <span>AI-generated pathways to compare and choose from</span>
            </div>
            <div>
              <span className="block font-display text-2xl font-bold text-white">Daily Focus</span>
              <span>Tasks, streaks, badges, and next best actions</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-accent/20 to-cyan-400/10 blur-3xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-mono uppercase tracking-[0.2em] text-accent">AI Snapshot</p>
                <h2 className="mt-2 font-display text-2xl font-bold text-white">Career fit intelligence</h2>
              </div>
              <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-mono text-accent">
                Live roadmap
              </span>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-ink/70 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">Resume Analysis</p>
                  <span className="text-xs font-mono text-accent">skills mapped</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['React', 'Python', 'SQL', 'Problem Solving', 'APIs'].map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-mono text-accent"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-ink/70 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">Recommended Path</p>
                  <span className="text-xs font-mono text-white">82% match</span>
                </div>
                <div className="progress-bar mb-3">
                  <div className="progress-bar-fill" style={{ width: '82%' }} />
                </div>
                <p className="text-sm text-slate-300">
                  Full Stack Web Developer with a 4-week roadmap focused on React depth, backend integration, and interview readiness.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-ink/70 p-4">
                  <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted">Missing Skills</p>
                  <p className="mt-2 text-sm text-white">System design, testing strategy, deployment workflows</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-ink/70 p-4">
                  <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted">Next Best Action</p>
                  <p className="mt-2 text-sm text-white">Finish two week-one tasks today to lock in your streak.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
