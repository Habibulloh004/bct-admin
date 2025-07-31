"use client";

import { useState, createContext, useContext } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Globe, ChevronLeft, ChevronRight } from "lucide-react";
import { MultilingualHelpers } from "@/lib/models";
import { useLanguage } from "@/lib/LanguageContext";

// Form Language Context for managing current form language
const FormLanguageContext = createContext();

// Form Language Provider
export function FormLanguageProvider({ children }) {
  const { getAvailableLanguages } = useLanguage();
  const [currentFormLanguage, setCurrentFormLanguage] = useState("en");
  const languages = getAvailableLanguages();

  const handleLanguageChange = (langCode) => {
    setCurrentFormLanguage(langCode);
  };

  const handlePrevious = () => {
    const currentIndex = languages.findIndex(
      (lang) => lang.code === currentFormLanguage
    );
    const prevIndex =
      currentIndex === 0 ? languages.length - 1 : currentIndex - 1;
    setCurrentFormLanguage(languages[prevIndex].code);
  };

  const handleNext = () => {
    const currentIndex = languages.findIndex(
      (lang) => lang.code === currentFormLanguage
    );
    const nextIndex =
      currentIndex === languages.length - 1 ? 0 : currentIndex + 1;
    setCurrentFormLanguage(languages[nextIndex].code);
  };

  const getCurrentLanguage = () => {
    return (
      languages.find((lang) => lang.code === currentFormLanguage) ||
      languages[0]
    );
  };

  const value = {
    currentFormLanguage,
    setCurrentFormLanguage: handleLanguageChange,
    handlePrevious,
    handleNext,
    getCurrentLanguage,
    languages,
  };

  return (
    <FormLanguageContext.Provider value={value}>
      {children}
    </FormLanguageContext.Provider>
  );
}

// Hook to use form language context
export function useFormLanguage() {
  const context = useContext(FormLanguageContext);
  if (!context) {
    throw new Error(
      "useFormLanguage must be used within a FormLanguageProvider"
    );
  }
  return context;
}

// Global Form Language Selector Component
export function FormLanguageSelector({ className = "" }) {
  const { t } = useLanguage();
  const {
    currentFormLanguage,
    setCurrentFormLanguage,
    handlePrevious,
    handleNext,
    getCurrentLanguage,
    languages,
  } = useFormLanguage();

  const currentLang = getCurrentLanguage();

  return (
    <div
      className={`flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6 ${className}`}
    >
      <div className="flex items-center space-x-3">
        <Globe className="h-5 w-5 text-blue-600" />
        <div>
          <h3 className="text-sm font-semibold text-blue-900">
            {t("formLanguage") || "Form Language"}
          </h3>
          <p className="text-xs text-blue-700">
            {t("currentlyEditing") || "Currently editing in"}:{" "}
            <span className="font-medium">{currentLang.nativeName}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Language Progress Indicators */}
        <div className="flex items-center space-x-1">
          {languages.map((lang) => (
            <div
              key={lang.code}
              className={`w-2 h-2 rounded-full transition-colors ${
                lang.code === currentFormLanguage
                  ? "bg-blue-600"
                  : "bg-blue-300"
              }`}
              title={lang.nativeName}
            />
          ))}
        </div>

        {/* Language Controls */}
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            className="h-8 w-8 p-0 border-blue-300 hover:bg-blue-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Select
            value={currentFormLanguage}
            onValueChange={setCurrentFormLanguage}
          >
            <SelectTrigger className="w-40 h-8 border-blue-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  <div className="flex items-center space-x-2">
                    <span>{lang.flag}</span>
                    <span>{lang.nativeName}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleNext}
            className="h-8 w-8 p-0 border-blue-300 hover:bg-blue-100"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Simplified Multilingual Input - uses form language context
export function MultilingualInput({
  value = "",
  onChange,
  label,
  required = false,
  error = null,
  type = "text", // 'text' or 'textarea'
  placeholder = "",
}) {
  const { t } = useLanguage();
  const { currentFormLanguage, getCurrentLanguage } = useFormLanguage();
  const [multilingualValue, setMultilingualValue] = useState(() => {
    return MultilingualHelpers.parseMultilingual(value);
  });

  const currentLang = getCurrentLanguage();

  const handleValueChange = (newValue) => {
    const updated = {
      ...multilingualValue,
      [currentFormLanguage]: newValue,
    };
    setMultilingualValue(updated);

    // Convert back to string format and call onChange
    const formattedValue = MultilingualHelpers.formatMultilingual(updated);
    onChange(formattedValue);
  };

  const InputComponent = type === "textarea" ? Textarea : Input;

  const getPlaceholder = () => {
    if (placeholder) {
      return `${placeholder}`;
    }
    return `${t("enter")} ${label.toLowerCase()}`;
  };

  // Check if current language has content
  const hasContent = !!(
    multilingualValue[currentFormLanguage] &&
    multilingualValue[currentFormLanguage].trim()
  );

  // Get completion status for all languages
  const completedLanguages = Object.keys(multilingualValue).filter(
    (lang) => multilingualValue[lang] && multilingualValue[lang].trim()
  ).length;

  return (
    <div className="space-y-2">
      <Label className="flex items-center justify-between">
        <span className="flex items-center space-x-2">
          <span>
            {label} {required && <span className="text-red-500">*</span>}
          </span>
          <span className="text-xs text-gray-500">
            ({currentLang.flag} {currentLang.nativeName})
          </span>
        </span>

        {/* Completion indicator for this field */}
        <div className="flex items-center space-x-1">
          <span className="text-xs text-gray-500">{completedLanguages}/3</span>
          <div
            className={`w-2 h-2 rounded-full ${
              hasContent ? "bg-green-500" : "bg-gray-300"
            }`}
          />
        </div>
      </Label>

      <InputComponent
        placeholder={getPlaceholder()}
        value={multilingualValue[currentFormLanguage] || ""}
        onChange={(e) => handleValueChange(e.target.value)}
        className={error ? "border-red-500" : ""}
        rows={type === "textarea" ? 4 : undefined}
      />

      {error && (
        <p className="text-red-500 text-sm flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
}

// Keep the original display component unchanged
export function MultilingualDisplay({
  value,
  language = "en",
  fallbackToFirst = true,
}) {
  const displayValue = MultilingualHelpers.getDisplayValue(value, language);

  if (!displayValue && fallbackToFirst && value) {
    const parsed = MultilingualHelpers.parseMultilingual(value);
    const fallback = parsed.en || parsed.ru || parsed.uz || "";
    return fallback;
  }

  return displayValue || "-";
}
