'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/lib/store'
import LoginForm from '@/components/LoginForm'
import AdminDashboard from '@/components/AdminDashboard'

export default function Home() {
  const { isAuthenticated, authChecked, initAuth } = useStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      // Initialize auth and check if user is already authenticated
      const wasAuthenticated = initAuth()
      setIsLoading(false)
    }

    checkAuth()
  }, [initAuth])

  // Show loading spinner while checking authentication
  if (isLoading || !authChecked) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </main>
    )
  }

  // Once auth is checked, show appropriate component
  return (
    <main className="min-h-screen bg-gray-50">
      {isAuthenticated ? <AdminDashboard /> : <LoginForm />}
    </main>
  )
}