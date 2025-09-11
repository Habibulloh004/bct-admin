export const MODELS = {
  // Core Business Models
  // "top-categories": {
  //   name: "Top Categories",
  //   icon: "FolderTree",
  //   fields: [
  //     { key: "name", label: "Name", type: "multilingual", required: true },
  //     { key: "image", label: "Image", type: "file" },
  //   ],
  //   displayFields: ["name", "image", "created_at"],
  // },
  categories: {
    name: "Categories",
    icon: "Folder",
    fields: [
      { key: "name", label: "Name", type: "multilingual", required: true },
      { key: "image", label: "Image", type: "file" },
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
        type: "multilingual-table", // Changed to rich text
        required: true,
      },
      { key: "guarantee", label: "Guarantee", type: "multilingual" },
      { key: "serial_number", label: "Serial Number", type: "text" },
      { key: "price", label: "Price", type: "text" },
      { key: "discount", label: "Discount", type: "text" },
      {
        key: "category_id",
        label: "Category",
        type: "select",
        options: "categories",
      },
      // {
      //   key: "active",
      //   label: "Active",
      //   type: "select",
      //   options: "boolean",
      // },
      // { key: "index", label: "Index", type: "number", default: 0 },
    ],
    displayFields: [
      "name",
      "ads_title",
      "price",
      "category_id",
      "created_at",
    ],
    customOptions: {
      boolean: [
        { id: "true", name: "True" },
        { id: "false", name: "False" },
      ],
    },
  },

  // Information Pages (Singleton Models)
  about: {
    name: "About",
    icon: "Info",
    fields: [
      {
        key: "creation",
        label: "Creation Info",
        type: "multilingual-rich-text", // Changed to rich text
      },
      {
        key: "clients",
        label: "Clients Info",
        type: "multilingual-rich-text" // Changed to rich text
      },
      {
        key: "partners",
        label: "Partners Info",
        type: "multilingual-rich-text", // Changed to rich text
      },
      {
        key: "technologies",
        label: "Technologies",
        type: "multilingual-rich-text", // Changed to rich text
      },
      {
        key: "scaners",
        label: "Scanners",
        type: "multilingual-rich-text" // Changed to rich text
      },
      {
        key: "scales",
        label: "Scales",
        type: "multilingual-rich-text" // Changed to rich text
      },
      {
        key: "printers",
        label: "Printers",
        type: "multilingual-rich-text" // Changed to rich text
      },
      {
        key: "cashiers",
        label: "Cashiers",
        type: "multilingual-rich-text" // Changed to rich text
      },
    ],
    displayFields: ["creation", "clients", "partners", "technologies"],
    singleton: true,
  },
  contacts: {
    name: "Contacts",
    icon: "Contact",
    fields: [
      {
        key: "company_name",
        label: "Company Name",
        type: "text",
        required: true,
      },
      { key: "phone1", label: "Phone", type: "text", required: true },
      { key: "work_hours", label: "Work Hours", type: "multilingual" },
      { key: "email", label: "Email", type: "email", required: true },
      {
        key: "address",
        label: "Address",
        type: "multilingual" // Changed to rich text
      },
      { key: "telegram", label: "Telegram", type: "text" },
      { key: "telegram_bot", label: "Telegram Bot", type: "text" },
      { key: "facebook", label: "Facebook", type: "text" },
      { key: "instagram", label: "Instagram", type: "text" },
      { key: "youtube", label: "YouTube", type: "text" },
      // {
      //   key: "footer_info",
      //   label: "Footer Info",
      //   type: "multilingual-rich-text", // Changed to rich text
      // },
      // {
      //   key: "experience_info",
      //   label: "Experience Info",
      //   type: "multilingual-rich-text", // Changed to rich text
      // },
    ],
    displayFields: ["company_name", "phone1", "email"],
  },

  // Media and Content
  news: {
    name: "News",
    icon: "Newspaper",
    fields: [
      {
        key: "name",
        label: "News Title",
        type: "multilingual",
        required: true,
      },
      {
        key: "content",
        label: "News Content",
        type: "multilingual-rich-text" // Changed to rich text
      },
      { key: "image", label: "News Image", type: "file" },
    ],
    displayFields: ["name", "image", "created_at"],
  },
  partners: {
    name: "Partners",
    icon: "Handshake",
    fields: [
      {
        key: "name",
        label: "Partner Name",
        type: "text",
        required: true,
      },
      { key: "image", label: "Partner Logo", type: "file" },
    ],
    displayFields: ["name", "image", "created_at"],
  },
  sertificates: {
    name: "Projects",
    icon: "Award",
    fields: [
      {
        key: "name",
        label: "Project Name",
        type: "multilingual",
        required: true,
      },
      {
        key: "description",
        label: "Description",
        type: "multilingual-rich-text", // Changed to rich text
      },
      { key: "image", label: "Project Image", type: "file" },
    ],
    displayFields: ["name", "image", "created_at"],
  },
  licenses: {
    name: "Vendors",
    icon: "FileCheck",
    fields: [
      {
        key: "name",
        label: "Vendors Name",
        type: "text",
      },
      { key: "image", label: "Vendors Image", type: "file", required: true },
      {
        key: "description",
        label: "Vendors Name",
        type: "multilingual",
        required: true,
      },
    ],
    displayFields: ["name", "image", "created_at"],
  },
  "vendors-about": {
    name: "Vendors About",
    icon: "FileCheck",
    fields: [
      { key: "name", label: "Vendors Name", type: "text" },
      { key: "image", label: "Vendors Image", type: "file", required: true },
    ],
    displayFields: ["name", "image", "created_at"],
  },

  // Reviews and Feedback
  reviews: {
    name: "Reviews",
    icon: "MessageSquare",
    fields: [
      { key: "name", label: "Customer Name", type: "text", required: true },
      { key: "phone", label: "Phone Number", type: "text", required: true },
      { key: "email", label: "Email Address", type: "email", required: true },
      { key: "message", label: "Review Message", type: "textarea", required: true }
    ],
    displayFields: ["name", "phone", "email", "created_at"]
  },
  "official-partner": {
    name: "Official Partner",
    icon: "Handshake",
    fields: [
      { key: "name", label: "Title", type: "multilingual", required: true },
      { key: "image", label: "Vendors Image", type: "file", required: true },
    ],
    displayFields: ["name", "image", "created_at"],
    singleton: true,
  },
  experiments: {
    name: "Experiments",
    icon: "Briefcase",
    fields: [
      { key: "count", label: "Count", type: "text" },
      { key: "title", label: "Title", type: "multilingual" },
      { key: "description", label: "Description", type: "multilingual" },
    ],
    displayFields: ["count", "title", "created_at"],
  },

  "company-stats": {
    name: "Company Stats",
    icon: "Building",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "multilingual" },
      { key: "image", label: "Vendors Image", type: "file", required: true },
    ],
    displayFields: ["title", "image", "created_at"],
  },

  // System Configuration
  admins: {
    name: "Admins",
    icon: "Shield",
    fields: [
      { key: "name", label: "Admin Name", type: "text", required: true },
      { key: "password", label: "Password", type: "password", required: true }
    ],
    displayFields: ["name", "created_at"]
  },
  currencies: {
    name: "Currencies",
    icon: "DollarSign",
    fields: [
      { key: "sum", label: "Currency Amount", type: "text", required: true }
    ],
    displayFields: ["sum", "created_at"]
  },
  banners: {
    name: "Banners",
    icon: "Image",
    fields: [
      { key: "image", label: "Banner Image", type: "file", required: true },
      {
        key: "title",
        label: "Title",
        type: "multilingual",
        required: true,
      },
      {
        key: "description",
        label: "Description",
        type: "multilingual",
        required: true,
      },
      // { key: "top_category_id", label: "Top Category", type: "select", options: "top-categories" },
      { key: "category_id", label: "Category", type: "select", options: "categories" },
      { key: "product_id", label: "Product", type: "select", options: "products" }
    ],
    displayFields: ["image", "created_at"]
  },
  backgrounds: {
    name: "Backgrounds",
    icon: "Wallpaper",
    fields: [
      { key: "name", label: "Background Name", type: "multilingual", required: true },
      { key: "image", label: "Background Image", type: "file", required: true }
    ],
    displayFields: ["name", "image", "created_at"]
  },
  discount: {
    name: "Discount",
    icon: "Image",
    fields: [
      {
        key: "title",
        label: "Title",
        type: "multilingual",
        required: true,
      },
      { key: "product_id", label: "Product", type: "select", options: "products" }
    ],
    displayFields: ["title", "created_at"],
    singleton: true,
  },
  "select-products": {
    name: "Select Products",
    icon: "Image",
    fields: [
      { key: "product_id", label: "Product", type: "select", options: "products" }
    ]
  },
  // Additional Models
  "select-reviews": {
    name: "Colors",
    icon: "Color",
    fields: [
      { key: "name", label: "Color Name", type: "text", required: true },
      { key: "email", label: "Color key", type: "text", required: true },
      { key: "message", label: "Color", type: "select-color", required: true }
    ],
    displayFields: ["name", "email", "message", "created_at"]
  },
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