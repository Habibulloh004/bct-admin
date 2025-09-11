"use client";

import { useState } from "react";
import { IMG_URL, useStore } from "@/lib/store";
import { MODELS, MultilingualHelpers } from "@/lib/models";
import { useLanguage } from "@/lib/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "@/components/ui/alert-dialog";
import { formatPrice } from "@/lib/utils";
import { Edit, Trash2, Search, ChevronLeft, ChevronRight, Globe } from "lucide-react";
import Image from "next/image";

// Utility function for getting translated values
function getTranslatedValue(value, lang) {
  if (!value) return ''

  const parts = value.split('***')
  const langMap = {
    en: 0,
    ru: 1,
    uz: 2
  }

  const index = langMap[lang]
  return parts[index] || parts[0] || ''
}

export default function DataTable({ model, data, onEdit, loading }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  // Local language state for table content only
  const [tableLanguage, setTableLanguage] = useState("en");

  const { deleteItem } = useStore();

  // Use global language for UI elements only
  const { t, getAvailableLanguages } = useLanguage();

  const modelConfig = MODELS[model];

  if (!data || !modelConfig) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{t("noDataAvailable")}</p>
      </div>
    );
  }

  const items = data.data || [];
  const total = data.total || 0;
  const limit = data.limit || 10;
  const totalPages = Math.ceil(total / limit);

  // Get model name with translation (uses global language for UI)
  const getModelName = (modelKey) => {
    const modelNames = {
      "top-categories": t("topCategories"),
      categories: t("categories"),
      products: t("products"),
      about: t("about"),
      contacts: t("contacts"),
      news: t("news"),
      partners: t("partners"),
      certificates: t("certificates"),
      licenses: t("licenses"),
      "vendors-about": t("vendorsAbout"),
      experiments: t("experiments"),
      "company-stats": t("companyStats"),
      discount: t("discount"),
    };
    return modelNames[modelKey] || modelConfig?.name || modelKey;
  };

  // Get available languages for table selector
  const tableLanguages = getAvailableLanguages();

  // Filter items based on search term (uses table language for content search)
  const filteredItems = items.filter((item) => {
    if (!searchTerm) return true;
    return modelConfig.displayFields.some((field) => {
      const value = item[field];
      if (!value) return false;

      // For multilingual fields, search in the current table language
      if (typeof value === "string" && value.includes("***")) {
        const displayValue = getTranslatedValue(value, tableLanguage);
        return displayValue.toLowerCase().includes(searchTerm.toLowerCase());
      }

      return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  const renderTruncated = (text) => (
    <span className="block max-w-[250px] truncate" title={text}>
      {text}
    </span>
  );

  const formatFieldValue = (item, field) => {
    const value = item[field];

    if (!value) return renderTruncated("-");

    // Handle dates
    if (field.includes("_at") || field.includes("date")) {
      return renderTruncated(new Date(value).toLocaleDateString());
    }

    // Handle multilingual fields (uses table language instead of global language)
    if (typeof value === "string" && value.includes("***")) {
      const translatedValue = getTranslatedValue(value, tableLanguage) || "-";
      return renderTruncated(translatedValue);
    }

    // Handle images
    if (field === "image" && Array.isArray(value)) {
      return (
        <div className="bg-black/10 flex space-x-1">
          {value.slice(0, 2).map((img, idx) => (
            <Image
              key={idx}
              src={`${IMG_URL}${img}`}
              alt="Preview"
              width={32}
              height={32}
              className="w-8 h-8 object-cover rounded"
            />
          ))}
          {value.length > 2 && (
            <span className="text-xs text-gray-500">+{value.length - 2}</span>
          )}
        </div>
      );
    }

    if (field === "image" && typeof value === "string") {
      return (
        <Image
          src={`${IMG_URL}${value}`}
          alt="Preview"
          width={32}
          height={32}
          className="w-full h-12 object-contain  rounded p-2 bg-black/10"
        />
      );
    }

    if (field === "price") {
      return renderTruncated(formatPrice(value, tableLanguage));
    }

    // Handle foreign key relationships
    if (field.endsWith("_id") && typeof value === "string") {
      return (
        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
          {value.substring(0, 8)}...
        </span>
      );
    }

    // Truncate long text
    if (typeof value === "string" || typeof value === "number") {
      return renderTruncated(value.toString());
    }

    return renderTruncated(String(value));
  };

  // Field display names use global language for UI consistency
  const getFieldDisplayName = (field) => {
    const fieldNames = {
      name: t("name"),
      image: t("image"),
      description: t("description"),
      created_at: t("createdAt"),
      updated_at: t("updatedAt"),
      category_id: t("category"),
      top_category_id: t("topCategory"),
      ads_title: t("advertisementTitle"),
      price: t("price") || "Price",
      discount: t("discount") || "Discount",
      guarantee: t("guarantee"),
      serial_number: t("serialNumber"),
      phone: t("phone"),
      email: model == "select-reviews" ? "Color key" : t("email"),
      message:model == "select-reviews" ? "Color" :  t("message"),
      company_name: t("companyName"),
      phone1: t("phone") + " 1",
      phone2: t("phone") + " 2",
      address: t("address"),
      work_hours: t("workHours"),
      sum: t("amount") || "Amount",
      content: t("content") || "Content",
    };

    return (
      fieldNames[field] ||
      field
        .replace(/_/g, " ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    );
  };

  const handleDelete = async (id) => {
    try {
      await deleteItem(model, id);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // You can implement pagination by calling fetchData with page parameter
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-500">{t("loading")}...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search, Table Language Selector, and Stats */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={`${t("search")} ${getModelName(
              model
            ).toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table Language Selector - Only affects table content */}
        <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2 border">
          <Globe className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600 font-medium">
            {t("displaying")}:
          </span>
          <Select value={tableLanguage} onValueChange={setTableLanguage}>
            <SelectTrigger className="w-32 border-0 bg-transparent shadow-none p-0 h-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tableLanguages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  <div className="flex items-center space-x-2">
                    <span>{lang.flag}</span>
                    <span className="text-sm">{lang.nativeName}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-gray-500">
          {filteredItems.length} {t("of")} {total} {t("itemsCount")}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {modelConfig.displayFields.map((field) => (
                <TableHead key={field} className="font-semibold">
                  {getFieldDisplayName(field)}
                </TableHead>
              ))}
              <TableHead className="text-right">
                {t("actions") || "Actions"}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={modelConfig.displayFields.length + 1}
                  className="text-center py-8 text-gray-500"
                >
                  {searchTerm
                    ? t("noMatchingRecords")
                    : `${t("noDataAvailable")} ${getModelName(
                      model
                    ).toLowerCase()}`}
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow
                  key={item.id || item._id}
                  className="hover:bg-gray-50"
                >
                  {modelConfig.displayFields.map((field) => (
                    <TableCell key={field} className="max-w-[200px]">
                      {formatFieldValue(item, field)}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(item)}
                        className="h-8 w-8 p-0"
                        title={t("edit")}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title={t("delete")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {t("areYouSure")}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {t("cannotBeUndone")}{" "}
                              {getModelName(model).toLowerCase().slice(0, -1)}{" "}
                              {t("removeFromServers")}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(item.id || item._id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {t("delete")}
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
            {t("page")} {currentPage} {t("of")} {totalPages}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              {t("previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              {t("next")}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}