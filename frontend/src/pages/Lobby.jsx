import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { apiGet, apiPost } from '../lib/api'

export default function Lobby() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [err, setErr] = useState('')
    const [joinId, setJoinId] = useState('')

    async function load() {
        setLoading(true); setErr('')
        try {
            const res = await apiGet('/api/v1/matches')
            setItems(res.items || [])
        } catch (e) {
            setErr(e?.error || 'Failed to load matches')
        } finally {
            setLoading(false)
        }
    }

    async function createMatch() {
        setErr('')
        try {
            const m = await apiPost('/api/v1/matches')
            setItems(prev => [m, ...prev])
        } catch (e) {
            setErr(e?.error || 'Failed to create match')
        }
    }

    async function joinMatch() {
        setErr('')
        const id = Number(joinId)
        if (!id) { setErr('Enter a valid numeric match id'); return }
        try {
            await apiPost(`/api/v1/matches/${id}/join`)
            await load()
        } catch (e) {
            setErr(e?.error || 'Join failed')
        }
    }

    async function exportCSV() {
        setErr('')
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('/api/v1/matches?download=1', {
                headers: { Accept: 'text/csv', Authorization: token ? `Bearer ${token}` : undefined }
            })
            if (!res.ok) throw new Error('export failed')
            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url; a.download = 'matches.csv'; a.click()
            URL.revokeObjectURL(url)
        } catch {
            setErr('CSV export failed')
        }
    }

    useEffect(() => { load() }, [])
    const empty = useMemo(() => !loading && items.length === 0, [loading, items])

    return (
        <div className="stack gap">
            <h1>Lobby</h1>

            <div className="row">
                <button className="btn primary" onClick={createMatch}>Create match</button>
                <input className="input" placeholder="Match ID…" value={joinId} onChange={e => setJoinId(e.target.value)} style={{ width: 180 }} />
                <button className="btn" onClick={joinMatch}>Join</button>
                <button className="btn ghost" onClick={exportCSV}>Export CSV</button>
            </div>

            {err && <p className="err">{err}</p>}
            {loading && <p className="muted">Loading…</p>}
            {empty && <p className="muted">No matches yet — create one!</p>}

            <div className="grid">
                {items.map(m => (
                    <Link key={m.id} to={`/m/${m.id}`} className="card link">
                        <div className="row space">
                            <h3>Match #{m.id}</h3>
                            <span className="muted small">{new Date(m.created_at).toLocaleString()}</span>
                        </div>
                        <p>Status: <b>{m.status}</b> {m.winner ? `(winner: ${m.winner})` : ''}</p>
                        <p className="small muted">Turn: {m.turn}</p>
                    </Link>
                ))
                }
            </div>
        </div>
    )
}
