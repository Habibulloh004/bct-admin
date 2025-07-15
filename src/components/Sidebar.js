'use client'

import { useStore } from '@/lib/store'
import { MODELS } from '@/lib/models'
import { cn } from '@/lib/utils'
import { 
  MessageSquare, 
  FolderTree, 
  Folder, 
  Package, 
  Award, 
  FileCheck, 
  Newspaper, 
  Handshake, 
  Shield, 
  DollarSign, 
  Image, 
  Wallpaper, 
  Contact,
  LayoutDashboard
} from 'lucide-react'

const iconMap = {
  MessageSquare,
  FolderTree,
  Folder,
  Package,
  Award,
  FileCheck,
  Newspaper,
  Handshake,
  Shield,
  DollarSign,
  Image,
  Wallpaper,
  Contact,
  LayoutDashboard
}

export default function Sidebar() {
  const { currentModel, setCurrentModel } = useStore()

  const menuItems = Object.entries(MODELS).map(([key, config]) => ({
    key,
    name: config.name,
    icon: config.icon || 'LayoutDashboard'
  }))

  return (
    <div className="w-64 bg-white shadow-lg border-r">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
        <p className="text-sm text-gray-500">E-commerce Backend</p>
      </div>
      
      <nav className="p-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = iconMap[item.icon] || LayoutDashboard
            const isActive = currentModel === item.key
            
            return (
              <button
                key={item.key}
                onClick={() => setCurrentModel(item.key)}
                className={cn(
                  "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors duration-200",
                  isActive
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.name}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}