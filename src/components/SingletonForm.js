'use client'

import { useState, useEffect } from 'react'
import { IMG_URL, useStore } from '@/lib/store'
import { MODELS } from '@/lib/models'
import {
  FormLanguageProvider,
  FormLanguageSelector,
  MultilingualInput
} from '@/components/MultilingualInput'
import { MultilingualRichTextEditor } from '@/components/RichTextEditor'
import { useLanguage } from '@/lib/LanguageContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Upload, X, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function SingletonForm({ model, data = null, onSuccess, onCancel }) {
  return (
    <FormLanguageProvider>
      <SingletonFormContent
        model={model}
        data={data}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </FormLanguageProvider>
  );
}

function SingletonFormContent({ model, data = null, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({})
  const [uploadedFiles, setUploadedFiles] = useState({})
  const [errors, setErrors] = useState({})

  const { t } = useLanguage()
  const {
    createSingletonItem,
    updateSingletonItem,
    uploadFile,
    fetchData,
    data: storeData,
    loading,
    error
  } = useStore()

  const modelConfig = MODELS[model]
  const hasData = !!data

  // Initialize form data
  useEffect(() => {
    const initialData = {}
    modelConfig.fields.forEach(field => {
      initialData[field.key] =
        data && data[field.key] !== undefined && data[field.key] !== null
          ? data[field.key]
          : field.default ?? ''
    })
    setFormData(initialData)
  }, [data, modelConfig])

  // Fetch options for select fields
  useEffect(() => {
    const selectFields = modelConfig.fields.filter(
      (field) => field.type === 'select'
    )
    selectFields.forEach((field) => {
      if (
        field.options &&
        !modelConfig.customOptions?.[field.options] &&
        !storeData[field.options]
      ) {
        fetchData(field.options)
      }
    })
  }, [modelConfig.fields, modelConfig.customOptions, fetchData, storeData])

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
        newErrors[field.key] = `${field.label} ${t('required')}`
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

  const getFieldLabel = (field) => {
    const fieldLabels = {
      name: t("name"),
      image: t("image"),
      description: t("description"),
      company_name: t("companyName"),
      phone1: t("phone") + " 1",
      phone2: t("phone") + " 2",
      email: t("email"),
      address: t("address"),
      work_hours: t("workHours"),
      telegram: "Telegram",
      telegram_bot: "Telegram Bot",
      facebook: "Facebook",
      instagram: "Instagram",
      youtube: "YouTube",
      footer_info: t("footerInfo") || "Footer Info",
      experience_info: t("experienceInfo") || "Experience Info",
      creation: t("creationInfo") || "Creation Info",
      clients: t("clientsInfo") || "Clients Info",
      partners: t("partnersInfo") || "Partners Info",
      technologies: t("technologies") || "Technologies",
      scaners: t("scanners") || "Scanners",
      scales: t("scales") || "Scales",
      printers: t("printers") || "Printers",
      cashiers: t("cashiers") || "Cashiers",
    };
    return fieldLabels[field.key] || field.label;
  };

  const getSelectOptions = (field) => {
    let options = []
    if (modelConfig.customOptions?.[field.options]) {
      options = modelConfig.customOptions[field.options]
    } else if (storeData[field.options]) {
      options = storeData[field.options]
    }
    return options
  }


  const renderField = (field) => {
    const value = formData[field.key] || ''
    const hasError = errors[field.key]

    switch (field.type) {
      case 'multilingual':
        return (
          <div key={field.key} className="col-span-2">
            <MultilingualInput
              value={value}
              onChange={(newValue) => handleInputChange(field.key, newValue)}
              label={getFieldLabel(field)}
              required={field.required}
              error={hasError}
              type="text"
            />
          </div>
        )

      case 'multilingual-textarea':
        return (
          <div key={field.key} className="col-span-2">
            <MultilingualInput
              value={value}
              onChange={(newValue) => handleInputChange(field.key, newValue)}
              label={getFieldLabel(field)}
              required={field.required}
              error={hasError}
              type="textarea"
            />
          </div>
        )

      case 'multilingual-rich-text':
        return (
          <div key={field.key} className="col-span-2">
            <MultilingualRichTextEditor
              value={value}
              onChange={(newValue) => handleInputChange(field.key, newValue)}
              label={getFieldLabel(field)}
              required={field.required}
              error={hasError}
              height="250px"
            />
          </div>
        )

      case 'text':
      case 'email':
      case 'password':
      case 'number':
        const isNumericField = field.type === 'number'
        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>
              {getFieldLabel(field)} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.key}
              type={field.type}
              inputMode={isNumericField ? 'numeric' : undefined}
              value={value}
              onChange={(e) =>
                handleInputChange(
                  field.key,
                  isNumericField ? e.target.value.replace(/[^0-9]/g, '') : e.target.value
                )
              } className={hasError ? 'border-red-500' : ''}
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
              {getFieldLabel(field)} {field.required && <span className="text-red-500">*</span>}
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

      case 'select':
        const options = getSelectOptions(field)
        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>
              {getFieldLabel(field)} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Select
              value={value ? value.toString() : undefined}
              onValueChange={(newValue) => handleInputChange(field.key, newValue)}
            >
              <SelectTrigger className={hasError ? 'border-red-500' : ''}>
                <SelectValue placeholder={t('select') + ' ' + getFieldLabel(field)} />
              </SelectTrigger>
              <SelectContent>
                {options?.map((option) => {
                  const optionValue = (option.id || option._id).toString()
                  const optionLabel =
                    typeof option.name === 'string'
                      ? option.name
                      : option.name?.en || ''
                  return (
                    <SelectItem key={optionValue} value={optionValue}>
                      {optionLabel}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
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
              {getFieldLabel(field)} {field.required && <span className="text-red-500">*</span>}
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
                  {t('clickToUpload')}
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

      {/* Global Language Selector */}
      <FormLanguageSelector />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modelConfig.fields.map(renderField)}
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('cancel')}
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? t('saving') : (hasData ? t('update') : t('create'))}
        </Button>
      </div>
    </form>
  )
}