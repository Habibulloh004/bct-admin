export const MODELS = {
  // Core Business Models
  "top-categories": {
    name: "Top Categories",
    icon: "FolderTree",
    fields: [
      { key: "name", label: "Name", type: "multilingual", required: true },
      { key: "image", label: "Image", type: "file" },
    ],
    displayFields: ["name", "image", "created_at"],
  },
  categories: {
    name: "Categories",
    icon: "Folder",
    fields: [
      { key: "name", label: "Name", type: "multilingual", required: true },
      { key: "image", label: "Image", type: "file" },
      {
        key: "top_category_id",
        label: "Top Category",
        type: "select",
        options: "top-categories",
      },
    ],
    displayFields: ["name", "image", "created_at"],
  },
  products: {
    name: "Products",
    icon: "Package",
    fields: [
      {
        key: "name",
        label: "Product Name",
        type: "multilingual",
        required: true,
      },
      { key: "ads_title", label: "Advertisement Title", type: "multilingual" },
      { key: "image", label: "Product Images", type: "file-multiple" },
      {
        key: "description",
        label: "Description",
        type: "multilingual-textarea",
        required: true,
      },
      { key: "guarantee", label: "Guarantee", type: "multilingual" },
      { key: "serial_number", label: "Serial Number", type: "text" },
      {
        key: "category_id",
        label: "Category",
        type: "select",
        options: "categories",
      },
    ],
    displayFields: ["name", "ads_title", "category_id", "created_at"],
  },

  // Example for other models with multilingual support
  // about: {
  //   name: "About",
  //   icon: "Info",
  //   fields: [
  //     {
  //       key: "creation",
  //       label: "Creation Info",
  //       type: "multilingual-textarea",
  //     },
  //     { key: "clients", label: "Clients Info", type: "multilingual-textarea" },
  //     {
  //       key: "partners",
  //       label: "Partners Info",
  //       type: "multilingual-textarea",
  //     },
  //     {
  //       key: "technologies",
  //       label: "Technologies",
  //       type: "multilingual-textarea",
  //     },
  //     { key: "scaners", label: "Scanners", type: "multilingual-textarea" },
  //     { key: "scales", label: "Scales", type: "multilingual-textarea" },
  //     { key: "printers", label: "Printers", type: "multilingual-textarea" },
  //     { key: "cashiers", label: "Cashiers", type: "multilingual-textarea" },
  //   ],
  //   displayFields: ["creation", "clients", "partners"],
  //   singleton: true,
  // },
  // contacts: {
  //   name: "Contacts",
  //   icon: "Contact",
  //   fields: [
  //     {
  //       key: "company_name",
  //       label: "Company Name",
  //       type: "multilingual",
  //       required: true,
  //     },
  //     { key: "phone1", label: "Phone 1", type: "text", required: true },
  //     { key: "phone2", label: "Phone 2", type: "text" },
  //     { key: "work_hours", label: "Work Hours", type: "multilingual" },
  //     { key: "email", label: "Email", type: "email", required: true },
  //     { key: "address", label: "Address", type: "multilingual-textarea" },
  //     { key: "telegram", label: "Telegram", type: "text" },
  //     { key: "telegram_bot", label: "Telegram Bot", type: "text" },
  //     { key: "facebook", label: "Facebook", type: "text" },
  //     { key: "instagram", label: "Instagram", type: "text" },
  //     { key: "youtube", label: "YouTube", type: "text" },
  //     {
  //       key: "footer_info",
  //       label: "Footer Info",
  //       type: "multilingual-textarea",
  //     },
  //     {
  //       key: "experience_info",
  //       label: "Experience Info",
  //       type: "multilingual-textarea",
  //     },
  //   ],
  //   displayFields: ["company_name", "phone1", "email", "created_at"],
  // },
  // news: {
  //   name: "News",
  //   icon: "Newspaper",
  //   fields: [
  //     {
  //       key: "name",
  //       label: "News Title",
  //       type: "multilingual",
  //       required: true,
  //     },
  //     { key: "content", label: "News Content", type: "multilingual-textarea" },
  //     { key: "image", label: "News Image", type: "file" },
  //   ],
  //   displayFields: ["name", "image", "created_at"],
  // },
  // partners: {
  //   name: "Partners",
  //   icon: "Handshake",
  //   fields: [
  //     {
  //       key: "name",
  //       label: "Partner Name",
  //       type: "multilingual",
  //       required: true,
  //     },
  //     {
  //       key: "description",
  //       label: "Description",
  //       type: "multilingual-textarea",
  //     },
  //     { key: "image", label: "Partner Logo", type: "file" },
  //   ],
  //   displayFields: ["name", "image", "created_at"],
  // },
  // certificates: {
  //   name: "Certificates",
  //   icon: "Award",
  //   fields: [
  //     {
  //       key: "name",
  //       label: "Certificate Name",
  //       type: "multilingual",
  //       required: true,
  //     },
  //     {
  //       key: "description",
  //       label: "Description",
  //       type: "multilingual-textarea",
  //     },
  //     { key: "image", label: "Certificate Image", type: "file" },
  //   ],
  //   displayFields: ["name", "image", "created_at"],
  // },
  // licenses: {
  //   name: "Licenses",
  //   icon: "FileCheck",
  //   fields: [
  //     {
  //       key: "name",
  //       label: "License Name",
  //       type: "multilingual",
  //       required: true,
  //     },
  //     {
  //       key: "description",
  //       label: "Description",
  //       type: "multilingual-textarea",
  //     },
  //     { key: "image", label: "License Image", type: "file" },
  //   ],
  //   displayFields: ["name", "image", "created_at"],
  // },
};

// Helper functions for multilingual data
export const MultilingualHelpers = {
  // Parse multilingual string "english***russian***uzbek" to object
  parseMultilingual: (value) => {
    if (!value || typeof value !== "string") return { en: "", ru: "", uz: "" };
    const parts = value.split("***");
    return {
      en: parts[0] || "",
      ru: parts[1] || "",
      uz: parts[2] || "",
    };
  },

  // Convert multilingual object to string "english***russian***uzbek"
  formatMultilingual: (multilingualObj) => {
    if (!multilingualObj || typeof multilingualObj !== "object") return "";
    const { en = "", ru = "", uz = "" } = multilingualObj;
    return `${en}***${ru}***${uz}`;
  },

  // Get display value for current language
  getDisplayValue: (value, language = "en") => {
    if (!value) return "";
    if (typeof value === "string" && value.includes("***")) {
      const parsed = MultilingualHelpers.parseMultilingual(value);
      return parsed[language] || parsed.en || "";
    }
    return value;
  },

  // Language labels
  languageLabels: {
    en: "English",
    ru: "Русский",
    uz: "O'zbek",
  },
};


// export const MODELS = {
  // Core Business Models
  // 'clients': {
  //   name: 'Clients',
  //   icon: 'User',
  //   fields: [
  //     { key: 'name', label: 'Name', type: 'text', required: true },
  //     { key: 'email', label: 'Email', type: 'email', required: true },
  //     { key: 'phone', label: 'Phone', type: 'text', required: true },
  //     { key: 'password', label: 'Password', type: 'password', required: true },
  //     { key: 'image', label: 'Profile Image', type: 'file' },
  //     { key: 'url', label: 'Website URL', type: 'text' }
  //   ],
  //   displayFields: ['name', 'email', 'phone', 'created_at']
  // },
  // 'top-categories': {
  //   name: 'Top Categories',
  //   icon: 'FolderTree',
  //   fields: [
  //     { key: 'name', label: 'Name', type: 'text', required: true },
  //     { key: 'image', label: 'Image', type: 'file' }
  //   ],
  //   displayFields: ['name', 'image', 'created_at']
  // },
  // 'categories': {
  //   name: 'Categories',
  //   icon: 'Folder',
  //   fields: [
  //     { key: 'name', label: 'Name', type: 'text', required: true },
  //     { key: 'image', label: 'Image', type: 'file' },
  //     { key: 'top_category_id', label: 'Top Category', type: 'select', options: 'top-categories' }
  //   ],
  //   displayFields: ['name', 'image', 'created_at']
  // },
  // 'products': {
  //   name: 'Products',
  //   icon: 'Package',
  //   fields: [
  //     { key: 'name', label: 'Product Name', type: 'text', required: true },
  //     { key: 'ads_title', label: 'Advertisement Title', type: 'text' },
  //     { key: 'image', label: 'Product Images', type: 'file-multiple' },
  //     { key: 'description', label: 'Description', type: 'textarea', required: true },
  //     { key: 'guarantee', label: 'Guarantee', type: 'text' },
  //     { key: 'serial_number', label: 'Serial Number', type: 'text' },
  //     { key: 'category_id', label: 'Category', type: 'select', options: 'categories' }
  //   ],
  //   displayFields: ['name', 'ads_title', 'category_id', 'created_at']
  // },
  // 'orders': {
  //   name: 'Orders',
  //   icon: 'ShoppingCart',
  //   fields: [
  //     { key: 'phone', label: 'Customer Phone', type: 'text', required: true },
  //     { key: 'pay_type', label: 'Payment Type', type: 'select', options: 'payment_types', required: true },
  //     { key: 'client_id', label: 'Client', type: 'select', options: 'clients' }
  //   ],
  //   displayFields: ['phone', 'pay_type', 'client_id', 'created_at'],
  //   customOptions: {
  //     payment_types: [
  //       { id: 'cash', name: 'Cash' },
  //       { id: 'card', name: 'Credit Card' },
  //       { id: 'bank_transfer', name: 'Bank Transfer' },
  //       { id: 'online', name: 'Online Payment' }
  //     ]
  //   }
  // },

  // Information Pages (Singleton Models)
  // 'about': {
  //   name: 'About',
  //   icon: 'Info',
  //   fields: [
  //     { key: 'creation', label: 'Creation Info', type: 'textarea' },
  //     { key: 'clients', label: 'Clients Info', type: 'textarea' },
  //     { key: 'partners', label: 'Partners Info', type: 'textarea' },
  //     { key: 'technologies', label: 'Technologies', type: 'textarea' },
  //     { key: 'scaners', label: 'Scanners', type: 'textarea' },
  //     { key: 'scales', label: 'Scales', type: 'textarea' },
  //     { key: 'printers', label: 'Printers', type: 'textarea' },
  //     { key: 'cashiers', label: 'Cashiers', type: 'textarea' }
  //   ],
  //   displayFields: ['creation', 'clients', 'partners'],
  //   singleton: true
  // },
  // 'links': {
  //   name: 'Social Links',
  //   icon: 'Link',
  //   fields: [
  //     { key: 'facebook', label: 'Facebook URL', type: 'text' },
  //     { key: 'instagram', label: 'Instagram URL', type: 'text' },
  //     { key: 'linkedin', label: 'LinkedIn URL', type: 'text' },
  //     { key: 'youtube', label: 'YouTube URL', type: 'text' }
  //   ],
  //   displayFields: ['facebook', 'instagram', 'linkedin', 'youtube'],
  //   singleton: true
  // },
  // 'contacts': {
  //   name: 'Contacts',
  //   icon: 'Contact',
  //   fields: [
  //     { key: 'company_name', label: 'Company Name', type: 'text', required: true },
  //     { key: 'phone1', label: 'Phone 1', type: 'text', required: true },
  //     { key: 'phone2', label: 'Phone 2', type: 'text' },
  //     { key: 'work_hours', label: 'Work Hours', type: 'text' },
  //     { key: 'email', label: 'Email', type: 'email', required: true },
  //     { key: 'address', label: 'Address', type: 'textarea' },
  //     { key: 'telegram', label: 'Telegram', type: 'text' },
  //     { key: 'telegram_bot', label: 'Telegram Bot', type: 'text' },
  //     { key: 'facebook', label: 'Facebook', type: 'text' },
  //     { key: 'instagram', label: 'Instagram', type: 'text' },
  //     { key: 'youtube', label: 'YouTube', type: 'text' },
  //     { key: 'footer_info', label: 'Footer Info', type: 'textarea' },
  //     { key: 'experience_info', label: 'Experience Info', type: 'textarea' }
  //   ],
  //   displayFields: ['company_name', 'phone1', 'email', 'created_at']
  // },

  // Media and Content
  // 'vendors': {
  //   name: 'Vendors',
  //   icon: 'Building',
  //   fields: [
  //     { key: 'image', label: 'Vendor Logo', type: 'file', required: true },
  //     { key: 'url', label: 'Website URL', type: 'text' }
  //   ],
  //   displayFields: ['image', 'url', 'created_at']
  // },
  // 'projects': {
  //   name: 'Projects',
  //   icon: 'Briefcase',
  //   fields: [
  //     { key: 'image', label: 'Project Image', type: 'file', required: true },
  //     { key: 'url', label: 'Project URL', type: 'text' }
  //   ],
  //   displayFields: ['image', 'url', 'created_at']
  // },
  // 'partners': {
  //   name: 'Partners',
  //   icon: 'Handshake',
  //   fields: [
  //     { key: 'name', label: 'Partner Name', type: 'text', required: true },
  //     { key: 'image', label: 'Partner Logo', type: 'file' }
  //   ],
  //   displayFields: ['name', 'image', 'created_at']
  // },
  // 'news': {
  //   name: 'News',
  //   icon: 'Newspaper',
  //   fields: [
  //     { key: 'name', label: 'News Title', type: 'text', required: true },
  //     { key: 'image', label: 'News Image', type: 'file' }
  //   ],
  //   displayFields: ['name', 'image', 'created_at']
  // },

  // Reviews and Feedback
  // 'reviews': {
  //   name: 'Reviews',
  //   icon: 'MessageSquare',
  //   fields: [
  //     { key: 'name', label: 'Customer Name', type: 'text', required: true },
  //     { key: 'phone', label: 'Phone Number', type: 'text', required: true },
  //     { key: 'email', label: 'Email Address', type: 'email', required: true },
  //     { key: 'message', label: 'Review Message', type: 'textarea', required: true }
  //   ],
  //   displayFields: ['name', 'phone', 'email', 'created_at']
  // },
  // 'select-reviews': {
  //   name: 'Featured Reviews',
  //   icon: 'Star',
  //   fields: [
  //     { key: 'review_id', label: 'Original Review', type: 'select', options: 'reviews' },
  //     { key: 'name', label: 'Customer Name', type: 'text', required: true },
  //     { key: 'phone', label: 'Phone Number', type: 'text', required: true },
  //     { key: 'email', label: 'Email Address', type: 'email', required: true },
  //     { key: 'message', label: 'Review Message', type: 'textarea', required: true }
  //   ],
  //   displayFields: ['name', 'phone', 'email', 'created_at']
  // },

  // // Certifications and Legal
  // 'sertificates': {
  //   name: 'Certificates',
  //   icon: 'Award',
  //   fields: [
  //     { key: 'name', label: 'Certificate Name', type: 'text', required: true },
  //     { key: 'image', label: 'Certificate Image', type: 'file' }
  //   ],
  //   displayFields: ['name', 'image', 'created_at']
  // },
  // 'licenses': {
  //   name: 'Licenses',
  //   icon: 'FileCheck',
  //   fields: [
  //     { key: 'name', label: 'License Name', type: 'text', required: true },
  //     { key: 'image', label: 'License Image', type: 'file' }
  //   ],
  //   displayFields: ['name', 'image', 'created_at']
  // },

  // System Configuration
  // 'admins': {
  //   name: 'Admins',
  //   icon: 'Shield',
  //   fields: [
  //     { key: 'name', label: 'Admin Name', type: 'text', required: true },
  //     { key: 'password', label: 'Password', type: 'password', required: true }
  //   ],
  //   displayFields: ['name', 'created_at']
  // },
  // 'currencies': {
  //   name: 'Currencies',
  //   icon: 'DollarSign',
  //   fields: [
  //     { key: 'sum', label: 'Currency Amount', type: 'text', required: true }
  //   ],
  //   displayFields: ['sum', 'created_at']
  // },
  // 'banners': {
  //   name: 'Banners',
  //   icon: 'Image',
  //   fields: [
  //     { key: 'image', label: 'Banner Image', type: 'file', required: true },
  //     { key: 'top_category_id', label: 'Top Category', type: 'select', options: 'top-categories' },
  //     { key: 'category_id', label: 'Category', type: 'select', options: 'categories' },
  //     { key: 'product_id', label: 'Product', type: 'select', options: 'products' }
  //   ],
  //   displayFields: ['image', 'created_at']
  // },
  // 'backgrounds': {
  //   name: 'Backgrounds',
  //   icon: 'Wallpaper',
  //   fields: [
  //     { key: 'name', label: 'Background Name', type: 'text', required: true },
  //     { key: 'image', label: 'Background Image', type: 'file', required: true }
  //   ],
  //   displayFields: ['name', 'image', 'created_at']
  // },

  // Sorting and Organization
  // 'banner-sorts': {
  //   name: 'Banner Sorting',
  //   icon: 'ArrowUpDown',
  //   fields: [
  //     { key: 'unique_id', label: 'Sort Order', type: 'text' },
  //     { key: 'banner_id', label: 'Banner', type: 'select', options: 'banners' },
  //     { key: 'image', label: 'Banner Image', type: 'file' },
  //     { key: 'top_category_id', label: 'Top Category', type: 'select', options: 'top-categories' },
  //     { key: 'category_id', label: 'Category', type: 'select', options: 'categories' },
  //     { key: 'product_id', label: 'Product', type: 'select', options: 'products' }
  //   ],
  //   displayFields: ['unique_id', 'banner_id', 'created_at']
  // },
  // 'top-category-sorts': {
  //   name: 'Top Category Sorting',
  //   icon: 'ArrowUpDown',
  //   fields: [
  //     { key: 'name', label: 'Sort Name', type: 'text', required: true },
  //     { key: 'top_category_id', label: 'Top Category', type: 'select', options: 'top-categories' },
  //     { key: 'unique_id', label: 'Sort Order', type: 'text' }
  //   ],
  //   displayFields: ['name', 'unique_id', 'created_at']
  // },
  // 'category-sorts': {
  //   name: 'Category Sorting',
  //   icon: 'ArrowUpDown',
  //   fields: [
  //     { key: 'unique_id', label: 'Sort Order', type: 'text', required: true },
  //     { key: 'category_id', label: 'Category', type: 'select', options: 'categories', required: true },
  //     { key: 'top_category_sort_id', label: 'Top Category Sort ID', type: 'text', required: true },
  //     { key: 'name', label: 'Sort Name', type: 'text', required: true }
  //   ],
  //   displayFields: ['name', 'unique_id', 'category_id', 'created_at']
  // }
// };