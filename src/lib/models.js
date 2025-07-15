export const MODELS = {
    'reviews': {
      name: 'Reviews',
      icon: 'MessageSquare',
      fields: [
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'phone', label: 'Phone', type: 'text', required: true },
        { key: 'email', label: 'Email', type: 'email', required: true },
        { key: 'message', label: 'Message', type: 'textarea', required: true }
      ],
      displayFields: ['name', 'phone', 'email', 'created_at']
    },
    'top-categories': {
      name: 'Top Categories',
      icon: 'FolderTree',
      fields: [
        { key: 'name', label: 'Name', type: 'text', required: true }
      ],
      displayFields: ['name', 'created_at']
    },
    'categories': {
      name: 'Categories',
      icon: 'Folder',
      fields: [
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'image', label: 'Image', type: 'file' },
        { key: 'top_category_id', label: 'Top Category', type: 'select', options: 'top-categories' }
      ],
      displayFields: ['name', 'image', 'created_at']
    },
    'products': {
      name: 'Products',
      icon: 'Package',
      fields: [
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'description', label: 'Description', type: 'textarea', required: true },
        { key: 'feature', label: 'Features', type: 'textarea' },
        { key: 'price', label: 'Price', type: 'text', required: true },
        { key: 'brand', label: 'Brand', type: 'text', required: true },
        { key: 'image', label: 'Images', type: 'file-multiple' },
        { key: 'category_id', label: 'Category', type: 'select', options: 'categories' }
      ],
      displayFields: ['name', 'brand', 'price', 'created_at']
    },
    'sertificates': {
      name: 'Certificates',
      icon: 'Award',
      fields: [
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'image', label: 'Image', type: 'file' }
      ],
      displayFields: ['name', 'image', 'created_at']
    },
    'licenses': {
      name: 'Licenses',
      icon: 'FileCheck',
      fields: [
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'image', label: 'Image', type: 'file' }
      ],
      displayFields: ['name', 'image', 'created_at']
    },
    'news': {
      name: 'News',
      icon: 'Newspaper',
      fields: [
        { key: 'name', label: 'Title', type: 'text', required: true },
        { key: 'image', label: 'Image', type: 'file' }
      ],
      displayFields: ['name', 'image', 'created_at']
    },
    'partners': {
      name: 'Partners',
      icon: 'Handshake',
      fields: [
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'image', label: 'Image', type: 'file' }
      ],
      displayFields: ['name', 'image', 'created_at']
    },
    'admins': {
      name: 'Admins',
      icon: 'Shield',
      fields: [
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'password', label: 'Password', type: 'password', required: true }
      ],
      displayFields: ['name', 'created_at']
    },
    'currencies': {
      name: 'Currencies',
      icon: 'DollarSign',
      fields: [
        { key: 'sum', label: 'Amount', type: 'text', required: true }
      ],
      displayFields: ['sum', 'created_at']
    },
    'banners': {
      name: 'Banners',
      icon: 'Image',
      fields: [
        { key: 'image', label: 'Image', type: 'file', required: true },
        { key: 'top_category_id', label: 'Top Category', type: 'select', options: 'top-categories' },
        { key: 'category_id', label: 'Category', type: 'select', options: 'categories' },
        { key: 'product_id', label: 'Product', type: 'select', options: 'products' }
      ],
      displayFields: ['image', 'created_at']
    },
    'backgrounds': {
      name: 'Backgrounds',
      icon: 'Wallpaper',
      fields: [
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'image', label: 'Image', type: 'file', required: true }
      ],
      displayFields: ['name', 'image', 'created_at']
    },
    'contacts': {
      name: 'Contacts',
      icon: 'Contact',
      fields: [
        { key: 'company_name', label: 'Company Name', type: 'text', required: true },
        { key: 'phone1', label: 'Phone 1', type: 'text', required: true },
        { key: 'phone2', label: 'Phone 2', type: 'text' },
        { key: 'work_hours', label: 'Work Hours', type: 'text' },
        { key: 'email', label: 'Email', type: 'email', required: true },
        { key: 'address', label: 'Address', type: 'textarea' },
        { key: 'telegram', label: 'Telegram', type: 'text' },
        { key: 'telegram_bot', label: 'Telegram Bot', type: 'text' },
        { key: 'facebook', label: 'Facebook', type: 'text' },
        { key: 'instagram', label: 'Instagram', type: 'text' },
        { key: 'youtube', label: 'YouTube', type: 'text' },
        { key: 'footer_info', label: 'Footer Info', type: 'textarea' },
        { key: 'experience_info', label: 'Experience Info', type: 'textarea' }
      ],
      displayFields: ['company_name', 'phone1', 'email', 'created_at']
    }
  };