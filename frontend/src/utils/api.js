import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export const login = (name, email) =>
  api.post('/auth/login', { name, email }).then(r => r.data)

export const analyzeResume = (userId, rawText) =>
  api.post('/resume/analyze', { userId, rawText }).then(r => r.data)

export const selectPathway = (userId, pathwayId, selectedRoleIndex) =>
  api.post('/pathways/select', { userId, pathwayId, selectedRoleIndex }).then(r => r.data)

export const getProgress = (pathwayId) =>
  api.get(`/progress/${pathwayId}`).then(r => r.data)

export const toggleTask = (taskId, completed) =>
  api.patch(`/progress/task/${taskId}`, { completed }).then(r => r.data)

export const addCustomGoal = (pathwayId, title, deadline) =>
  api.post('/progress/goal/custom', { pathwayId, title, deadline }).then(r => r.data)

export const updateCustomGoal = (goalId, completed) =>
  api.patch(`/progress/goal/custom/${goalId}`, { completed }).then(r => r.data)

export const getAgentDecision = (pathwayId) =>
  api.get('/agent/decision', { params: { pathwayId } }).then(r => r.data)
