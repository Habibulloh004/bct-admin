'use client'

import { useState, useEffect } from 'react'
import { IMG_URL, useStore } from '@/lib/store'
import { MODELS } from '@/lib/models'
import Sidebar from './Sidebar'
import DataTable from './DataTable'
import CreateEditForm from './CreateEditForm'
import SingletonForm from './SingletonForm'
import AdminProfile from './AdminProfile'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, LogOut, AlertCircle, Settings, User, Edit } from 'lucide-react'
import Image from 'next/image'

export default function AdminDashboard() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [showProfile, setShowProfile] = useState(false)
  const [isSingletonEditOpen, setIsSingletonEditOpen] = useState(false)
  
  const { 
    user, 
    logout, 
    currentModel, 
    data, 
    fetchData,
    fetchSingletonData,
    loading, 
    error,
    clearError
  } = useStore()

  useEffect(() => {
    if (currentModel) {
      const modelConfig = MODELS[currentModel]
      if (modelConfig?.singleton) {
        fetchSingletonData(currentModel)
      } else {
        fetchData(currentModel)
      }
    }
  }, [currentModel, fetchData, fetchSingletonData])

  const currentModelConfig = MODELS[currentModel]
  const currentData = data[currentModel]
  const isSingleton = currentModelConfig?.singleton

  const handleEdit = (item) => {
    setEditingItem(item)
  }

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false)
    setEditingItem(null)
    setIsSingletonEditOpen(false)
  }

  const handleSuccess = () => {
    handleCloseDialog()
    if (isSingleton) {
      fetchSingletonData(currentModel)
    } else {
      fetchData(currentModel)
    }
  }

  const handleSingletonEdit = () => {
    setIsSingletonEditOpen(true)
  }

  if (showProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setShowProfile(false)}
              className="mb-4"
            >
              ← Back to Dashboard
            </Button>
          </div>
          <AdminProfile />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {currentModelConfig?.name || 'Dashboard'}
              </h1>
              <p className="text-sm text-gray-500">
                Manage your {currentModelConfig?.name?.toLowerCase() || 'data'}
                {isSingleton && ' (Single Record)'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user?.name || 'Admin'}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProfile(true)}
                className="flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Profile</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {error && (
            <div className="mb-6 flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-md border border-red-200">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="ml-auto"
              >
                ✕
              </Button>
            </div>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{currentModelConfig?.name}</CardTitle>
                  <CardDescription>
                    {isSingleton 
                      ? `Manage ${currentModelConfig?.name?.toLowerCase()} information`
                      : `Manage all ${currentModelConfig?.name?.toLowerCase()} records`
                    }
                  </CardDescription>
                </div>
                
                {isSingleton ? (
                  <Dialog open={isSingletonEditOpen} onOpenChange={setIsSingletonEditOpen}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center space-x-2">
                        <Edit className="h-4 w-4" />
                        <span>Edit {currentModelConfig?.name}</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="min-w-3xl">
                      <DialogHeader>
                        <DialogTitle>
                          Edit {currentModelConfig?.name}
                        </DialogTitle>
                      </DialogHeader>
                      <SingletonForm
                        model={currentModel}
                        data={currentData}
                        onSuccess={handleSuccess}
                        onCancel={handleCloseDialog}
                      />
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center space-x-2">
                        <Plus className="h-4 w-4" />
                        <span>Add New</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="min-w-3xl">
                      <DialogHeader>
                        <DialogTitle>
                          Create New {currentModelConfig?.name?.slice(0, -1) || 'Item'}
                        </DialogTitle>
                      </DialogHeader>
                      <CreateEditForm
                        model={currentModel}
                        onSuccess={handleSuccess}
                        onCancel={handleCloseDialog}
                      />
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              {isSingleton ? (
                <SingletonDisplay model={currentModel} data={currentData} loading={loading} />
              ) : (
                <DataTable
                  model={currentModel}
                  data={currentData}
                  onEdit={handleEdit}
                  loading={loading}
                />
              )}
            </CardContent>
          </Card>

          {/* Edit Dialog for regular models */}
          {!isSingleton && (
            <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
              <DialogContent className="min-w-3xl">
                <DialogHeader>
                  <DialogTitle>
                    Edit {currentModelConfig?.name?.slice(0, -1) || 'Item'}
                  </DialogTitle>
                </DialogHeader>
                {editingItem && (
                  <CreateEditForm
                    model={currentModel}
                    item={editingItem}
                    onSuccess={handleSuccess}
                    onCancel={handleCloseDialog}
                  />
                )}
              </DialogContent>
            </Dialog>
          )}
        </main>
      </div>
    </div>
  )
}

// Component to display singleton data
function SingletonDisplay({ model, data, loading }) {
  const modelConfig = MODELS[model]
  
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No data available. Click &quot;Edit&quot; to create.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {modelConfig.displayFields.map((field) => (
        <div key={field} className="border-b pb-4">
          <dt className="font-medium text-gray-900 capitalize mb-2">
            {field.replace(/_/g, ' ')}
          </dt>
          <dd className="text-gray-700">
            {field.includes('image') && data[field] ? (
              <Image
                src={`${IMG_URL}${data[field]}`}
                alt={field}
                className="w-24 h-24 object-cover rounded"
              />
            ) : (
              data[field] || '-'
            )}
          </dd>
        </div>
      ))}
      {data.created_at && (
        <div className="border-b pb-4">
          <dt className="font-medium text-gray-900 mb-2">Created At</dt>
          <dd className="text-gray-700">
            {new Date(data.created_at).toLocaleDateString()}
          </dd>
        </div>
      )}
      {data.updated_at && (
        <div className="border-b pb-4">
          <dt className="font-medium text-gray-900 mb-2">Updated At</dt>
          <dd className="text-gray-700">
            {new Date(data.updated_at).toLocaleDateString()}
          </dd>
        </div>
      )}
    </div>
  )
}