'use client'

import { useState, useEffect } from 'react'
import { IMG_URL, useStore } from '@/lib/store'
import { MODELS } from '@/lib/models'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Upload, X, AlertCircle } from 'lucide-react'
import Image from 'next/image'

export default function SingletonForm({ model, data = null, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({})
  const [uploadedFiles, setUploadedFiles] = useState({})
  const [errors, setErrors] = useState({})
  
  const { 
    createSingletonItem, 
    updateSingletonItem, 
    uploadFile, 
    loading, 
    error 
  } = useStore()
  
  const modelConfig = MODELS[model]
  const hasData = !!data

  // Initialize form data
  useEffect(() => {
    const initialData = {}
    modelConfig.fields.forEach(field => {
      initialData[field.key] = data?.[field.key] || ''
    })
    setFormData(initialData)
  }, [data, modelConfig])

  const handleInputChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }))
    
    // Clear error for this field
    if (errors[key]) {
      setErrors(prev => ({
        ...prev,
        [key]: null
      }))
    }
  }

  const handleFileUpload = async (field, files) => {
    try {
      const file = files[0]
      const result = await uploadFile(file)
      
      handleInputChange(field.key, result.url)
      setUploadedFiles(prev => ({
        ...prev,
        [field.key]: result
      }))
    } catch (error) {
      console.error('File upload failed:', error)
    }
  }

  const removeFile = (field) => {
    handleInputChange(field.key, '')
    setUploadedFiles(prev => ({
      ...prev,
      [field.key]: null
    }))
  }

  const validateForm = () => {
    const newErrors = {}
    
    modelConfig.fields.forEach(field => {
      if (field.required && !formData[field.key]) {
        newErrors[field.key] = `${field.label} is required`
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      const submitData = { ...formData }
      
      // Clean up data
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '') {
          delete submitData[key]
        }
      })

      if (hasData) {
        await updateSingletonItem(model, submitData)
      } else {
        await createSingletonItem(model, submitData)
      }
      
      onSuccess()
    } catch (error) {
      console.error('Submit failed:', error)
    }
  }

  const renderField = (field) => {
    const value = formData[field.key] || ''
    const hasError = errors[field.key]

    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.key}
              type={field.type}
              value={value}
              onChange={(e) => handleInputChange(field.key, e.target.value)}
              className={hasError ? 'border-red-500' : ''}
            />
            {hasError && (
              <p className="text-red-500 text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {hasError}
              </p>
            )}
          </div>
        )

      case 'textarea':
        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id={field.key}
              value={value}
              onChange={(e) => handleInputChange(field.key, e.target.value)}
              className={hasError ? 'border-red-500' : ''}
              rows={3}
            />
            {hasError && (
              <p className="text-red-500 text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {hasError}
              </p>
            )}
          </div>
        )

      case 'file':
        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            
            {value && (
              <div className="flex items-center space-x-2 p-2 border rounded">
                <Image
                  src={`${IMG_URL}${value}`}
                  alt="Preview"
                  width={48}
                  height={48}
                  className="w-12 h-12 object-cover rounded"
                />
                <span className="text-sm text-gray-600 flex-1">
                  {value.split('/').pop()}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(field)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <input
                type="file"
                id={field.key}
                accept="image/*"
                onChange={(e) => e.target.files.length > 0 && handleFileUpload(field, e.target.files)}
                className="hidden"
              />
              <label htmlFor={field.key} className="cursor-pointer">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  Click to upload or drag and drop
                </p>
              </label>
            </div>
            
            {hasError && (
              <p className="text-red-500 text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {hasError}
              </p>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modelConfig.fields.map(renderField)}
      </div>
      
      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : (hasData ? 'Update' : 'Create')}
        </Button>
      </div>
    </form>
  )
}