"use client";

import { useState, useEffect } from "react";
import { IMG_URL, useStore } from "@/lib/store";
import { MODELS, MultilingualHelpers } from "@/lib/models";
import { MultilingualDisplay } from "@/components/MultilingualInput";
import { useLanguage } from "@/lib/LanguageContext";
import Sidebar from "./Sidebar";
import DataTable from "./DataTable";
import CreateEditForm from "./CreateEditForm";
import SingletonForm from "./SingletonForm";
import AdminProfile from "./AdminProfile";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  LogOut,
  AlertCircle,
  Settings,
  User,
  Edit,
  Globe,
  RefreshCw,
  Home,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";

export default function AdminDashboard() {
  // State management
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [isSingletonEditOpen, setIsSingletonEditOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Language and store hooks
  const { t, currentLanguage, changeLanguage, getAvailableLanguages } =
    useLanguage();
  const {
    user,
    logout,
    currentModel,
    data,
    fetchData,
    fetchSingletonData,
    loading,
    error,
    clearError,
  } = useStore();

  // Fetch data when model changes
  useEffect(() => {
    if (currentModel && MODELS[currentModel]) {
      const modelConfig = MODELS[currentModel];
      if (modelConfig.singleton) {
        fetchSingletonData(currentModel);
      } else {
        fetchData(currentModel);
      }
    }
  }, [currentModel, fetchData, fetchSingletonData]);

  // Get current model configuration and data
  const currentModelConfig = MODELS[currentModel];
  const currentData = data[currentModel];
  const isSingleton = currentModelConfig?.singleton;

  // Get translated model name
  const getModelName = (modelKey) => {
    const modelTranslations = {
      "top-categories": t("topCategories"),
      categories: t("categories"),
      products: t("products"),
      about: t("about"),
      contacts: t("contacts"),
      news: t("news"),
      partners: t("partners"),
      certificates: t("certificates"),
      licenses: t("licenses"),
    };
    return (
      modelTranslations[modelKey] || currentModelConfig?.name || t("dashboard")
    );
  };

  // Get breadcrumb path
  const getBreadcrumbPath = () => {
    const paths = [
      { name: t("dashboard"), icon: Home, active: false },
      { name: getModelName(currentModel), icon: null, active: true },
    ];
    return paths;
  };

  // Event handlers
  const handleEdit = (item) => {
    setEditingItem(item);
  };

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false);
    setEditingItem(null);
    setIsSingletonEditOpen(false);
  };

  const handleSuccess = () => {
    handleCloseDialog();
    // Refresh data after successful operation
    if (isSingleton) {
      fetchSingletonData(currentModel);
    } else {
      fetchData(currentModel);
    }
  };

  const handleSingletonEdit = () => {
    setIsSingletonEditOpen(true);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (isSingleton) {
        await fetchSingletonData(currentModel);
      } else {
        await fetchData(currentModel);
      }
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm(t("areYouSure") + " " + t("logout") + "?")) {
      logout();
    }
  };

  // Show profile page
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
              {t("backToDashboard")}
            </Button>
          </div>
          <AdminProfile />
        </div>
      </div>
    );
  }

  // Main dashboard render
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`transition-all duration-300 ${sidebarCollapsed ? "w-16" : "w-64"
          }`}
      >
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Left side - Title and Breadcrumbs */}
            <div className="flex items-center space-x-4">
              <div>
                {/* Breadcrumb Navigation */}
                <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                  {getBreadcrumbPath().map((path, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      {index > 0 && <ChevronRight className="h-3 w-3" />}
                      <div
                        className={`flex items-center space-x-1 ${path.active
                            ? "text-gray-900 font-medium"
                            : "hover:text-gray-700"
                          }`}
                      >
                        {path.icon && <path.icon className="h-3 w-3" />}
                        <span>{path.name}</span>
                      </div>
                    </div>
                  ))}
                </nav>

                {/* Main Title */}
                <h1 className="text-2xl font-bold text-gray-900">
                  {getModelName(currentModel)}
                </h1>
                <p className="text-sm text-gray-500">
                  {isSingleton
                    ? `${t("manageData")} ${getModelName(
                      currentModel
                    ).toLowerCase()} ${t("information")}`
                    : `${t("manageAllRecords")} ${getModelName(
                      currentModel
                    ).toLowerCase()} ${t("records")}`}
                  {isSingleton && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {t("singleRecord")}
                    </span>
                  )}
                </p>
              </div>

              {/* Refresh Button */}
              {/* <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing || loading}
                className="flex items-center space-x-2"
                title={t("refresh")}
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">{t("refresh")}</span>
              </Button> */}
            </div>

            {/* Right side - Actions and User Menu */}
            <div className="flex items-center space-x-4">
              {/* Data Count (for non-singleton models) */}
              {!isSingleton && currentData && (
                <div className="hidden sm:flex items-center text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  <span className="font-medium text-gray-700">
                    {currentData.total || 0}
                  </span>
                  <span className="ml-1">{t("itemsCount")}</span>
                </div>
              )}

              {/* Global Language Selector */}
              <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-1">
                <Globe className="h-4 w-4 text-gray-500" />
                <Select value={currentLanguage} onValueChange={changeLanguage}>
                  <SelectTrigger className="w-24 border-0 bg-transparent shadow-none p-0 h-auto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableLanguages().map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <div className="flex items-center space-x-2 px-2">
                          {/* <span>{lang.flag}</span> */}
                          <span>{lang.nativeName}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-2">
                <div className="hidden sm:flex items-center space-x-2 text-sm">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">
                    {t("welcome")},{" "}
                    <span className="font-medium">{user?.name || "Admin"}</span>
                  </span>
                </div>

                {/* Profile Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowProfile(true)}
                  className="flex items-center space-x-2"
                  title={t("profile")}
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("profile")}</span>
                </Button>

                {/* Logout Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  title={t("logout")}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("logout")}</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Error Message */}
            {error && (
              <div className="mb-6 flex items-center justify-between text-red-600 bg-red-50 p-4 rounded-lg border border-red-200 shadow-sm">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{t("error")}</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearError}
                  className="text-red-600 hover:text-red-700 hover:bg-red-100"
                >
                  ✕
                </Button>
              </div>
            )}

            {/* Loading State */}
            {loading && !currentData && (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {t("loading")}
                      </h3>
                      <p className="text-gray-500">
                        {t("loading")}{" "}
                        {getModelName(currentModel).toLowerCase()}...
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No Model Selected */}
            {!currentModel || !currentModelConfig ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="text-gray-500">
                    <Settings className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-semibold mb-2">
                      {t("noModelSelected")}
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      {t("selectModelToStart")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Model Content */
              <Card className="shadow-sm">
                <CardHeader className="border-b bg-gray-50/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-3">
                        <span className="text-xl">
                          {getModelName(currentModel)}
                        </span>
                        {isSingleton && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                            {t("singleRecord")}
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {isSingleton
                          ? `${t("manageData")} ${getModelName(
                            currentModel
                          ).toLowerCase()} ${t("information")}`
                          : `${t("manageAllRecords")} ${getModelName(
                            currentModel
                          ).toLowerCase()} ${t("records")}`}
                      </CardDescription>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      {isSingleton ? (
                        <Dialog
                          open={isSingletonEditOpen}
                          onOpenChange={setIsSingletonEditOpen}
                        >
                          <DialogTrigger asChild>
                            <Button className="flex items-center space-x-2 bg-blue-600 hover:bg-[#2A2C38]">
                              <Edit className="h-4 w-4" />
                              <span>
                                {t("edit")} {getModelName(currentModel)}
                              </span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center space-x-2">
                                <Edit className="h-5 w-5" />
                                <span>
                                  {t("edit")} {getModelName(currentModel)}
                                </span>
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
                        <Dialog
                          open={isCreateDialogOpen}
                          onOpenChange={setIsCreateDialogOpen}
                        >
                          <DialogTrigger asChild>
                            {currentModel !== "contacts" && (
                              <Button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700">
                                <Plus className="h-4 w-4" />
                                <span>{t("addNew")}</span>
                              </Button>
                            )}
                          </DialogTrigger>
                          <DialogContent className="min-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center space-x-2">
                                <Plus className="h-5 w-5" />
                                <span>
                                  {t("create")}{" "}
                                  {getModelName(currentModel).slice(0, -1) ||
                                    t("create")}
                                </span>
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
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  {/* Content based on model type */}
                  {isSingleton ? (
                    <SingletonDisplay
                      model={currentModel}
                      data={currentData}
                      loading={loading}
                      currentLanguage={currentLanguage}
                      onEdit={handleSingletonEdit}
                      t={t}
                      getModelName={getModelName}
                    />
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
            )}

            {/* Edit Dialog for regular models */}
            {!isSingleton && editingItem && (
              <Dialog
                open={!!editingItem}
                onOpenChange={() => setEditingItem(null)}
              >
                <DialogContent className="min-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                      <Edit className="h-5 w-5" />
                      <span>
                        {t("edit")}{" "}
                        {getModelName(currentModel)?.slice(0, -1) || t("edit")}
                      </span>
                    </DialogTitle>
                  </DialogHeader>
                  <CreateEditForm
                    model={currentModel}
                    item={editingItem}
                    onSuccess={handleSuccess}
                    onCancel={handleCloseDialog}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// Component to display singleton data with multilingual support
function SingletonDisplay({
  model,
  data,
  loading,
  currentLanguage,
  onEdit,
  t,
  getModelName,
}) {
  const modelConfig = MODELS[model];

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-500 font-medium">
          {t("loading")} {getModelName(model).toLowerCase()}...
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16">
        <div className="text-gray-500">
          <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <Edit className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-700">
            {t("noDataAvailable")}
          </h3>
          <p className="mb-6 text-gray-600 max-w-md mx-auto">
            {getModelName(model)} {t("noDataAvailable").toLowerCase()}.{" "}
            {t("clickToCreate")}.
          </p>
          <Button
            onClick={onEdit}
            className="flex items-center space-x-2 mx-auto bg-blue-600 hover:bg-[#2A2C38]"
          >
            <Plus className="h-4 w-4" />
            <span>
              {t("create")} {getModelName(model)}
            </span>
          </Button>
        </div>
      </div>
    );
  }

  const getFieldLabel = (fieldKey) => {
    const fieldTranslations = {
      name: t("name"),
      image: t("image"),
      description: t("description"),
      company_name: t("companyName"),
      phone1: t("phone") + " 1",
      phone2: t("phone") + " 2",
      email: t("email"),
      address: t("address"),
      work_hours: t("workHours"),
      created_at: t("createdAt"),
      updated_at: t("updatedAt"),
      // About model fields
      creation: t("creationInfo") || "Creation Info",
      clients: t("clientsInfo") || "Clients Info",
      partners: t("partnersInfo") || "Partners Info",
      technologies: t("technologies") || "Technologies",
      scaners: t("scanners") || "Scanners",
      scales: t("scales") || "Scales",
      printers: t("printers") || "Printers",
      cashiers: t("cashiers") || "Cashiers",
      // Contact model fields
      telegram: "Telegram",
      telegram_bot: "Telegram Bot",
      facebook: "Facebook",
      instagram: "Instagram",
      youtube: "YouTube",
      footer_info: t("footerInfo") || "Footer Info",
      experience_info: t("experienceInfo") || "Experience Info",
    };
    return (
      fieldTranslations[fieldKey] ||
      fieldKey.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    );
  };

  return (
    <div className="space-y-8">
      {/* Data Display Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {modelConfig.displayFields.map((field) => {
          const value = data[field];
          const fieldConfig = modelConfig.fields.find((f) => f.key === field);

          return (
            <div
              key={field}
              className="space-y-3 p-4 bg-gray-50 rounded-lg border"
            >
              <dt className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                {getFieldLabel(field)}
              </dt>
              <dd className="text-gray-700">
                {field.includes("image") && value ? (
                  <div className="space-y-3">
                    <div className="relative inline-block">
                      <Image
                        src={`${IMG_URL}${value}`}
                        alt={field}
                        width={300}
                        height={200}
                        className="rounded-lg border shadow-sm object-cover max-w-full h-auto"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                      {value}
                    </p>
                  </div>
                ) : value &&
                  typeof value === "string" &&
                  value.includes("***") ? (
                  <div className="space-y-3">
                    <div className="text-base leading-relaxed">
                      <MultilingualDisplay
                        value={value}
                        language={currentLanguage}
                        fallbackToFirst={true}
                      />
                    </div>
                    <details className="text-sm">
                      <summary className="cursor-pointer hover:text-gray-700 font-medium text-gray-600 flex items-center space-x-1">
                        <Globe className="h-4 w-4" />
                        <span>{t("showAllLanguages")}</span>
                      </summary>
                      <div className="mt-3 space-y-2 pl-4 border-l-4 border-gray-200 bg-white p-3 rounded">
                        {Object.entries(
                          MultilingualHelpers.parseMultilingual(value)
                        ).map(([lang, text]) => (
                          <div
                            key={lang}
                            className="flex items-start space-x-3"
                          >
                            <span className="font-semibold text-gray-600 min-w-0 text-sm">
                              {MultilingualHelpers.languageLabels[lang]}:
                            </span>
                            <span className="flex-1 text-gray-800">
                              {text || "-"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                ) : (
                  <span
                    className={`text-base ${value ? "text-gray-800" : "text-gray-400 italic"
                      }`}
                  >
                    {value || t("notSet")}
                  </span>
                )}
              </dd>
            </div>
          );
        })}
      </div>

      {/* Metadata Section */}
      {(data.created_at || data.updated_at) && (
        <div className="border-t pt-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>{t("metadata")}</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.created_at && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <dt className="font-semibold text-green-800 text-sm uppercase tracking-wide">
                  {t("createdAt")}
                </dt>
                <dd className="text-green-700 font-mono text-sm mt-1">
                  {new Date(data.created_at).toLocaleString()}
                </dd>
              </div>
            )}
            {data.updated_at && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <dt className="font-semibold text-blue-800 text-sm uppercase tracking-wide">
                  {t("lastUpdated")}
                </dt>
                <dd className="text-[#2A2C38] font-mono text-sm mt-1">
                  {new Date(data.updated_at).toLocaleString()}
                </dd>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Raw Data Preview (Development Only) */}
      {process.env.NODE_ENV === "development" && (
        <details className="border-t pt-6">
          <summary className="text-sm font-semibold text-gray-700 cursor-pointer hover:text-gray-900 flex items-center space-x-2">
            <AlertCircle className="h-4 w-4" />
            <span>{t("rawData")}</span>
          </summary>
          <pre className="mt-4 text-xs bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto border font-mono">
            {JSON.stringify(data, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
