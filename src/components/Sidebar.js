'use client'

import { useStore } from '@/lib/store'
import { MODELS } from '@/lib/models'
import { useLanguage } from '@/lib/LanguageContext'
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
    titleKey: 'coreBusiness',
    items: ['top-categories', 'categories', 'products']
  },
  {
    titleKey: 'information',
    items: ['about', 'contacts']
  },
  {
    titleKey: 'mediaContent',
    items: ['news', 'partners']
  },
  {
    titleKey: 'certificates',
    items: ['certificates', 'licenses']
  }
]

export default function Sidebar() {
  const { currentModel, setCurrentModel } = useStore()
  const { t } = useLanguage()

  const getCategoryTitle = (titleKey) => {
    const categoryTitles = {
      coreBusiness: 'Core Business',
      information: 'Information',
      mediaContent: 'Media & Content',
      certificates: 'Certificates'
    }
    return categoryTitles[titleKey] || titleKey
  }

  const getModelName = (modelKey) => {
    const modelNames = {
      'top-categories': t('topCategories'),
      'categories': t('categories'),
      'products': t('products'),
      'about': t('about'),
      'contacts': t('contacts'),
      'news': t('news'),
      'partners': t('partners'),
      'certificates': t('certificates'),
      'licenses': t('licenses')
    }
    return modelNames[modelKey] || MODELS[modelKey]?.name || modelKey
  }

  return (
    <div className="w-64 bg-white shadow-lg border-r h-full">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-gray-800">{t('adminPanel')}</h2>
        {/* <p className="text-sm text-gray-500">{t('ecommerceBackend')}</p> */}
      </div>
      
      <nav className="p-4 overflow-y-auto h-[calc(100vh-88px)]">
        <div className="space-y-6">
          {menuCategories.map((category) => (
            <div key={category.titleKey}>
              {/* <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {getCategoryTitle(category.titleKey)}
              </h3> */}
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
                      <span className="text-sm font-medium">{getModelName(itemKey)}</span>
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