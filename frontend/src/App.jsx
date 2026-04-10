import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Upload from './pages/Upload.jsx'
import Pathways from './pages/Pathways.jsx'
import Dashboard from './pages/Dashboard.jsx'

function ProtectedRoute({ children }) {
  const userId = localStorage.getItem('userId')
  return userId ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
      <Route path="/pathways/:pathwayId" element={<ProtectedRoute><Pathways /></ProtectedRoute>} />
      <Route path="/dashboard/:pathwayId" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    </Routes>
  )
}
