import { useEffect, useState } from 'react'

export default function App() {

    useEffect(() => {
        fetch('/api/health')
            .then(r => r.json())
            .then(console.log)
    }, [])

    return (
        <div style={{ padding: 20 }}>
            <h1>Vite + React + Express</h1>
        </div>
    )
}
