"use client";

import { createContext, useContext, useState, useEffect } from "react";

// Language translations
const translations = {
  en: {
    // Navigation & Layout
    dashboard: "Dashboard",
    adminPanel: "Admin Panel",
    ecommerceBackend: "E-commerce Backend",
    welcome: "Welcome",
    profile: "Profile",
    logout: "Logout",
    backToDashboard: "← Back to Dashboard",
    cancel: "Cancel",
    update: "Update",
    create: "Create",
    dnd: "Click to upload or drag and drop",

    // Actions
    refresh: "Refresh",
    edit: "Edit",
    delete: "Delete",
    create: "Create",
    update: "Update",
    save: "Save",
    cancel: "Cancel",
    addNew: "Add New",
    search: "Search",
    loading: "Loading",
    saving: "Saving",
    updating: "Updating",
    creating: "Creating",

    // Model Types
    topCategories: "Top Categories",
    categories: "Categories",
    products: "Products",
    about: "About",
    contacts: "Contacts",
    news: "News",
    partners: "Partners",
    certificates: "Projects",
    licenses: "Vendors",
    reviews: "Reviews",
    featuredReviews: "Featured Reviews",
    admins: "Administrators",
    currencies: "Currencies",
    banners: "Banners",
    backgrounds: "Backgrounds",
    discount: "Discount",
    vendorsAbout: "Vendors About",
    officialPartner: "Official Partner",
    experiments: "Experiments",
    companyStats: "Company Stats",

    // Category Types
    coreBusiness: "Core Business",
    information: "Information",
    mediaContent: "Media & Content",
    configuration: "Configuration",
    singleton: "Single",

    // Form Fields
    name: "Name",
    image: "Image",
    description: "Description",
    productName: "Product Name",
    advertisementTitle: "Advertisement Title",
    guarantee: "Guarantee",
    serialNumber: "Serial Number",
    category: "Category",
    topCategory: "Top Category",
    productImages: "Product Images",
    companyName: "Company Name",
    phone: "Phone",
    email: "Email",
    address: "Address",
    workHours: "Work Hours",

    // Messages
    noDataAvailable: "No data available",
    noModelSelected: "No Model Selected",
    selectModelToStart:
      "Please select a model from the sidebar to get started.",
    noMatchingRecords: "No matching records found",
    createdAt: "Created At",
    updatedAt: "Updated At",
    lastUpdated: "Last Updated",
    metadata: "Metadata",

    // Descriptions
    manageData: "Manage your",
    singleRecord: "Single Record",
    manageAllRecords: "Manage all",
    records: "records",
    information: "information",

    // Validation
    required: "is required",

    // Authentication
    adminLogin: "Admin Login",
    adminCredentials: "Enter your admin credentials to access the dashboard",
    adminName: "Admin Name",
    password: "Password",
    newPassword: "New Password",
    login: "Login",
    loggingIn: "Logging in...",

    // Profile
    adminProfile: "Admin Profile",
    updateCredentials: "Update your admin credentials",
    updateAdmin: "Update Admin",
    credentialsUpdatedSuccess: "Admin credentials updated successfully!",

    // Data operations
    itemsCount: "items",
    of: "of",
    page: "Page",
    previous: "Previous",
    next: "Next",

    // Confirmation
    areYouSure: "Are you sure?",
    cannotBeUndone:
      "This action cannot be undone. This will permanently delete this",
    removeFromServers: "and remove it from our servers.",

    // File upload
    clickToUpload: "Click to upload or drag and drop",
    clickToUploadMultiple: "Click to upload multiple images",

    // Language display
    showAllLanguages: "Show all languages",
    notSet: "Not set",

    // Development
    rawData: "Raw Data (Development)",

    // Error messages
    loginFailed: "Login failed",
    updateFailed: "Update failed",
    createFailed: "Create failed",
    deleteFailed: "Delete failed",
    fetchFailed: "Fetch failed",
    uploadFailed: "Upload failed",

    // Additional UI
    actions: "Actions",
    displaying: "Displaying",
    enter: "Enter",
    in: "in",
    preview: "Preview",
    empty: "Empty",
    error: "Error",
    clickToCreate: "Click to create",
    completed: "completed",
    formLanguage: "Form Language",
    currentlyEditing: "Currently editing in",
    select: "Select",
    recommendedImageSize: "Recommended: 16:9 format, 800x450 px"
  },

  ru: {
    // Navigation & Layout
    dashboard: "Панель управления",
    adminPanel: "Панель администратора",
    ecommerceBackend: "Бэкенд электронной коммерции",
    welcome: "Добро пожаловать",
    profile: "Профиль",
    logout: "Выход",
    backToDashboard: "← Назад к панели управления",
    cancel: "Отмена",
    update: "Обновить",
    create: "Создать",
    dnd: "Нажмите для загрузки или перетащите файл",

    // Actions
    refresh: "Обновить",
    edit: "Редактировать",
    delete: "Удалить",
    create: "Создать",
    update: "Обновить",
    save: "Сохранить",
    cancel: "Отмена",
    addNew: "Добавить новый",
    search: "Поиск",
    loading: "Загрузка",
    saving: "Сохранение",
    updating: "Обновление",
    creating: "Создание",

    // Model Types
    topCategories: "Основные категории",
    categories: "Категории",
    products: "Товары",
    about: "О нас",
    contacts: "Контакты",
    news: "Новости",
    partners: "Партнеры",
    certificates: "Проекты",
    licenses: "Вендоры",
    featuredReviews: "Избранные отзывы",
    admins: "Администраторы",
    currencies: "Валюты",
    banners: "Баннеры",
    backgrounds: "Фоны",
    discount: "Скидка",
    vendorsAbout: "О вендорах",
    officialPartner: "Официальный партнёр",
    experiments: "Эксперименты",
    companyStats: "Статистика компании",

    coreBusiness: "Основной бизнес",
    information: "Информация",
    mediaContent: "Медиа и контент",
    configuration: "Конфигурация",
    singleton: "Одиночная",

    // Form Fields
    name: "Название",
    image: "Изображение",
    description: "Описание",
    productName: "Название товара",
    advertisementTitle: "Рекламный заголовок",
    guarantee: "Гарантия",
    serialNumber: "Серийный номер",
    category: "Категория",
    topCategory: "Основная категория",
    productImages: "Изображения товара",
    companyName: "Название компании",
    phone: "Телефон",
    email: "Электронная почта",
    address: "Адрес",
    workHours: "Рабочие часы",

    // Messages
    noDataAvailable: "Данные недоступны",
    noModelSelected: "Модель не выбрана",
    selectModelToStart:
      "Пожалуйста, выберите модель из боковой панели для начала работы.",
    noMatchingRecords: "Подходящие записи не найдены",
    createdAt: "Создано",
    updatedAt: "Обновлено",
    lastUpdated: "Последнее обновление",
    metadata: "Метаданные",

    // Descriptions
    manageData: "Управление вашими",
    singleRecord: "Единственная запись",
    manageAllRecords: "Управление всеми",
    records: "записями",
    information: "информацией",

    // Validation
    required: "обязательно",

    // Authentication
    adminLogin: "Вход администратора",
    adminCredentials:
      "Введите учетные данные администратора для доступа к панели управления",
    adminName: "Имя администратора",
    password: "Пароль",
    newPassword: "Новый пароль",
    login: "Войти",
    loggingIn: "Вход...",

    // Profile
    adminProfile: "Профиль администратора",
    updateCredentials: "Обновите учетные данные администратора",
    updateAdmin: "Обновить администратора",
    credentialsUpdatedSuccess:
      "Учетные данные администратора успешно обновлены!",

    // Data operations
    itemsCount: "элементов",
    of: "из",
    page: "Страница",
    previous: "Предыдущая",
    next: "Следующая",

    // Confirmation
    areYouSure: "Вы уверены?",
    cannotBeUndone: "Это действие нельзя отменить. Это навсегда удалит этот",
    removeFromServers: "и удалит его с наших серверов.",

    // File upload
    clickToUpload: "Нажмите для загрузки или перетащите",
    clickToUploadMultiple: "Нажмите для загрузки нескольких изображений",

    // Language display
    showAllLanguages: "Показать все языки",
    notSet: "Не установлено",

    // Development
    rawData: "Исходные данные (Разработка)",

    // Error messages
    loginFailed: "Ошибка входа",
    updateFailed: "Ошибка обновления",
    createFailed: "Ошибка создания",
    deleteFailed: "Ошибка удаления",
    fetchFailed: "Ошибка загрузки",
    uploadFailed: "Ошибка загрузки файла",

    // Additional UI
    actions: "Действия",
    displaying: "Отображение",
    enter: "Введите",
    in: "на",
    preview: "Предпросмотр",
    empty: "Пусто",
    error: "Ошибка",
    clickToCreate: "Нажмите для создания",
    completed: "завершено",
    formLanguage: "Язык формы",
    currentlyEditing: "Редактирование на",
    select: "Выберите",
    recommendedImageSize: "Рекомендуется: формат 16:9, 800x450 пикселей"
  },

  uz: {
    // Navigation & Layout
    dashboard: "Boshqaruv paneli",
    adminPanel: "Administrator paneli",
    ecommerceBackend: "Elektron tijorat backend",
    welcome: "Xush kelibsiz",
    profile: "Profil",
    logout: "Chiqish",
    backToDashboard: "← Boshqaruv paneliga qaytish",
    cancel: "Bekor qilish",
    update: "Yangilash",
    create: "Yaratish",
    dnd: "Yuklash uchun bosing yoki faylni tortib tashlang",

    // Actions
    refresh: "Yangilash",
    edit: "Tahrirlash",
    delete: "O'chirish",
    create: "Yaratish",
    update: "Yangilash",
    save: "Saqlash",
    cancel: "Bekor qilish",
    addNew: "Yangi qo'shish",
    search: "Qidirish",
    loading: "Yuklanmoqda",
    saving: "Saqlanmoqda",
    updating: "Yangilanmoqda",
    creating: "Yaratilmoqda",

    // Model Types
    topCategories: "Asosiy toifalar",
    categories: "Toifalar",
    products: "Mahsulotlar",
    about: "Biz haqimizda",
    contacts: "Aloqa",
    news: "Yangiliklar",
    partners: "Hamkorlar",
    certificates: "Loyihalar",
    licenses: "Vendorlar",
    featuredReviews: "Tanlangan sharhlar",
    admins: "Administratorlar",
    currencies: "Valyutalar",
    banners: "Bannerlar",
    backgrounds: "Fonlar",
    discount: "Chegirma",
    vendorsAbout: "Vendorlar haqida",
    officialPartner: "Rasmiy hamkor",
    experiments: "Eksperimentlar",
    companyStats: "Kompaniya statistikasi",

    coreBusiness: "Asosiy biznes",
    information: "Ma'lumot",
    mediaContent: "Media va kontent",
    configuration: "Konfiguratsiya",
    singleton: "Yagona",

    // Form Fields
    name: "Nomi",
    image: "Rasm",
    description: "Tavsif",
    productName: "Mahsulot nomi",
    advertisementTitle: "Reklama sarlavhasi",
    guarantee: "Kafolat",
    serialNumber: "Seriya raqami",
    category: "Toifa",
    topCategory: "Asosiy toifa",
    productImages: "Mahsulot rasmlari",
    companyName: "Kompaniya nomi",
    phone: "Telefon",
    email: "Elektron pochta",
    address: "Manzil",
    workHours: "Ish vaqti",

    // Messages
    noDataAvailable: "Ma'lumot mavjud emas",
    noModelSelected: "Model tanlanmagan",
    selectModelToStart: "Boshlash uchun yon paneldan modelni tanlang.",
    noMatchingRecords: "Mos yozuvlar topilmadi",
    createdAt: "Yaratilgan",
    updatedAt: "Yangilangan",
    lastUpdated: "Oxirgi yangilanish",
    metadata: "Metama'lumotlar",

    // Descriptions
    manageData: "Sizning ma'lumotlaringizni boshqarish",
    singleRecord: "Yagona yozuv",
    manageAllRecords: "Barcha yozuvlarni boshqarish",
    records: "yozuvlar",
    information: "ma'lumotlar",

    // Validation
    required: "majburiy",

    // Authentication
    adminLogin: "Administrator kirishi",
    adminCredentials:
      "Boshqaruv paneliga kirish uchun administrator ma'lumotlarini kiriting",
    adminName: "Administrator nomi",
    password: "Parol",
    newPassword: "Yangi parol",
    login: "Kirish",
    loggingIn: "Kirilmoqda...",

    // Profile
    adminProfile: "Administrator profili",
    updateCredentials: "Administrator ma'lumotlarini yangilang",
    updateAdmin: "Administratorni yangilash",
    credentialsUpdatedSuccess:
      "Administrator ma'lumotlari muvaffaqiyatli yangilandi!",

    // Data operations
    itemsCount: "element",
    of: "dan",
    page: "Sahifa",
    previous: "Oldingi",
    next: "Keyingi",

    // Confirmation
    areYouSure: "Ishonchingiz komilmi?",
    cannotBeUndone:
      "Bu amalni bekor qilib bo'lmaydi. Bu quyidagini butunlay o'chiradi",
    removeFromServers: "va uni serverlarimizdan olib tashlaydi.",

    // File upload
    clickToUpload: "Yuklash uchun bosing yoki sudrab tashlang",
    clickToUploadMultiple: "Bir nechta rasmni yuklash uchun bosing",

    // Language display
    showAllLanguages: "Barcha tillarni ko'rsatish",
    notSet: "O'rnatilmagan",

    // Development
    rawData: "Xom ma'lumotlar (Ishlab chiqish)",

    // Error messages
    loginFailed: "Kirish xatosi",
    updateFailed: "Yangilash xatosi",
    createFailed: "Yaratish xatosi",
    deleteFailed: "O'chirish xatosi",
    fetchFailed: "Yuklash xatosi",
    uploadFailed: "Fayl yuklash xatosi",

    // Additional UI
    actions: "Amallar",
    displaying: "Ko'rsatilmoqda",
    enter: "Kiriting",
    in: "da",
    preview: "Oldindan ko'rish",
    empty: "Bo'sh",
    error: "Xato",
    clickToCreate: "Yaratish uchun bosing",
    completed: "bajarildi",
    formLanguage: "Forma tili",
    currentlyEditing: "Hozir tahrirlash",
    select: "Tanlang",
    recommendedImageSize: "Tavsiya etiladi: 16:9 format, 800x450 px"
  },
};

// Language context
const LanguageContext = createContext();

// Language provider component
export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState("en");

  // Load saved language from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLanguage = localStorage.getItem("admin_language");
      if (savedLanguage && translations[savedLanguage]) {
        setCurrentLanguage(savedLanguage);
      }
    }
  }, []);

  // Save language to localStorage when changed
  const changeLanguage = (language) => {
    setCurrentLanguage(language);
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_language", language);
    }
  };

  // Get translation function
  const t = (key, params = {}) => {
    const translation =
      translations[currentLanguage]?.[key] || translations["en"][key] || key;

    // Replace parameters in translation
    return Object.keys(params).reduce((text, param) => {
      return text.replace(`{${param}}`, params[param]);
    }, translation);
  };

  // Get current language info
  const getCurrentLanguageInfo = () => {
    const languageInfo = {
      en: { code: "en", name: "English", flag: "🇺🇸", nativeName: "English" },
      ru: { code: "ru", name: "Russian", flag: "🇷🇺", nativeName: "Русский" },
      uz: { code: "uz", name: "Uzbek", flag: "🇺🇿", nativeName: "O'zbek" },
    };
    return languageInfo[currentLanguage] || languageInfo["en"];
  };

  // Get all available languages
  const getAvailableLanguages = () => {
    return [
      { code: "en", name: "English", flag: "🇺🇸", nativeName: "English" },
      { code: "ru", name: "Russian", flag: "🇷🇺", nativeName: "Русский" },
      { code: "uz", name: "Uzbek", flag: "🇺🇿", nativeName: "O'zbek" },
    ];
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    getCurrentLanguageInfo,
    getAvailableLanguages,
    translations: translations[currentLanguage],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook to use language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

// HOC for components that need translation
export function withTranslation(Component) {
  return function TranslatedComponent(props) {
    const { t, currentLanguage } = useLanguage();
    return <Component {...props} t={t} currentLanguage={currentLanguage} />;
  };
}
