"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { IMG_URL, useStore } from "@/lib/store";
import { MODELS } from "@/lib/models";
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
import { cn, formatPrice, normalizeCurrencyValue } from "@/lib/utils";
import {
  Edit,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Globe,
  Copy,
  Check,
} from "lucide-react";
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
  const [tableLanguage, setTableLanguage] = useState("en");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [copiedId, setCopiedId] = useState(null);
  const copyTimeoutRef = useRef(null);

  const { deleteItem, data: storeData, fetchData } = useStore();

  // Use global language for UI elements only
  const { t, getAvailableLanguages } = useLanguage();

  const modelConfig = MODELS[model];

  useEffect(() => {
    if (model === "products" && !storeData?.categories?.data) {
      fetchData("categories");
    }
  }, [model, storeData?.categories?.data, fetchData]);

  useEffect(() => {
    if (model !== "products") {
      setCategoryFilter("all");
    }
  }, [model]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const items = data?.data || [];
  const total = data?.total || 0;
  const limit = data?.limit || 10;
  const totalPages = Math.ceil(total / limit);

  const categoriesForFilter = useMemo(() => {
    if (model !== "products") return [];
    return storeData?.categories?.data || [];
  }, [model, storeData?.categories?.data]);

  const categoryMap = useMemo(() => {
    if (model !== "products") return {};
    return categoriesForFilter.reduce((acc, category) => {
      const key = category?.id || category?._id;
      if (key !== undefined && key !== null) {
        acc[key.toString()] = category?.name || "";
      }
      return acc;
    }, {});
  }, [model, categoriesForFilter]);

  const getItemCategoryId = (item) => {
    const rawId =
      item?.category_id ??
      item?.category?.id ??
      item?.category?._id ??
      item?.categoryId ??
      null;
    return rawId !== null && rawId !== undefined ? rawId.toString() : "";
  };

  const handleCopyId = async (value) => {
    if (!value) return;
    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      console.warn("Clipboard API not available");
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(value);
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = setTimeout(() => setCopiedId(null), 1500);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  if (!modelConfig) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{t("noDataAvailable")}</p>
      </div>
    );
  }

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
    const searchTermLower = searchTerm.toLowerCase();

    const matchesField = modelConfig.displayFields.some((field) => {
      const value = item[field];
      if (!value) return false;

      if (typeof value === "string" && value.includes("***")) {
        const displayValue = getTranslatedValue(value, tableLanguage);
        return displayValue.toLowerCase().includes(searchTermLower);
      }

      if (typeof value === "string" || typeof value === "number") {
        return value.toString().toLowerCase().includes(searchTermLower);
      }

      return false;
    });

    if (matchesField) return true;

    if (model === "products") {
      const categoryId = getItemCategoryId(item);
      const categoryName =
        item?.category_name ||
        categoryMap[categoryId] ||
        "";
      if (typeof categoryName === "string" && categoryName.includes("***")) {
        return getTranslatedValue(categoryName, tableLanguage)
          .toLowerCase()
          .includes(searchTermLower);
      }
      if (categoryName) {
        return categoryName.toString().toLowerCase().includes(searchTermLower);
      }
    }

    return false;
  });

  const renderTruncated = (text) => (
    <span className="block max-w-[250px] truncate" title={text}>
      {text}
    </span>
  );

  const renderCopyableId = (rawValue) => {
    const identifierText = rawValue?.toString?.() || "";
    if (!identifierText) {
      return renderTruncated("-");
    }

    const truncatedId =
      identifierText.length > 12
        ? `${identifierText.slice(0, 6)}…${identifierText.slice(-4)}`
        : identifierText;
    const isCopied = copiedId === identifierText;

    return (
      <button
        type="button"
        onClick={() => handleCopyId(identifierText)}
        className="flex w-full items-center justify-between gap-2 rounded border border-transparent bg-gray-100 px-2 py-1 text-xs font-mono text-gray-700 transition hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        title={isCopied ? "Copied!" : "Copy to clipboard"}
        aria-label={isCopied ? "Copied" : "Copy identifier"}
      >
        <span className="truncate">{truncatedId}</span>
        {isCopied ? (
          <Check className="h-3.5 w-3.5 text-green-500" aria-hidden="true" />
        ) : (
          <Copy className="h-3.5 w-3.5 text-gray-500" aria-hidden="true" />
        )}
      </button>
    );
  };

  const matchesCategoryFilter = (item) => {
    if (model !== "products" || categoryFilter === "all") return true;
    const categoryId = getItemCategoryId(item);
    return categoryId === categoryFilter;
  };

  const visibleItems = filteredItems.filter(matchesCategoryFilter);

  const formatFieldValue = (item, field) => {
    const value = item[field];

    if (field === "product_id") {
      const identifier =
        item?.product_id ??
        item?.id ??
        item?._id ??
        "";
      return renderCopyableId(identifier);
    }

    if (field === "id" || field === "_id") {
      return renderCopyableId(value ?? item?.id ?? item?._id);
    }

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
      const normalized = normalizeCurrencyValue(value);
      if (!normalized) {
        return renderTruncated("-");
      }
      const formattedPrice = formatPrice(Number(normalized), tableLanguage);
      return renderTruncated(`${formattedPrice} $`);
    }

    if (field === "category_id" && model === "products") {
      const categoryId = getItemCategoryId(item);
      const categoryName =
        item?.category_name || categoryMap[categoryId] || "";

      if (!categoryName) {
        return renderTruncated("-");
      }

      if (typeof categoryName === "string" && categoryName.includes("***")) {
        return renderTruncated(
          getTranslatedValue(categoryName, tableLanguage) || "-"
        );
      }

      return renderTruncated(categoryName.toString());
    }

    // Handle foreign key relationships
    if (field.endsWith("_id")) {
      const stringValue =
        value !== null && value !== undefined ? value.toString() : "";
      if (!stringValue) {
        return renderTruncated("-");
      }
      return (
        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
          {stringValue.substring(0, 8)}...
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
      price: t("price") || "Price($)",
      discount: t("discount") || "Discount",
      guarantee: t("guarantee"),
      serial_number: t("serialNumber"),
      product_id: t("productId") || "Product ID",
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
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-1">
          <div className="relative flex-1 min-w-[220px]">
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

          {model === "products" && (
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger className="w-full sm:w-52">
                <SelectValue placeholder={t("category")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("allCategories") || "All categories"}
                </SelectItem>
                {categoriesForFilter.map((category) => {
                  const id = category?.id || category?._id;
                  if (!id) return null;
                  const label = typeof category?.name === "string" && category.name.includes("***")
                    ? getTranslatedValue(category.name, tableLanguage)
                    : category?.name || "-";
                  return (
                    <SelectItem key={id} value={id.toString()}>
                      {label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex items-center gap-4 flex-wrap">
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
            {visibleItems.length} {t("of")} {total} {t("itemsCount")}
          </div>
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
            {visibleItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={modelConfig.displayFields.length + 1}
                  className="text-center py-8 text-gray-500"
                >
                  {searchTerm ||
                  (model === "products" && categoryFilter !== "all")
                    ? t("noMatchingRecords")
                    : `${t("noDataAvailable")} ${getModelName(
                      model
                    ).toLowerCase()}`}
                </TableCell>
              </TableRow>
            ) : (
              visibleItems.map((item) => (
                <TableRow
                  key={item.id || item._id}
                  className="hover:bg-gray-50"
                >
                  {modelConfig.displayFields.map((field) => (
                    <TableCell
                      key={field}
                      className={cn(
                        "max-w-[200px]",
                        (field === "product_id" || field === "id" || field === "_id") &&
                          "w-[140px]"
                      )}
                    >
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
