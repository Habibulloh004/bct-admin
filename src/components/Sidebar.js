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
  LayoutDashboard,
  User,
  ShoppingCart,
  Info,
  Link,
  Building,
  Briefcase,
  Star,
  ArrowUpDown
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
  LayoutDashboard,
  User,
  ShoppingCart,
  Info,
  Link,
  Building,
  Briefcase,
  Star,
  ArrowUpDown
}

const menuCategories = [
  {
    title: 'Core Business',
    items: ['clients', 'top-categories', 'categories', 'products', 'orders']
  },
  {
    title: 'Information',
    items: ['about', 'links', 'contacts']
  },
  {
    title: 'Media & Content',
    items: ['vendors', 'projects', 'partners', 'news']
  },
  {
    title: 'Reviews',
    items: ['reviews', 'select-reviews']
  },
  {
    title: 'Certificates',
    items: ['sertificates', 'licenses']
  },
  {
    title: 'System',
    items: ['admins', 'currencies', 'banners', 'backgrounds']
  },
  {
    title: 'Sorting',
    items: ['banner-sorts', 'top-category-sorts', 'category-sorts']
  }
]

export default function Sidebar() {
  const { currentModel, setCurrentModel } = useStore()

  return (
    <div className="w-64 bg-white shadow-lg border-r h-full">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
        <p className="text-sm text-gray-500">E-commerce Backend</p>
      </div>
      
      <nav className="p-4 overflow-y-auto h-[calc(100vh-88px)]">
        <div className="space-y-6">
          {menuCategories.map((category) => (
            <div key={category.title}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {category.title}
              </h3>
              <div className="space-y-1">
                {category.items.map((itemKey) => {
                  const item = MODELS[itemKey]
                  if (!item) return null
                  
                  const Icon = iconMap[item.icon] || LayoutDashboard
                  const isActive = currentModel === itemKey
                  
                  return (
                    <button
                      key={itemKey}
                      onClick={() => setCurrentModel(itemKey)}
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
            </div>
          ))}
        </div>
      </nav>
    </div>
  )
}