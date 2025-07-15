'use client'

import { useState } from 'react'
import { IMG_URL, useStore } from '@/lib/store'
import { MODELS } from '@/lib/models'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Edit, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'

export default function DataTable({ model, data, onEdit, loading }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const { deleteItem } = useStore()
  
  const modelConfig = MODELS[model]
  
  if (!data || !modelConfig) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No data available</p>
      </div>
    )
  }

  const items = data.data || []
  const total = data.total || 0
  const limit = data.limit || 10
  const totalPages = Math.ceil(total / limit)

  // Filter items based on search term
  const filteredItems = items.filter(item => {
    if (!searchTerm) return true
    return modelConfig.displayFields.some(field => {
      const value = item[field]
      return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    })
  })

  const formatFieldValue = (item, field) => {
    const value = item[field]
    
    if (!value) return '-'
    
    // Handle dates
    if (field.includes('_at') || field.includes('date')) {
      return new Date(value).toLocaleDateString()
    }
    
    // Handle images
    if (field === 'image' && Array.isArray(value)) {
      return (
        <div className="flex space-x-1">
          {value.slice(0, 2).map((img, idx) => (
            <Image
              key={idx}
              src={`${IMG_URL}${img}`}
              alt="Preview"
              className="w-8 h-8 object-cover rounded"
            />
          ))}
          {value.length > 2 && (
            <span className="text-xs text-gray-500">+{value.length - 2}</span>
          )}
        </div>
      )
    }
    
    if (field === 'image' && typeof value === 'string') {
      return (
        <Image
          src={`${IMG_URL}${value}`}
          alt="Preview"
          className="w-8 h-8 object-cover rounded"
        />
      )
    }
    
    // Truncate long text
    if (typeof value === 'string' && value.length > 50) {
      return value.substring(0, 50) + '...'
    }
    
    return value
  }

  const handleDelete = async (id) => {
    try {
      await deleteItem(model, id)
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    // You can implement pagination by calling fetchData with page parameter
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={`Search ${modelConfig.name.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-gray-500">
          {total} total items
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {modelConfig.displayFields.map((field) => (
                <TableHead key={field} className="capitalize">
                  {field.replace(/_/g, ' ')}
                </TableHead>
              ))}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={modelConfig.displayFields.length + 1} 
                  className="text-center py-8 text-gray-500"
                >
                  No {modelConfig.name.toLowerCase()} found
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id || item._id}>
                  {modelConfig.displayFields.map((field) => (
                    <TableCell key={field}>
                      {formatFieldValue(item, field)}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete this{' '}
                              {modelConfig.name.toLowerCase().slice(0, -1)}.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(item.id || item._id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}