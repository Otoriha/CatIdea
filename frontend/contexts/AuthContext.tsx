'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: number
  name: string
  email: string
  created_at: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isLoggedIn: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  signup: (userData: { name: string; email: string; password: string; password_confirmation: string }) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  loginWithGitHub: () => void
  setUserData: (userData: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  const checkAuth = async () => {
    try {
      const storedToken = localStorage.getItem('token')
      if (storedToken) {
        setToken(storedToken)
      }
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      
      if (storedToken) {
        headers['Authorization'] = `Bearer ${storedToken}`
      }
      
      const response = await fetch(`${apiUrl}/auth/me`, {
        credentials: 'include',
        headers,
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.logged_in && data.user) {
          setUser(data.user)
          setIsLoggedIn(true)
        } else {
          setUser(null)
          setIsLoggedIn(false)
          setToken(null)
        }
      } else {
        setUser(null)
        setIsLoggedIn(false)
        setToken(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
      setIsLoggedIn(false)
      setToken(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        setIsLoggedIn(true)
        if (data.token) {
          localStorage.setItem('token', data.token)
          setToken(data.token)
        }
        return { success: true }
      } else {
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error('Login failed:', error)
      return { success: false, message: 'ログインに失敗しました' }
    }
  }

  const signup = async (userData: { name: string; email: string; password: string; password_confirmation: string }) => {
    try {
      const response = await fetch(`${apiUrl}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ user: userData }),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        setIsLoggedIn(true)
        if (data.token) {
          localStorage.setItem('token', data.token)
          setToken(data.token)
        }
        return { success: true }
      } else {
        return { success: false, message: data.message }
      }
    } catch (error) {
      console.error('Signup failed:', error)
      return { success: false, message: 'サインアップに失敗しました' }
    }
  }

  const logout = async () => {
    try {
      await fetch(`${apiUrl}/auth/logout`, {
        method: 'DELETE',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setUser(null)
      setIsLoggedIn(false)
      setToken(null)
      localStorage.removeItem('token')
    }
  }

  const loginWithGitHub = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}/auth/github`
  }

  const setUserData = (userData: User) => {
    setUser(userData)
    setIsLoggedIn(true)
  }

  useEffect(() => {
    checkAuth()
  }, [])

  // GitHub OAuth認証結果の処理
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const authResult = urlParams.get('auth')
    
    if (authResult === 'success') {
      checkAuth()
      // URLからクエリパラメータを削除
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (authResult === 'failure') {
      console.error('GitHub authentication failed')
      // URLからクエリパラメータを削除
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isLoggedIn,
    login,
    signup,
    logout,
    checkAuth,
    loginWithGitHub,
    setUserData,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}