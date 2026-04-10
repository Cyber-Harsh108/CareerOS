import { Link, useNavigate } from 'react-router-dom'

const landingNavItems = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Why Us', href: '#why-us' },
  { label: 'Testimonials', href: '#testimonials' },
]

const appNavItems = [
  { label: 'Home', to: '/' },
  { label: 'Upload', to: '/upload' },
]

export default function Navbar({ variant = 'landing' }) {
  const navigate = useNavigate()
  const userId = localStorage.getItem('userId')
  const userName = localStorage.getItem('userName')

  function handleLogout() {
    localStorage.clear()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        {variant === 'landing' ? (
          <a href="#top" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-accent">
              AI
            </div>
            <div>
              <p className="font-display text-lg font-bold text-white">CareerOS</p>
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted">AI Career Coach</p>
            </div>
          </a>
        ) : (
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-accent">
              AI
            </div>
            <div>
              <p className="font-display text-lg font-bold text-white">CareerOS</p>
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-muted">AI Career Coach</p>
            </div>
          </Link>
        )}

        <nav className="hidden items-center gap-6 md:flex">
          {(variant === 'landing' ? landingNavItems : appNavItems).map((item) =>
            variant === 'landing' ? (
              <a
                key={item.label}
                href={item.href}
                className="text-sm text-muted transition-colors hover:text-white"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.label}
                to={item.to}
                className="text-sm text-muted transition-colors hover:text-white"
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-3">
          {userId && variant === 'app' && userName ? (
            <span className="hidden text-xs font-mono uppercase tracking-[0.15em] text-muted sm:inline">
              {userName}
            </span>
          ) : null}

          {userId ? (
            <>
              <Link
                to="/upload"
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-white transition-colors hover:border-accent/40 hover:bg-white/5"
              >
                Continue
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-ink transition-transform hover:scale-[1.02] hover:bg-accent/90"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-white transition-colors hover:border-accent/40 hover:bg-white/5"
              >
                Login
              </Link>
              <Link
                to="/login"
                className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-ink transition-transform hover:scale-[1.02] hover:bg-accent/90"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
