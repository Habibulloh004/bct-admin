'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle } from 'lucide-react'
import { MultilingualHelpers } from '@/lib/models'
import { useLanguage } from '@/lib/LanguageContext'

export function MultilingualInput({ 
  value = '', 
  onChange, 
  label, 
  required = false, 
  error = null,
  type = 'text', // 'text' or 'textarea'
  placeholder = ''
}) {
  const { t, getAvailableLanguages } = useLanguage()
  const [multilingualValue, setMultilingualValue] = useState(() => {
    return MultilingualHelpers.parseMultilingual(value)
  })

  const handleLanguageChange = (language, newValue) => {
    const updated = {
      ...multilingualValue,
      [language]: newValue
    }
    setMultilingualValue(updated)
    
    // Convert back to string format and call onChange
    const formattedValue = MultilingualHelpers.formatMultilingual(updated)
    onChange(formattedValue)
  }

  const InputComponent = type === 'textarea' ? Textarea : Input
  const languages = getAvailableLanguages()

  const getPlaceholder = (lang) => {
    if (placeholder) {
      return `${placeholder} (${lang.nativeName})`
    }
    return `${t('enter')} ${label.toLowerCase()} ${t('in')} ${lang.nativeName}`
  }

  return (
    <div className="space-y-2">
      <Label>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      
      <Tabs defaultValue="en" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {languages.map((lang) => (
            <TabsTrigger key={lang.code} value={lang.code} className="text-xs">
              {lang.flag} {lang.code.toUpperCase()}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {languages.map((lang) => (
          <TabsContent key={lang.code} value={lang.code} className="mt-2">
            <InputComponent
              placeholder={getPlaceholder(lang)}
              value={multilingualValue[lang.code] || ''}
              onChange={(e) => handleLanguageChange(lang.code, e.target.value)}
              className={error ? 'border-red-500' : ''}
              rows={type === 'textarea' ? 3 : undefined}
            />
          </TabsContent>
        ))}
      </Tabs>
      
      {error && (
        <p className="text-red-500 text-sm flex items-center mt-1">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}
      
      {/* Show preview of current format */}
      {/* <div className="text-xs text-gray-500 mt-1">
        {t('preview')}: {MultilingualHelpers.formatMultilingual(multilingualValue) || t('empty')}
      </div> */}
    </div>
  )
}

export function MultilingualDisplay({ 
  value, 
  language = 'en',
  fallbackToFirst = true 
}) {
  const displayValue = MultilingualHelpers.getDisplayValue(value, language)
  
  if (!displayValue && fallbackToFirst && value) {
    // Try to get first non-empty value
    const parsed = MultilingualHelpers.parseMultilingual(value)
    const fallback = parsed.en || parsed.ru || parsed.uz || ''
    return fallback
  }
  
  return displayValue || '-'
}