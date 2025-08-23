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
    items: ['contacts']
  },
  {
    titleKey: 'mediaContent',
    items: ['partners', "licenses", "sertificates"]
  },
  // {
  //   titleKey: 'reviews',
  //   items: ['reviews', 'select-reviews']
  // },
  // {
  //   titleKey: 'configuration',
  //   items: ['admins', 'currencies', 'banners', 'backgrounds']
  // }
]

export default function Sidebar() {
  const { currentModel, setCurrentModel } = useStore()
  const { t } = useLanguage()

  const getCategoryTitle = (titleKey) => {
    const categoryTitles = {
      coreBusiness: t('coreBusiness') || 'Core Business',
      information: t('information') || 'Information',
      mediaContent: t('mediaContent') || 'Media & Content',
      certificates: t('certificates') || 'Projects',
      reviews: t('reviews') || 'Reviews',
      configuration: t('configuration') || 'Configuration'
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
      'sertificates': t('certificates'),
      'licenses': t('licenses'),
      'reviews': t('reviews'),
      'select-reviews': t('featuredReviews') || 'Featured Reviews',
      'admins': t('admins') || 'Administrators',
      'currencies': t('currencies') || 'Currencies',
      'banners': t('banners') || 'Banners',
      'backgrounds': t('backgrounds') || 'Backgrounds'
    }
    return modelNames[modelKey] || MODELS[modelKey]?.name || modelKey
  }

  return (
    <div className="w-64 bg-white shadow-lg border-r h-screen flex flex-col">
      <div className="p-6 border-b flex-shrink-0">
        <h2 className="text-xl font-bold text-gray-800">{t('adminPanel')}</h2>
        <p className="text-sm text-gray-500">{t('ecommerceBackend') || 'E-commerce Backend'}</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6 pb-6">
          {menuCategories.map((category) => (
            <div key={category.titleKey}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {getCategoryTitle(category.titleKey)}
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
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span className="text-sm font-medium truncate">{getModelName(itemKey)}</span>
                      {item.singleton && (
                        <span className="ml-auto text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded flex-shrink-0">
                          {t('singleton') || 'Single'}
                        </span>
                      )}
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