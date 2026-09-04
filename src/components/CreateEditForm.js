"use client";

import { useState, useEffect, useCallback } from "react";
import { IMG_URL, useStore } from "@/lib/store";
import { MODELS, MultilingualHelpers } from "@/lib/models";
import {
  FormLanguageProvider,
  FormLanguageSelector,
  MultilingualInput,
  useFormLanguage,
} from "@/components/MultilingualInput";
import { MultilingualRichTextEditor } from "@/components/RichTextEditor";
import { useLanguage } from "@/lib/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X, AlertCircle } from "lucide-react";
import Image from "next/image";
import { getTranslatedValue } from "@/lib/utils";
import MultilingualTableInput from "./MultilingualTableInput";

const FORM_LANGUAGES = ["en", "ru", "uz"];

function parseMultilingualFileValue(value) {
  const normalizedValue = typeof value === "string" ? value.trim() : "";

  // Existing blog records used one shared image. Replicate it while editing so
  // they remain valid until an editor chooses language-specific replacements.
  if (normalizedValue && !normalizedValue.includes("***")) {
    return FORM_LANGUAGES.reduce((images, language) => {
      images[language] = normalizedValue;
      return images;
    }, {});
  }

  return MultilingualHelpers.parseMultilingual(normalizedValue);
}

function normalizeMultilingualFileValue(value) {
  return MultilingualHelpers.formatMultilingual(
    parseMultilingualFileValue(value)
  );
}

function resolveAdminImageUrl(value) {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `${IMG_URL.replace(/\/$/, "")}/${value.replace(/^\//, "")}`;
}

export default function CreateEditForm({
  model,
  item = null,
  onSuccess,
  onCancel,
}) {
  return (
    <FormLanguageProvider>
      <CreateEditFormContent
        model={model}
        item={item}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </FormLanguageProvider>
  );
}

function CreateEditFormContent({ model, item = null, onSuccess, onCancel }) {
  const modelConfig = MODELS[model];

  const initializeFormData = useCallback(() => {
    const initialData = {};
    modelConfig.fields.forEach((field) => {
      if (item) {
        if (field.type === "select") {
          const value = item[field.key];
          initialData[field.key] =
            typeof value === "object"
              ? value?.id?.toString() || value?._id?.toString() || ""
              : value?.toString() || "";
        } else if (field.type === "multilingual-file") {
          initialData[field.key] = normalizeMultilingualFileValue(
            item[field.key]
          );
        } else {
          initialData[field.key] = item[field.key] || "";
        }
      } else {
        initialData[field.key] = "";
      }
    });
    return initialData;
  }, [item, modelConfig]);

  const [formData, setFormData] = useState(initializeFormData);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [errors, setErrors] = useState({});

  const { t, currentLanguage } = useLanguage();
  const { currentFormLanguage, getCurrentLanguage } = useFormLanguage();
  const {
    createItem,
    updateItem,
    uploadFile,
    fetchData,
    data,
    loading,
    error,
  } = useStore();

  const isEditing = !!item;

  // Initialize form data
  useEffect(() => {
    setFormData(initializeFormData());
  }, [initializeFormData]);

  // Fetch options for select fields
  useEffect(() => {
    const selectFields = modelConfig.fields.filter(
      (field) => field.type === "select"
    );
    selectFields.forEach((field) => {
      if (
        field.options &&
        !modelConfig.customOptions?.[field.options] &&
        !data[field.options]
      ) {
        fetchData(field.options);
      }
    });
  }, [modelConfig.fields, modelConfig.customOptions, fetchData, data]);

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (errors[key]) {
      setErrors((prev) => ({
        ...prev,
        [key]: null,
      }));
    }
  };

  const handleFileUpload = async (field, files) => {
    try {
      const file = files[0];
      const result = await uploadFile(file);

      if (field.type === "file-multiple") {
        const currentFiles = formData[field.key] || [];
        const newFiles = Array.isArray(currentFiles)
          ? [...currentFiles, result.url]
          : [result.url];
        handleInputChange(field.key, newFiles);
      } else if (field.type === "multilingual-file") {
        const images = parseMultilingualFileValue(formData[field.key]);
        handleInputChange(
          field.key,
          MultilingualHelpers.formatMultilingual({
            ...images,
            [currentFormLanguage]: result.url,
          })
        );
      } else {
        handleInputChange(field.key, result.url);
      }

      setUploadedFiles((prev) => ({
        ...prev,
        [field.key]:
          field.type === "multilingual-file"
            ? {
                ...(prev[field.key] || {}),
                [currentFormLanguage]: result,
              }
            : result,
      }));
    } catch (error) {
      console.error("File upload failed:", error);
    }
  };

  const removeFile = (field, index = null) => {
    if (field.type === "file-multiple" && index !== null) {
      const currentFiles = formData[field.key] || [];
      const newFiles = currentFiles.filter((_, i) => i !== index);
      handleInputChange(field.key, newFiles);
    } else if (field.type === "multilingual-file") {
      const images = parseMultilingualFileValue(formData[field.key]);
      handleInputChange(
        field.key,
        MultilingualHelpers.formatMultilingual({
          ...images,
          [currentFormLanguage]: "",
        })
      );
      setUploadedFiles((prev) => ({
        ...prev,
        [field.key]: {
          ...(prev[field.key] || {}),
          [currentFormLanguage]: null,
        },
      }));
    } else {
      handleInputChange(field.key, "");
      setUploadedFiles((prev) => ({
        ...prev,
        [field.key]: null,
      }));
    }
  };

  const hasAllTranslations = (value, richText = false) => {
    const translations = MultilingualHelpers.parseMultilingual(value);
    return ["en", "ru", "uz"].every((language) => {
      let content = translations[language] || "";
      if (richText) {
        content = content
          .replace(/<[^>]*>/g, " ")
          .replace(/&nbsp;|&#160;/gi, " ");
      }
      return content.trim().length > 0;
    });
  };

  const validateForm = () => {
    const newErrors = {};

    modelConfig.fields.forEach((field) => {
      const v = formData[field.key];
      if (
        field.required &&
        field.requireAllLanguages &&
        !hasAllTranslations(v, field.type === "multilingual-rich-text")
      ) {
        newErrors[field.key] = t("allLanguagesRequired");
      } else if (field.required && !v) {
        newErrors[field.key] = `${field.label} ${t("required")}`;
      }
      // HEX tekshiruv faqat select-color turlari uchun
      if (field.type === "select-color" && v) {
        if (!isValidHex(v)) {
          newErrors[field.key] = t("invalidColor") || "Invalid HEX color (#RRGGBB).";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const submitData = { ...formData };

      Object.keys(submitData).forEach((key) => {
        if (submitData[key] === "") {
          delete submitData[key];
        }
      });

      // Convert numeric fields to proper types for the API
      const numericFields = ["price", "discount", "NDC", "tax"];
      numericFields.forEach((field) => {
        if (submitData[field] !== undefined) {
          const parsed = parseFloat(submitData[field]);
          submitData[field] = isNaN(parsed) ? 0 : parsed;
        }
      });

      // Convert integer fields
      const intFields = ["count"];
      intFields.forEach((field) => {
        if (submitData[field] !== undefined) {
          const parsed = parseInt(submitData[field], 10);
          submitData[field] = isNaN(parsed) ? 0 : parsed;
        }
      });

      // Debug: log what's being sent
      console.log("Submitting data:", JSON.stringify(submitData, null, 2));

      if (isEditing) {
        await updateItem(model, item.id || item._id, submitData);
      } else {
        await createItem(model, submitData);
      }

      onSuccess();
    } catch (error) {
      console.error("Submit failed:", error);
    }
  };

  const getSelectOptions = (field) => {
    let options = [];
    if (modelConfig.customOptions?.[field.options]) {
      options = modelConfig.customOptions[field.options];
    } else {
      options = data[field.options]?.data || [];
    }
    if (item && field.key.endsWith("_id")) {
      const currentId = item[field.key];
      const nameKey = field.key.replace("_id", "_name");
      const currentName = item[nameKey];

      if (
        currentId &&
        currentName &&
        !options.some((opt) => (opt.id || opt._id)?.toString() === currentId.toString())
      ) {
        options = [
          ...options,
          { id: currentId, name: currentName },
        ];
      }
    }

    return options;
  };

  const getFieldLabel = (field) => {
    const fieldLabels = {
      name: t("name"),
      title: t("title"),
      text: t("text"),
      image: t("image"),
      description: t("description"),
      ads_title: t("advertisementTitle"),
      guarantee: t("guarantee"),
      serial_number: t("serialNumber"),
      category_id: t("category"),
      top_category_id: t("topCategory"),
      product_name: t("productName"),
      content: t("content") || "Content",
      creation: t("creationInfo") || "Creation Info",
      clients: t("clientsInfo") || "Clients Info",
      partners: t("partnersInfo") || "Partners Info",
      technologies: t("technologies") || "Technologies",
      scaners: t("scanners") || "Scanners",
      scales: t("scales") || "Scales",
      printers: t("printers") || "Printers",
      cashiers: t("cashiers") || "Cashiers",
      address: t("address"),
      footer_info: t("footerInfo") || "Footer Info",
      experience_info: t("experienceInfo") || "Experience Info",
      color: t("color") || "Color",
    };
    return fieldLabels[field.key] || field.label;
  };
  // Component tepasiga joylashtiring (CreateEditFormContent ichida emas, yoki uning ichida ham bo‘ladi)
  const normalizeHex = (val) => {
    if (!val) return "";
    let v = val.trim();
    if (!v.startsWith("#")) v = "#" + v;
    if (v.length === 4) {
      // #abc -> #aabbcc
      v = "#" + v[1] + v[1] + v[2] + v[2] + v[3] + v[3];
    }
    return v.toUpperCase();
  };

  const isValidHex = (val) => /^#([0-9A-Fa-f]{6})$/.test(normalizeHex(val));

  const renderField = (field) => {
    const value = formData[field.key] || "";
    const hasError = errors[field.key];

    switch (field.type) {
      case "multilingual":
        return (
          <div key={field.key} className="col-span-2">
            <MultilingualInput
              value={value}
              onChange={(newValue) => handleInputChange(field.key, newValue)}
              label={getFieldLabel(field)}
              required={field.required}
              error={hasError}
              type="text"
            />
          </div>
        );
      case "select-color": {
        const hex = formData[field.key] || "";
        const normalized = hex ? normalizeHex(hex) : "#000000";

        const setHex = (val) => {
          const n = normalizeHex(val);
          handleInputChange(field.key, n);
          if (errors[field.key]) {
            setErrors((prev) => ({ ...prev, [field.key]: null }));
          }
        };

        const palette = Array.isArray(field.palette) ? field.palette : [];

        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>
              {getFieldLabel(field)}{" "}
              {field.required && <span className="text-red-500">*</span>}
            </Label>

            <div className="flex items-center gap-3">
              {/* Color picker */}
              <input
                aria-label="Pick color"
                type="color"
                value={isValidHex(normalized) ? normalized : "#000000"}
                onChange={(e) => setHex(e.target.value)}
                className="h-10 w-10 rounded border"
              />

              {/* HEX input */}
              <Input
                id={field.key}
                value={normalized}
                onChange={(e) => setHex(e.target.value)}
                placeholder="#RRGGBB"
                className={hasError ? "border-red-500" : ""}
              />
            </div>

            {/* Palitra (ixtiyoriy) */}
            {palette.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {palette.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setHex(c)}
                    className="h-8 w-8 rounded-full border"
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
            )}

            {/* Ko‘rsatkich (preview) */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{t("selected") || "Selected"}:</span>
              <span className="font-mono">{normalized}</span>
              <span
                className="inline-block h-4 w-4 rounded border"
                style={{ backgroundColor: isValidHex(normalized) ? normalized : "#000000" }}
              />
            </div>

            {hasError && (
              <p className="text-red-500 text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {hasError}
              </p>
            )}
          </div>
        );
      }


      case "multilingual-textarea":
        return (
          <div key={field.key} className="col-span-2">
            <MultilingualInput
              value={value}
              onChange={(newValue) => handleInputChange(field.key, newValue)}
              label={getFieldLabel(field)}
              required={field.required}
              error={hasError}
              type="textarea"
            />
          </div>
        );

      case "multilingual-rich-text":
        return (
          <div key={field.key} className="col-span-2">
            <MultilingualRichTextEditor
              value={value}
              onChange={(newValue) => handleInputChange(field.key, newValue)}
              label={getFieldLabel(field)}
              required={field.required}
              error={hasError}
              height="250px"
            />
          </div>
        );
      case "multilingual-table":
        return (
          <div key={field.key} className="col-span-2">
            <MultilingualTableInput
              value={value}
              onChange={(newValue) => handleInputChange(field.key, newValue)}
              label={getFieldLabel(field)}
              required={field.required}
              error={hasError}
            />
          </div>
        );

      case "text":
      case "email":
      case "password":
        const isPriceField = field.key === "price" || field.key === "discount";
        const sanitizeCurrencyInput = (inputValue) =>
          inputValue.replace(/[^\d.,$\s]/g, "");
        const displayValue =
          isPriceField && typeof value === "number"
            ? value.toString()
            : value;
        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>
              {getFieldLabel(field)}{" "}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.key}
              type={field.type}
              inputMode={isPriceField ? "decimal" : undefined}
              value={displayValue ?? ""}
              onChange={(e) =>
                handleInputChange(
                  field.key,
                  isPriceField
                    ? sanitizeCurrencyInput(e.target.value)
                    : e.target.value
                )
              }
              className={hasError ? "border-red-500" : ""}
            />
            {hasError && (
              <p className="text-red-500 text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {hasError}
              </p>
            )}
          </div>
        );

      case "textarea":
        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>
              {getFieldLabel(field)}{" "}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id={field.key}
              value={value}
              onChange={(e) => handleInputChange(field.key, e.target.value)}
              className={hasError ? "border-red-500" : ""}
              rows={3}
            />
            {hasError && (
              <p className="text-red-500 text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {hasError}
              </p>
            )}
          </div>
        );

      case "multilingual-file": {
        const localizedImages = parseMultilingualFileValue(value);
        const currentImage = localizedImages[currentFormLanguage] || "";
        const currentFormLanguageInfo = getCurrentLanguage();
        const completedImages = FORM_LANGUAGES.filter(
          (language) => localizedImages[language]?.trim()
        ).length;
        const inputId = `${field.key}-${currentFormLanguage}`;

        return (
          <div key={field.key} className="col-span-2 space-y-3">
            <Label
              htmlFor={inputId}
              className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="flex flex-wrap items-center gap-2">
                <span>
                  {getFieldLabel(field)}{" "}
                  {field.required && <span className="text-red-500">*</span>}
                </span>
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                  {currentFormLanguageInfo.flag}{" "}
                  {currentFormLanguageInfo.nativeName}
                </span>
              </span>
              <span className="text-xs font-medium text-gray-500">
                {completedImages}/3 {t("completed")}
              </span>
            </Label>

            {currentImage && (
              <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 sm:flex-row sm:items-center">
                <Image
                  src={resolveAdminImageUrl(currentImage)}
                  alt={`${getFieldLabel(field)} — ${currentFormLanguageInfo.nativeName}`}
                  width={160}
                  height={90}
                  className="aspect-video w-full rounded-lg object-cover sm:w-40"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-700">
                    {currentImage.split("/").pop()}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {currentFormLanguageInfo.nativeName}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(field)}
                  className="self-end text-gray-500 hover:text-red-600 sm:self-auto"
                  aria-label={`Remove ${currentFormLanguageInfo.nativeName} image`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div
              className={`rounded-xl border-2 border-dashed p-5 text-center transition-colors hover:border-blue-400 hover:bg-blue-50/40 ${
                hasError ? "border-red-400" : "border-gray-300"
              }`}
            >
              <input
                key={inputId}
                type="file"
                id={inputId}
                accept="image/*"
                onChange={(event) =>
                  event.target.files.length > 0 &&
                  handleFileUpload(field, event.target.files)
                }
                className="hidden"
              />
              <label htmlFor={inputId} className="block cursor-pointer">
                <Upload className="mx-auto mb-2 h-7 w-7 text-blue-500" />
                <p className="text-sm font-medium text-gray-700">
                  {currentImage ? t("replaceImage") : t("clickToUpload")}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {currentFormLanguageInfo.nativeName}
                </p>
              </label>
            </div>

            <p className="text-xs text-gray-500">
              {t("recommendedImageSize") ||
                "Tavsiya etiladi: 16:9 format, 800x450 px"}
            </p>
            {hasError && (
              <p className="flex items-center text-sm text-red-500">
                <AlertCircle className="mr-1 h-4 w-4" />
                {hasError}
              </p>
            )}
          </div>
        );
      }

      case "select":
        const options = getSelectOptions(field);
        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>
              {getFieldLabel(field)}{" "}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Select
              value={value ? value.toString() : undefined}
              onValueChange={(newValue) =>
                handleInputChange(field.key, newValue)
              }
            >
              <SelectTrigger className={hasError ? "border-red-500" : ""}>
                <SelectValue
                  placeholder={`${t("select")} ${getFieldLabel(field)}`}
                />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => {
                  const optionValue = (option.id || option._id).toString();
                  const optionLabel =
                    typeof option.name === "string"
                      ? getTranslatedValue(option.name, currentLanguage)
                      : option.name?.[currentLanguage] || option.name?.en || "";
                  return (
                    <SelectItem key={optionValue} value={optionValue}>
                      {optionLabel}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {hasError && (
              <p className="text-red-500 text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {hasError}
              </p>
            )}
          </div>
        );

      case "file":
        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>
              {getFieldLabel(field)}{" "}
              {field.required && <span className="text-red-500">*</span>}
            </Label>

            {value && (
              <div className="flex items-center space-x-2 p-2 border rounded">
                <Image
                  src={`${IMG_URL}${value}`}
                  alt="Preview"
                  width={48}
                  height={48}
                  className="w-12 h-12 object-cover rounded"
                />
                <span className="text-sm text-gray-600 flex-1">
                  {value.split("/").pop()}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(field)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <input
                type="file"
                id={field.key}
                accept="image/*"
                onChange={(e) =>
                  e.target.files.length > 0 &&
                  handleFileUpload(field, e.target.files)
                }
                className="hidden"
              />
              <label htmlFor={field.key} className="cursor-pointer">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">{t("clickToUpload")}</p>
              </label>
            </div>
            <p className="text-xs text-gray-500">
              {t("recommendedImageSize") || "Tavsiya etiladi: 16:9 format, 800x450 px"}
            </p>
            {hasError && (
              <p className="text-red-500 text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {hasError}
              </p>
            )}
          </div>
        );

      case "file-multiple":
        const files = Array.isArray(value) ? value : [];
        return (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>
              {getFieldLabel(field)}{" "}
              {field.required && <span className="text-red-500">*</span>}
            </Label>

            {files.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {files.map((file, index) => (
                  <div key={index} className="relative">
                    <Image
                      src={`${IMG_URL}${file}`}
                      alt={`Preview ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-20 object-cover rounded"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 p-1 h-6 w-6"
                      onClick={() => removeFile(field, index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <input
                type="file"
                id={field.key}
                accept="image/*"
                multiple
                onChange={(e) =>
                  e.target.files.length > 0 &&
                  handleFileUpload(field, e.target.files)
                }
                className="hidden"
              />
              <label htmlFor={field.key} className="cursor-pointer">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  {t("clickToUploadMultiple")}
                </p>
              </label>
            </div>
            <p className="text-xs text-gray-500">
              {t("recommendedImageSize") || "Tavsiya etiladi: 16:9 format, 800x450 px"}
            </p>

            {hasError && (
              <p className="text-red-500 text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {hasError}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}
    

      {/* Global Language Selector */}
      <FormLanguageSelector />
  <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("cancel")}
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? t("saving") : isEditing ? t("update") : t("create")}
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modelConfig.fields.map(renderField)}
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("cancel")}
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? t("saving") : isEditing ? t("update") : t("create")}
        </Button>
      </div>
    </form>
  );
}
