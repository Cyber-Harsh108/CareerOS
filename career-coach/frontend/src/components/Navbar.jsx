import { Link } from 'react-router-dom'

const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Why Us', href: '#why-us' },
  { label: 'Testimonials', href: '#testimonials' },
]

export default function Navbar() {
  const userId = localStorage.getItem('userId')

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <a href="#top" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-accent">
            AI
          </div>
          <div>
            <p className="font-display text-lg font-bold text-white">CareerOS</p>
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted">AI Career Coach</p>
          </div>
        </a>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm text-muted transition-colors hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to={userId ? '/upload' : '/login'}
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-white transition-colors hover:border-accent/40 hover:bg-white/5"
          >
            {userId ? 'Continue' : 'Login'}
          </Link>
          <Link
            to={userId ? '/upload' : '/login'}
            className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-ink transition-transform hover:scale-[1.02] hover:bg-accent/90"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  )
}
