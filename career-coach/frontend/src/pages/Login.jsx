import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../utils/api.js'

export default function Login() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    setLoading(true)
    setError('')
    try {
      const user = await login(name.trim(), email.trim())
      localStorage.setItem('userId', user.userId)
      localStorage.setItem('userName', user.name)
      navigate('/upload')
    } catch (err) {
      setError('Could not connect to server. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink bg-grid flex items-center justify-center px-4">
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-muted transition-colors hover:text-accent"
          >
            ← Back to home
          </Link>
        </div>

        {/* Logo mark */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <span className="text-accent text-lg">⚡</span>
          </div>
          <span className="font-display font-700 text-white text-xl tracking-tight">CareerOS</span>
        </div>

        <h1 className="font-display text-4xl font-800 text-white mb-2 leading-tight">
          Build your<br />
          <span className="text-accent glow-text">dream career.</span>
        </h1>
        <p className="text-muted text-sm mb-10">
          AI-powered pathways tailored to your skills and goals.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-muted uppercase tracking-widest mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Alex Johnson"
              className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-white placeholder-muted focus:outline-none focus:border-accent/50 transition-colors font-body text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-muted uppercase tracking-widest mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="alex@example.com"
              className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-white placeholder-muted focus:outline-none focus:border-accent/50 transition-colors font-body text-sm"
              required
            />
          </div>

          {error && (
            <p className="text-danger text-xs font-mono bg-danger/5 border border-danger/20 rounded-lg px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-ink font-display font-700 text-sm py-3.5 rounded-lg hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Connecting...' : 'Start My Journey →'}
          </button>
        </form>

        <p className="text-muted/50 text-xs mt-8 text-center">
          No password needed. Your progress is saved automatically.
        </p>
      </div>
    </div>
  )
}
