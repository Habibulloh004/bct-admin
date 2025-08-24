"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  AlertCircle, 
  Globe, 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered,
  Link,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight
} from "lucide-react";
import { MultilingualHelpers } from "@/lib/models";
import { useFormLanguage } from "@/components/MultilingualInput";
import { useLanguage } from "@/lib/LanguageContext";

// Custom Rich Text Editor Component
export function MultilingualRichTextEditor({
  value = "",
  onChange,
  label,
  required = false,
  error = null,
  placeholder = "",
  height = "200px"
}) {
  const { t } = useLanguage();
  const { currentFormLanguage, getCurrentLanguage } = useFormLanguage();
  const [multilingualValue, setMultilingualValue] = useState(() => {
    return MultilingualHelpers.parseMultilingual(value);
  });
  const [mounted, setMounted] = useState(false);
  const editorRef = useRef(null);

  const currentLang = getCurrentLanguage();

  // Handle mounting to avoid SSR issues
  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    const parsed = MultilingualHelpers.parseMultilingual(value);
    setMultilingualValue(parsed);

    if (mounted && editorRef.current) {
      const content = parsed[currentFormLanguage] || "";
      editorRef.current.innerHTML = content;
    }
  }, [value, currentFormLanguage, mounted]);

  // Update editor content when language changes
  useLayoutEffect(() => {
    if (mounted && editorRef.current) {
      const content = multilingualValue[currentFormLanguage] || "";
      editorRef.current.innerHTML = content;
    }
  }, [currentFormLanguage, multilingualValue, mounted]);

  const handleValueChange = () => {
    if (!editorRef.current) return;
    
    const content = editorRef.current.innerHTML;
    const updated = {
      ...multilingualValue,
      [currentFormLanguage]: content,
    };
    setMultilingualValue(updated);

    // Convert back to string format and call onChange
    const formattedValue = MultilingualHelpers.formatMultilingual(updated);
    onChange(formattedValue);
  };

  const executeCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleValueChange();
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  const formatBlock = (tag) => {
    executeCommand('formatBlock', tag);
  };

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

  if (!mounted) {
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
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-500">{completedLanguages}/3</span>
            <div
              className={`w-2 h-2 rounded-full ${
                hasContent ? "bg-green-500" : "bg-gray-300"
              }`}
            />
          </div>
        </Label>
        <div className="h-32 bg-gray-100 rounded-md animate-pulse flex items-center justify-center">
          <span className="text-gray-500">Loading editor...</span>
        </div>
      </div>
    );
  }

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

      <div 
        className={`border rounded-md ${error ? "border-red-500" : "border-gray-300"}`}
      >
        {/* Toolbar */}
        <div className="border-b p-2 flex flex-wrap gap-1 bg-gray-50 rounded-t-md">
          {/* Format Blocks */}
          <select 
            onChange={(e) => formatBlock(e.target.value)}
            className="text-xs border rounded px-2 py-1 bg-white"
            defaultValue=""
          >
            <option value="">Normal</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
            <option value="h5">Heading 5</option>
            <option value="h6">Heading 6</option>
          </select>

          <div className="border-l mx-1"></div>

          {/* Text Formatting */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => executeCommand('bold')}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => executeCommand('italic')}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => executeCommand('underline')}
            title="Underline"
          >
            <Underline className="h-4 w-4" />
          </Button>

          <div className="border-l mx-1"></div>

          {/* Lists */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => executeCommand('insertUnorderedList')}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => executeCommand('insertOrderedList')}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          <div className="border-l mx-1"></div>

          {/* Alignment */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => executeCommand('justifyLeft')}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => executeCommand('justifyCenter')}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => executeCommand('justifyRight')}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </Button>

          <div className="border-l mx-1"></div>

          {/* Link */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={insertLink}
            title="Insert Link"
          >
            <Link className="h-4 w-4" />
          </Button>
        </div>

        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable
          className="p-3 outline-none min-h-[200px] prose prose-sm max-w-none focus:ring-0 rich-text-editor"
          style={{ minHeight: height }}
          onInput={handleValueChange}
          onBlur={handleValueChange}
          suppressContentEditableWarning={true}
          data-placeholder={getPlaceholder()}
        />
      </div>

      {error && (
        <p className="text-red-500 text-sm flex items-center mt-2">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
}

// Rich Text Display Component for showing HTML content
export function RichTextDisplay({ 
  value, 
  language = "en", 
  fallbackToFirst = true,
  className = ""
}) {
  const displayValue = MultilingualHelpers.getDisplayValue(value, language);
  
  let content = displayValue;
  
  if (!content && fallbackToFirst && value) {
    const parsed = MultilingualHelpers.parseMultilingual(value);
    content = parsed.en || parsed.ru || parsed.uz || "";
  }

  if (!content) {
    return <span className="text-gray-400 italic">No content available</span>;
  }

  return (
    <div 
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}