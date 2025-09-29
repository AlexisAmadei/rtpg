const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

function headers(extra = {}) {
    const token = localStorage.getItem('token')
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...extra,
    }
}

export async function apiGet(path, extra = {}) {
    const res = await fetch(`${API_BASE}${path}`, { headers: headers(extra.headers) })
    if (!res.ok) throw await res.json().catch(() => ({ error: res.statusText }))
    return res.headers.get('content-type')?.includes('application/json') ? res.json() : res.text()
}

export async function apiPost(path, body, extra = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers: headers(extra.headers),
        body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
    })
    if (!res.ok) throw await res.json().catch(() => ({ error: res.statusText }))
    return res.headers.get('content-type')?.includes('application/json') ? res.json() : res.text()
}
