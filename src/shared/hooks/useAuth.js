import { useEffect, useState } from 'react'
import { STORAGE_KEYS } from '../constants/app'
import { fetchMe, loginRequest } from '../services/apiClient'

function readAuthState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.auth)
    if (!raw) {
      return { token: '', user: null }
    }
    return JSON.parse(raw)
  } catch {
    return { token: '', user: null }
  }
}

export function useAuth() {
  const [auth, setAuth] = useState(readAuthState)
  const [loading, setLoading] = useState(Boolean(readAuthState().token))

  const persist = (next) => {
    setAuth(next)
    localStorage.setItem(STORAGE_KEYS.auth, JSON.stringify(next))
  }

  useEffect(() => {
    if (!auth.token) {
      return
    }
    let mounted = true
    fetchMe(auth.token)
      .then((user) => {
        if (mounted) {
          persist({ token: auth.token, user })
        }
      })
      .catch(() => {
        if (mounted) {
          persist({ token: '', user: null })
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false)
        }
      })
    return () => {
      mounted = false
    }
  }, [auth.token])

  useEffect(() => {
    if (!auth.token && loading) {
      const id = window.setTimeout(() => setLoading(false), 0)
      return () => window.clearTimeout(id)
    }
    return undefined
  }, [auth.token, loading])

  const login = async (username, password) => {
    setLoading(true)
    const response = await loginRequest(username, password)
    persist({ token: response.token, user: response.user })
    setLoading(false)
    return response.user
  }

  const logout = () => {
    persist({ token: '', user: null })
  }

  return {
    token: auth.token,
    user: auth.user,
    loading,
    isAuthenticated: Boolean(auth.token && auth.user),
    login,
    logout,
  }
}
