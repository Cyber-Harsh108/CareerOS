import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getProgress, toggleTask, addCustomGoal,
  updateCustomGoal, getAgentDecision
} from '../utils/api.js'

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon }) {
  return (
    <div className="card-base p-5 flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-xl flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="font-display font-800 text-white text-2xl leading-none">{value}</p>
        <p className="text-muted text-xs mt-1">{label}</p>
        {sub && <p className="text-accent text-xs font-mono mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function TaskItem({ task, onToggle }) {
  return (
    <div
      className={`flex items-start gap-3 py-3 px-4 rounded-lg cursor-pointer transition-all group
        ${task.completed ? 'bg-accent/5 border border-accent/15' : 'hover:bg-surface border border-transparent'}`}
      onClick={() => onToggle(task.taskId, !task.completed)}
    >
      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all
        ${task.completed ? 'bg-accent border-accent' : 'border-border group-hover:border-accent/50'}`}>
        {task.completed && (
          <svg className="w-3 h-3 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${task.completed ? 'text-muted line-through' : 'text-white'}`}>
          {task.title}
        </p>
        <p className="text-xs font-mono text-muted/60 mt-0.5">Day {task.day}</p>
      </div>
    </div>
  )
}

function AgentPanel({ pathwayId }) {
  const [decision, setDecision] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const d = await getAgentDecision(pathwayId)
      setDecision(d)
    } catch {}
    setLoading(false)
  }, [pathwayId])

  const priorityColor = {
    urgent: 'border-danger/30 bg-danger/5',
    high: 'border-warn/30 bg-warn/5',
    normal: 'border-accent/30 bg-accent/5',
    low: 'border-accent/30 bg-accent/5',
    medium: 'border-warn/30 bg-warn/5',
  }

  const priorityIcon = {
    urgent: '🚨', high: '⚠️', normal: '✅', low: '🚀', medium: '💡',
  }

  return (
    <div className="card-base p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-700 text-white">Next Best Action</h3>
          <p className="text-muted text-xs mt-0.5">AI-powered recommendation engine</p>
        </div>
        <button
          onClick={fetch}
          disabled={loading}
          className="text-xs font-mono bg-accent/10 border border-accent/20 text-accent px-4 py-2 rounded-lg hover:bg-accent/20 transition-all disabled:opacity-50"
        >
          {loading ? '⟳ Thinking…' : '⚡ Ask Coach'}
        </button>
      </div>

      {decision ? (
        <div className={`rounded-xl border p-4 ${priorityColor[decision.priority] || 'border-border bg-surface'}`}>
          <div className="flex items-start gap-3">
            <span className="text-xl">{priorityIcon[decision.priority] || '💬'}</span>
            <div>
              <p className="text-white text-sm font-display font-600 leading-snug">
                {decision.llmExplanation || decision.message}
              </p>
              {decision.llmExplanation && decision.message !== decision.llmExplanation && (
                <p className="text-muted text-xs mt-2 font-mono">
                  Rule: {decision.message}
                </p>
              )}
              {decision.stats && (
                <div className="flex gap-4 mt-3">
                  <span className="text-xs font-mono text-muted">
                    completion: <span className="text-white">{Math.round((decision.stats.completionRate || 0) * 100)}%</span>
                  </span>
                  <span className="text-xs font-mono text-muted">
                    streak: <span className="text-accent">{decision.stats.streak || 0}d</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-border p-4 text-center">
          <p className="text-muted text-sm">Click "Ask Coach" to get your personalized action.</p>
        </div>
      )}
    </div>
  )
}

function AchievementBadge({ achievement }) {
  return (
    <div className="flex items-center gap-3 bg-surface border border-border rounded-xl p-3">
      <span className="text-2xl">{achievement.icon || '🏅'}</span>
      <div>
        <p className="text-white text-sm font-display font-600">{achievement.title}</p>
        <p className="text-muted text-xs">{achievement.description}</p>
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const { pathwayId } = useParams()
  const navigate = useNavigate()
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeWeek, setActiveWeek] = useState(1)
  const [newGoalText, setNewGoalText] = useState('')
  const [addingGoal, setAddingGoal] = useState(false)
  const [tab, setTab] = useState('tasks') // tasks | goals | achievements

  const load = useCallback(async () => {
    try {
      const data = await getProgress(pathwayId)
      setProgress(data)
      // Auto-select current week (first week with incomplete tasks)
      const incomplete = data.systemTasks?.find(t => !t.completed)
      if (incomplete) setActiveWeek(incomplete.week)
    } catch {
      navigate('/')
    } finally {
      setLoading(false)
    }
  }, [pathwayId, navigate])

  useEffect(() => { load() }, [load])

  async function handleToggleTask(taskId, completed) {
    try {
      const updated = await toggleTask(taskId, completed)
      setProgress(updated)
    } catch {}
  }

  async function handleAddGoal(e) {
    e.preventDefault()
    if (!newGoalText.trim()) return
    setAddingGoal(true)
    try {
      const updated = await addCustomGoal(pathwayId, newGoalText.trim())
      setProgress(updated)
      setNewGoalText('')
    } catch {}
    setAddingGoal(false)
  }

  async function handleToggleCustomGoal(goalId, completed) {
    try {
      const updated = await updateCustomGoal(goalId, completed)
      setProgress(updated)
    } catch {}
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
      </div>
    )
  }

  if (!progress) return null

  const tasks = progress.systemTasks || []
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.completed).length
  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const weeks = [...new Set(tasks.map(t => t.week))].sort()
  const weekTasks = tasks.filter(t => t.week === activeWeek)

  const streak = progress.streak || { current: 0, longest: 0 }

  return (
    <div className="min-h-screen bg-ink bg-grid pb-16">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[200px] bg-accent/4 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 pt-8">
        {/* Top nav */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <span className="text-accent">⚡</span>
            <span className="font-display font-700 text-white">CareerOS</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-muted">
              {localStorage.getItem('userName')}
            </span>
            <button
              onClick={() => { localStorage.clear(); navigate('/') }}
              className="text-xs text-muted hover:text-white transition-colors font-mono"
            >
              logout
            </button>
          </div>
        </div>

        {/* Role header */}
        <div className="mb-8">
          <p className="text-xs font-mono text-accent uppercase tracking-widest mb-1">Active Pathway</p>
          <h1 className="font-display text-3xl font-800 text-white">{progress.roleTitle}</h1>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Tasks done" value={`${completedTasks}/${totalTasks}`} sub={`${completionPct}% complete`} icon="✅" />
          <StatCard label="Current streak" value={`${streak.current}d`} sub={`Best: ${streak.longest}d`} icon="🔥" />
          <StatCard label="Achievements" value={progress.achievements?.length || 0} icon="🏆" />
          <StatCard label="Goals" value={(progress.systemGoals?.filter(g => g.achieved).length || 0) + '/' + (progress.systemGoals?.length || 0)} sub="system goals" icon="🎯" />
        </div>

        {/* Overall progress bar */}
        <div className="card-base p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-display font-600 text-white">Overall Progress</span>
            <span className="text-accent font-mono text-sm">{completionPct}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${completionPct}%` }} />
          </div>
        </div>

        {/* Agent panel */}
        <div className="mb-6">
          <AgentPanel pathwayId={pathwayId} />
        </div>

        {/* Tab nav */}
        <div className="flex gap-1 mb-6 bg-surface border border-border rounded-xl p-1 w-fit">
          {['tasks', 'goals', 'achievements'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-display font-600 transition-all capitalize ${
                tab === t ? 'bg-accent text-ink' : 'text-muted hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── Tasks Tab ── */}
        {tab === 'tasks' && (
          <div className="grid md:grid-cols-4 gap-6">
            {/* Week selector */}
            <div className="md:col-span-1 space-y-2">
              {weeks.map(w => {
                const wTasks = tasks.filter(t => t.week === w)
                const wDone = wTasks.filter(t => t.completed).length
                const pct = Math.round((wDone / wTasks.length) * 100)
                return (
                  <button
                    key={w}
                    onClick={() => setActiveWeek(w)}
                    className={`w-full text-left card-base p-4 transition-all ${
                      activeWeek === w ? 'border-accent/40 bg-accent/5' : 'hover:bg-surface/50'
                    }`}
                  >
                    <p className="text-sm font-display font-600 text-white mb-2">Week {w}</p>
                    <div className="progress-bar mb-1">
                      <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs font-mono text-muted">{wDone}/{wTasks.length}</p>
                  </button>
                )
              })}
            </div>

            {/* Task list */}
            <div className="md:col-span-3 card-base p-4">
              <h3 className="font-display font-700 text-white text-lg mb-4 px-2">
                Week {activeWeek} Tasks
              </h3>
              <div className="space-y-1">
                {weekTasks.map(task => (
                  <TaskItem key={task.taskId} task={task} onToggle={handleToggleTask} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Goals Tab ── */}
        {tab === 'goals' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* System goals */}
            <div className="card-base p-5">
              <h3 className="font-display font-700 text-white mb-4">System Goals</h3>
              <div className="space-y-3">
                {progress.systemGoals?.map(goal => (
                  <div key={goal.goalId} className={`flex items-center gap-3 p-3 rounded-lg border ${
                    goal.achieved ? 'border-accent/20 bg-accent/5' : 'border-border'
                  }`}>
                    <span className={`text-lg ${goal.achieved ? '' : 'grayscale opacity-40'}`}>
                      {goal.achieved ? '✅' : '⏳'}
                    </span>
                    <div>
                      <p className={`text-sm ${goal.achieved ? 'text-white' : 'text-muted'}`}>
                        {goal.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom goals */}
            <div className="card-base p-5">
              <h3 className="font-display font-700 text-white mb-4">My Goals</h3>

              {/* Add goal form */}
              <form onSubmit={handleAddGoal} className="flex gap-2 mb-4">
                <input
                  value={newGoalText}
                  onChange={e => setNewGoalText(e.target.value)}
                  placeholder="Add a personal goal…"
                  className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-white placeholder-muted focus:outline-none focus:border-accent/50 transition-colors"
                />
                <button
                  type="submit"
                  disabled={addingGoal}
                  className="bg-accent text-ink px-4 py-2 rounded-lg text-sm font-display font-700 hover:bg-accent/90 transition-all disabled:opacity-50"
                >
                  +
                </button>
              </form>

              <div className="space-y-2">
                {progress.customGoals?.length === 0 && (
                  <p className="text-muted text-sm text-center py-4">No custom goals yet.</p>
                )}
                {progress.customGoals?.map(goal => (
                  <div
                    key={goal.goalId}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      goal.completed ? 'border-accent/20 bg-accent/5' : 'border-border hover:bg-surface'
                    }`}
                    onClick={() => handleToggleCustomGoal(goal.goalId, !goal.completed)}
                  >
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                      goal.completed ? 'bg-accent border-accent' : 'border-border'
                    }`}>
                      {goal.completed && (
                        <svg className="w-3 h-3 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <p className={`text-sm flex-1 ${goal.completed ? 'text-muted line-through' : 'text-white'}`}>
                      {goal.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Achievements Tab ── */}
        {tab === 'achievements' && (
          <div>
            {progress.achievements?.length === 0 ? (
              <div className="card-base p-12 text-center">
                <p className="text-4xl mb-4">🔒</p>
                <p className="font-display font-700 text-white text-lg mb-2">No achievements yet</p>
                <p className="text-muted text-sm">Complete tasks to unlock your first badge!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-4">
                {progress.achievements.map(a => (
                  <AchievementBadge key={a.id} achievement={a} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
