import React, { useState } from 'react'
import { useAuth } from '../lib/auth'
import { useNavigate } from 'react-router'

export default function Login() {
    const { login, register } = useAuth()
    const nav = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [busy, setBusy] = useState(false)
    const [err, setErr] = useState('')

    async function doLogin() {
        setBusy(true); setErr('')
        try {
            await login(email, password)
            nav('/lobby')
        } catch (e) {
            setErr(e?.error || 'Login failed')
        } finally {
            setBusy(false)
        }
    }

    async function doRegister() {
        setBusy(true)
        setErr('')
        try {
            await register(email, password)
            setErr('Account created. You can now log in.')
        } catch (e) {
            setErr(e?.error || 'Register failed')
        } finally {
            setBusy(false)
        }
    }


    return (
        <div className="center">
            <div className="card">
                <h1>RTPG — Sign in</h1>
                {err && <p className="err">{err}</p>}
                <label>Email</label>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
                <label>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
                <div className="row">
                    <button className="btn primary" disabled={busy} onClick={doLogin}>Login</button>
                    <button className="btn" disabled={busy} onClick={doRegister}>Register</button>
                </div>
            </div>
        </div>
    )
}
