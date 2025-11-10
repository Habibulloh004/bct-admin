import { useCallback } from "react";
import { MultilingualHelpers } from "./models";
import { useStore } from "./store";
import { normalizeCurrencyValue } from "./utils";

const PRODUCT_LANGUAGES = ["en", "ru", "uz"];
const EMPTY_DESCRIPTION_STRUCTURE = JSON.stringify({ columns: [], rows: [] });

const toStringSafe = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  return String(value);
};

const ensureLanguageObject = (value) => {
  if (value === null || value === undefined || value === "") {
    return PRODUCT_LANGUAGES.reduce(
      (acc, lang) => ({ ...acc, [lang]: "" }),
      {}
    );
  }

  if (typeof value === "string") {
    if (value.includes("***")) {
      return MultilingualHelpers.parseMultilingual(value);
    }
    const trimmedValue = value.trim();
    return PRODUCT_LANGUAGES.reduce(
      (acc, lang) => ({ ...acc, [lang]: trimmedValue }),
      {}
    );
  }

  if (typeof value === "object") {
    return PRODUCT_LANGUAGES.reduce((acc, lang) => {
      const rawValue = value[lang];
      acc[lang] =
        rawValue === null || rawValue === undefined ? "" : toStringSafe(rawValue);
      return acc;
    }, {});
  }

  return PRODUCT_LANGUAGES.reduce(
    (acc, lang) => ({ ...acc, [lang]: toStringSafe(value) }),
    {}
  );
};

const formatMultilingualField = (value) =>
  MultilingualHelpers.formatMultilingual(ensureLanguageObject(value));

const normaliseTableDescription = (description) => {
  if (!description) return EMPTY_DESCRIPTION_STRUCTURE;
  if (typeof description === "string") {
    try {
      const parsed = JSON.parse(description);
      if (parsed && typeof parsed === "object") {
        return JSON.stringify(parsed);
      }
    } catch {
      return description;
    }
  }

  if (Array.isArray(description)) {
    // Backwards compatible format (array of rows with default columns)
    const defaultColumns = ["name", "description", "parameters", "size"];
    const columns = defaultColumns.map((key, idx) => ({
      id: `col_${idx}`,
      label: formatMultilingualField({
        en: key.charAt(0).toUpperCase() + key.slice(1),
        ru: "",
        uz: "",
      }),
    }));

    const rows = description.map((row) => {
      const formattedRow = {};
      defaultColumns.forEach((key, idx) => {
        const colId = columns[idx].id;
        const rawValue = row?.[key] ?? "";
        formattedRow[colId] = formatMultilingualField(rawValue);
      });
      return formattedRow;
    });

    return JSON.stringify({ columns, rows });
  }

  if (typeof description === "object") {
    const { columns = [], rows = [] } = description;
    const formattedColumns = columns.map((column, idx) => ({
      id: column?.id || `col_${idx}`,
      label: formatMultilingualField(column?.label ?? ""),
    }));

    const formattedRows = rows.map((row = {}) => {
      const formattedRow = {};
      Object.entries(row).forEach(([colId, cellValue]) => {
        formattedRow[colId] = formatMultilingualField(cellValue);
      });
      return formattedRow;
    });

    return JSON.stringify({
      columns: formattedColumns,
      rows: formattedRows,
    });
  }

  return EMPTY_DESCRIPTION_STRUCTURE;
};

const stripEmptyFields = (payload) =>
  Object.fromEntries(
    Object.entries(payload).filter(([_, value]) => {
      if (value === null || value === undefined) return false;
      if (typeof value === "string") return value.trim() !== "";
      if (Array.isArray(value)) return value.length > 0;
      return true;
    })
  );

export const buildProductPayload = (product = {}) => {
  const payload = {
    name: formatMultilingualField(product.name),
    ads_title: formatMultilingualField(product.ads_title),
    description: normaliseTableDescription(product.description),
    guarantee: formatMultilingualField(product.guarantee),
    serial_number: toStringSafe(product.serial_number),
    price: normalizeCurrencyValue(product.price),
    discount: normalizeCurrencyValue(product.discount),
    category_id: product.category_id
      ? toStringSafe(product.category_id)
      : "",
    images: Array.isArray(product.images)
      ? product.images.filter(Boolean)
      : product.images
      ? [product.images]
      : [],
  };

  return stripEmptyFields(payload);
};

export function useProductCrud() {
  const { createItem, updateItem, deleteItem } = useStore();

  const addProduct = useCallback(
    async (productData) => {
      const payload = buildProductPayload(productData);
      return createItem("products", payload);
    },
    [createItem]
  );

  const updateProduct = useCallback(
    async (id, productData) => {
      const payload = buildProductPayload(productData);
      return updateItem("products", id, payload);
    },
    [updateItem]
  );

  const deleteProduct = useCallback(
    async (id) => {
      return deleteItem("products", id);
    },
    [deleteItem]
  );

  return {
    addProduct,
    updateProduct,
    deleteProduct,
    buildProductPayload,
    languages: PRODUCT_LANGUAGES,
  };
}

export const ProductLanguages = PRODUCT_LANGUAGES;
