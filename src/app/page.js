'use client'

import { useEffect } from 'react'
import { useStore } from '@/lib/store'
import LoginForm from '@/components/LoginForm'
import AdminDashboard from '@/components/AdminDashboard'

export default function Home() {
  const { isAuthenticated, initAuth } = useStore()

  useEffect(() => {
    initAuth()
  }, [initAuth])

  return (
    <main className="min-h-screen bg-gray-50">
      {isAuthenticated ? <AdminDashboard /> : <LoginForm />}
    </main>
  )
}