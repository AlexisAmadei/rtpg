import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router'
import { apiGet, apiPost } from '../lib/api'

export default function Match() {
    const { id } = useParams()
    const [m, setM] = useState(null)
    const [err, setErr] = useState('')
    const [busy, setBusy] = useState(false)
    const timer = useRef(null)

    const load = useCallback(async () => {
        setErr('')
        try {
            const data = await apiGet(`/api/v1/matches/${id}`)
            setM(data)
        } catch (e) {
            setErr(e?.error || 'Failed to load match')
        }
    }, [id])

    async function play(idx) {
        if (!m || m.status !== 'in_progress') return
        setBusy(true); setErr('')
        try {
            const upd = await apiPost(`/api/v1/matches/${id}/move`, { index: idx })
            setM(upd)
        } catch (e) {
            setErr(e?.error || 'Move failed')
        } finally {
            setBusy(false)
        }
    }

    useEffect(() => {
        load()
        timer.current = setInterval(load, 1500)
        return () => clearInterval(timer.current)
    }, [id, load])

    const board = useMemo(() => (m?.board || '_________').split(''), [m])

    return (
        <div className="stack gap">
            <h1>Match #{id}</h1>
            {err && <p className="err">{err}</p>}
            {!m ? <p className="muted">Loading…</p> : (
                <>
                    <p>Status: <b>{m.status}</b> {m.winner ? `(winner: ${m.winner})` : ''}</p>
                    {m.status === 'in_progress' && <p>Turn: <b>{m.turn}</b></p>}

                    <div className="board">
                        {board.map((c, idx) => {
                            const clickable = c === '_' && m.status === 'in_progress' && !busy
                            return (
                                <button key={idx}
                                    className={`cell ${clickable ? 'clickable' : ''}`}
                                    onClick={() => clickable && play(idx)}>
                                    {c === '_' ? '' : c}
                                </button>
                            )
                        })}
                    </div>

                    <button className="btn" onClick={load} disabled={busy}>Refresh</button>
                </>
            )}
        </div>
    )
}
