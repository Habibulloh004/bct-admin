'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle, User } from 'lucide-react'

export default function AdminProfile() {
  const { user, updateAdmin, loading, error, clearError } = useStore()
  const [formData, setFormData] = useState({
    name: user?.name || '',
    password: ''
  })
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()
    setSuccess(false)
    
    if (!formData.name || !formData.password) {
      return
    }
    
    try {
      await updateAdmin(formData.name, formData.password)
      setSuccess(true)
      setFormData(prev => ({ ...prev, password: '' })) // Clear password field
      setTimeout(() => setSuccess(false), 3000) // Hide success message after 3 seconds
    } catch (err) {
      // Error is already handled in the store
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Admin Profile</span>
        </CardTitle>
        <CardDescription>
          Update your admin credentials
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-md">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Admin credentials updated successfully!</span>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="name">Admin Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter admin name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter new password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !formData.name || !formData.password}
          >
            {loading ? 'Updating...' : 'Update Admin'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}