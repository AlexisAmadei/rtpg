import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { apiPost } from './api'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem('token') || null)
    const [loading, setLoading] = useState(false)

    const saveToken = (t) => {
        setToken(t)
        if (t) localStorage.setItem('token', t)
        else localStorage.removeItem('token')
    }

    const login = useCallback(async (email, password) => {
        setLoading(true)
        try {
            const res = await apiPost('/api/v1/auth/login', { email, password })
            saveToken(res.token)
            return res
        } finally {
            setLoading(false)
        }
    }, [])

    const register = useCallback(async (email, password) => {
        setLoading(true)
        try {
            return await apiPost('/api/v1/auth/register', { email, password })
        } finally {
            setLoading(false)
        }
    }, [])

    const logout = useCallback(() => saveToken(null), [])

    const value = useMemo(() => ({ token, loading, login, register, logout }), [token, loading, login, register, logout])
    return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export function useAuth() {
    return useContext(AuthCtx)
}
