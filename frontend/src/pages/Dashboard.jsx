import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import {
  getProgress, toggleTask, addCustomGoal,
  updateCustomGoal, getAgentDecision
} from '../utils/api.js'

function StatCard({ label, value, sub, icon }) {
  return (
    <div className="card-base flex items-start gap-4 p-5">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-xl">
        {icon}
      </div>
      <div>
        <p className="font-display text-2xl font-800 leading-none text-white">{value}</p>
        <p className="mt-1 text-xs text-muted">{label}</p>
        {sub ? <p className="mt-0.5 font-mono text-xs text-accent">{sub}</p> : null}
      </div>
    </div>
  )
}

function TaskItem({ task, onToggle }) {
  return (
    <div
      className={`group flex cursor-pointer items-start gap-3 rounded-lg px-4 py-3 transition-all ${
        task.completed ? 'border border-accent/15 bg-accent/5' : 'border border-transparent hover:bg-surface'
      }`}
      onClick={() => onToggle(task.taskId, !task.completed)}
    >
      <div
        className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all ${
          task.completed ? 'border-accent bg-accent' : 'border-border group-hover:border-accent/50'
        }`}
      >
        {task.completed ? (
          <svg className="h-3 w-3 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm ${task.completed ? 'text-muted line-through' : 'text-white'}`}>
          {task.title}
        </p>
        <p className="mt-0.5 font-mono text-xs text-muted/60">Day {task.day}</p>
      </div>
    </div>
  )
}

function AgentPanel({ pathwayId }) {
  const [decision, setDecision] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchDecision = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAgentDecision(pathwayId)
      setDecision(data)
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
    urgent: 'Alert',
    high: 'Focus',
    normal: 'On Track',
    low: 'Boost',
    medium: 'Coach',
  }

  return (
    <div className="card-base p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-display font-700 text-white">Next Best Action</h3>
          <p className="mt-0.5 text-xs text-muted">AI-powered recommendation engine</p>
        </div>
        <button
          onClick={fetchDecision}
          disabled={loading}
          className="rounded-lg border border-accent/20 bg-accent/10 px-4 py-2 text-xs font-mono text-accent transition-all hover:bg-accent/20 disabled:opacity-50"
        >
          {loading ? 'Thinking...' : 'Ask Coach'}
        </button>
      </div>

      {decision ? (
        <div className={`rounded-xl border p-4 ${priorityColor[decision.priority] || 'border-border bg-surface'}`}>
          <div className="flex items-start gap-3">
            <span className="text-xs font-mono uppercase tracking-[0.15em] text-accent">
              {priorityIcon[decision.priority] || 'Coach'}
            </span>
            <div>
              <p className="font-display text-sm font-600 leading-snug text-white">
                {decision.llmExplanation || decision.message}
              </p>
              {decision.llmExplanation && decision.message !== decision.llmExplanation ? (
                <p className="mt-2 font-mono text-xs text-muted">Rule: {decision.message}</p>
              ) : null}
              {decision.stats ? (
                <div className="mt-3 flex gap-4">
                  <span className="font-mono text-xs text-muted">
                    completion: <span className="text-white">{Math.round((decision.stats.completionRate || 0) * 100)}%</span>
                  </span>
                  <span className="font-mono text-xs text-muted">
                    streak: <span className="text-accent">{decision.stats.streak || 0}d</span>
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface p-4 text-center">
          <p className="text-sm text-muted">Click &quot;Ask Coach&quot; to get your personalized action.</p>
        </div>
      )}
    </div>
  )
}

function AchievementBadge({ achievement }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
      <span className="text-2xl">{achievement.icon || 'Badge'}</span>
      <div>
        <p className="font-display text-sm font-600 text-white">{achievement.title}</p>
        <p className="text-xs text-muted">{achievement.description}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { pathwayId } = useParams()
  const navigate = useNavigate()
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeWeek, setActiveWeek] = useState(1)
  const [newGoalText, setNewGoalText] = useState('')
  const [addingGoal, setAddingGoal] = useState(false)
  const [tab, setTab] = useState('tasks')

  const load = useCallback(async () => {
    try {
      const data = await getProgress(pathwayId)
      setProgress(data)
      const incomplete = data.systemTasks?.find((task) => !task.completed)
      if (incomplete) setActiveWeek(incomplete.week)
    } catch {
      navigate('/')
    } finally {
      setLoading(false)
    }
  }, [pathwayId, navigate])

  useEffect(() => {
    load()
  }, [load])

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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent/20 border-t-accent" />
      </div>
    )
  }

  if (!progress) return null

  const tasks = progress.systemTasks || []
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.completed).length
  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const weeks = [...new Set(tasks.map((task) => task.week))].sort()
  const weekTasks = tasks.filter((task) => task.week === activeWeek)
  const streak = progress.streak || { current: 0, longest: 0 }

  return (
    <div className="min-h-screen bg-ink bg-grid pb-16">
      <Navbar variant="app" />
      <div className="pointer-events-none fixed top-0 left-1/2 h-[200px] w-[700px] -translate-x-1/2 rounded-full bg-accent/4 blur-[120px]" />

      <div className="mx-auto max-w-5xl px-4 pt-8">
        <div className="mb-8">
          <p className="mb-1 text-xs font-mono uppercase tracking-widest text-accent">Active Pathway</p>
          <h1 className="font-display text-3xl font-800 text-white">{progress.roleTitle}</h1>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Tasks done" value={`${completedTasks}/${totalTasks}`} sub={`${completionPct}% complete`} icon="Done" />
          <StatCard label="Current streak" value={`${streak.current}d`} sub={`Best: ${streak.longest}d`} icon="Fire" />
          <StatCard label="Achievements" value={progress.achievements?.length || 0} icon="Badge" />
          <StatCard
            label="Goals"
            value={`${progress.systemGoals?.filter((goal) => goal.achieved).length || 0}/${progress.systemGoals?.length || 0}`}
            sub="system goals"
            icon="Goal"
          />
        </div>

        <div className="card-base mb-6 p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-display font-600 text-white">Overall Progress</span>
            <span className="font-mono text-sm text-accent">{completionPct}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${completionPct}%` }} />
          </div>
        </div>

        <div className="mb-6">
          <AgentPanel pathwayId={pathwayId} />
        </div>

        <div className="mb-6 flex w-fit gap-1 rounded-xl border border-border bg-surface p-1">
          {['tasks', 'goals', 'achievements'].map((item) => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={`rounded-lg px-5 py-2 text-sm font-display font-600 capitalize transition-all ${
                tab === item ? 'bg-accent text-ink' : 'text-muted hover:text-white'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {tab === 'tasks' ? (
          <div className="grid gap-6 md:grid-cols-4">
            <div className="space-y-2 md:col-span-1">
              {weeks.map((week) => {
                const currentWeekTasks = tasks.filter((task) => task.week === week)
                const weekDone = currentWeekTasks.filter((task) => task.completed).length
                const pct = Math.round((weekDone / currentWeekTasks.length) * 100)

                return (
                  <button
                    key={week}
                    onClick={() => setActiveWeek(week)}
                    className={`card-base w-full p-4 text-left transition-all ${
                      activeWeek === week ? 'border-accent/40 bg-accent/5' : 'hover:bg-surface/50'
                    }`}
                  >
                    <p className="mb-2 text-sm font-display font-600 text-white">Week {week}</p>
                    <div className="progress-bar mb-1">
                      <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs font-mono text-muted">{weekDone}/{currentWeekTasks.length}</p>
                  </button>
                )
              })}
            </div>

            <div className="card-base p-4 md:col-span-3">
              <h3 className="mb-4 px-2 text-lg font-display font-700 text-white">Week {activeWeek} Tasks</h3>
              <div className="space-y-1">
                {weekTasks.map((task) => (
                  <TaskItem key={task.taskId} task={task} onToggle={handleToggleTask} />
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {tab === 'goals' ? (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="card-base p-5">
              <h3 className="mb-4 font-display font-700 text-white">System Goals</h3>
              <div className="space-y-3">
                {progress.systemGoals?.map((goal) => (
                  <div
                    key={goal.goalId}
                    className={`flex items-center gap-3 rounded-lg border p-3 ${
                      goal.achieved ? 'border-accent/20 bg-accent/5' : 'border-border'
                    }`}
                  >
                    <span className={`text-lg ${goal.achieved ? '' : 'grayscale opacity-40'}`}>
                      {goal.achieved ? 'Done' : 'Soon'}
                    </span>
                    <div>
                      <p className={`text-sm ${goal.achieved ? 'text-white' : 'text-muted'}`}>{goal.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-base p-5">
              <h3 className="mb-4 font-display font-700 text-white">My Goals</h3>

              <form onSubmit={handleAddGoal} className="mb-4 flex gap-2">
                <input
                  value={newGoalText}
                  onChange={(e) => setNewGoalText(e.target.value)}
                  placeholder="Add a personal goal..."
                  className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-white placeholder-muted transition-colors focus:border-accent/50 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={addingGoal}
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-display font-700 text-ink transition-all hover:bg-accent/90 disabled:opacity-50"
                >
                  +
                </button>
              </form>

              <div className="space-y-2">
                {progress.customGoals?.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted">No custom goals yet.</p>
                ) : null}
                {progress.customGoals?.map((goal) => (
                  <div
                    key={goal.goalId}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all ${
                      goal.completed ? 'border-accent/20 bg-accent/5' : 'border-border hover:bg-surface'
                    }`}
                    onClick={() => handleToggleCustomGoal(goal.goalId, !goal.completed)}
                  >
                    <div
                      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 ${
                        goal.completed ? 'border-accent bg-accent' : 'border-border'
                      }`}
                    >
                      {goal.completed ? (
                        <svg className="h-3 w-3 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : null}
                    </div>
                    <p className={`flex-1 text-sm ${goal.completed ? 'text-muted line-through' : 'text-white'}`}>
                      {goal.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {tab === 'achievements' ? (
          <>
            {progress.achievements?.length === 0 ? (
              <div className="card-base p-12 text-center">
                <p className="mb-4 text-4xl">Locked</p>
                <p className="mb-2 text-lg font-display font-700 text-white">No achievements yet</p>
                <p className="text-sm text-muted">Complete tasks to unlock your first badge.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {progress.achievements.map((achievement) => (
                  <AchievementBadge key={achievement.id} achievement={achievement} />
                ))}
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}
