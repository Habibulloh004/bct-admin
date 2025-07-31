'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { useLanguage } from '@/lib/LanguageContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { AlertCircle, Globe } from 'lucide-react'

export default function LoginForm() {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const { login, loading, error, clearError } = useStore()
  const { t, currentLanguage, changeLanguage, getAvailableLanguages } = useLanguage()

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()
    
    try {
      await login(name, password)
    } catch (err) {
      // Error is already handled in the store
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      {/* Language Selector - Top Right */}
      <div className="fixed top-4 right-4 z-10">
        <div className="flex items-center space-x-2 bg-white rounded-lg shadow-sm border px-3 py-2">
          <Globe className="h-4 w-4 text-gray-500" />
          <Select value={currentLanguage} onValueChange={changeLanguage}>
            <SelectTrigger className="w-32 border-0 shadow-none p-0 h-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {getAvailableLanguages().map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  <div className="flex items-center space-x-2 px-2">
                    {/* <span>{lang.flag}</span> */}
                    <span>{lang.nativeName}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">{t('adminLogin')}</CardTitle>
          <CardDescription>
            {t('adminCredentials')}
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
            
            <div className="space-y-2">
              <Label htmlFor="name">{t('adminName')}</Label>
              <Input
                id="name"
                type="text"
                placeholder={t('adminName')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t('password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? t('loggingIn') : t('login')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}