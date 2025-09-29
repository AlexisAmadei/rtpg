import React from 'react'
import { Routes, Route, Navigate, Link } from 'react-router'
import { useAuth } from './lib/auth'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Lobby from './pages/Lobby'
import Match from './pages/Match'

function Topbar() {
    const auth = useAuth()
    const token = auth?.token
    return (
        <header className="topbar">
            <div className="brand"><Link to="/">Ratt</Link></div>
            <nav className="nav">
                {token ? (
                    <>
                        <Link to="/lobby" className="btn ghost">Lobby</Link>
                        <button className="btn danger" onClick={auth.logout}>Logout</button>
                    </>
                ) : (
                    <Link to="/login" className="btn primary">Login</Link>
                )}
            </nav>
        </header>
    )
}

export default function App() {
    return (
        <div className="page">
            <Topbar />
            <main className="container">
                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/lobby" element={<ProtectedRoute><Lobby /></ProtectedRoute>} />
                    <Route path="/m/:id" element={<ProtectedRoute><Match /></ProtectedRoute>} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </main>
        </div>
    )
}
