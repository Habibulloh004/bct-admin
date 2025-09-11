"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ArrowRight, ArrowUp, Plus, X } from "lucide-react";
import { useFormLanguage } from "@/components/MultilingualInput";
import { useLanguage } from "@/lib/LanguageContext";
import { MultilingualHelpers } from "@/lib/models";

let columnCounter = 0;

const createColumn = () => ({
  id: `col_${columnCounter++}`,
  label: { en: "", ru: "", uz: "" },
});

const createRow = (columns) => {
  const row = {};
  columns.forEach((col) => {
    row[col.id] = { en: "", ru: "", uz: "" };
  });
  return row;
};

export function MultilingualTableInput({
  value = "",
  onChange,
  label,
  required = false,
  error = null,
}) {
  const { t } = useLanguage();
  const { currentFormLanguage, getCurrentLanguage } = useFormLanguage();
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (!value) {
      setColumns([]);
      setRows([]);
      return;
    }

    try {
      const parsed = JSON.parse(value);
      if (parsed && Array.isArray(parsed.columns) && Array.isArray(parsed.rows)) {
        const parsedColumns = parsed.columns.map((c) => ({
          id: c.id || `col_${columnCounter++}`,
          label: MultilingualHelpers.parseMultilingual(c.label),
        }));
        const parsedRows = parsed.rows.map((r) => {
          const obj = {};
          Object.entries(r).forEach(([colId, val]) => {
            obj[colId] = MultilingualHelpers.parseMultilingual(val);
          });
          return obj;
        });
        setColumns(parsedColumns);
        setRows(parsedRows);
      } else if (Array.isArray(parsed)) {
        // Backward compatibility with old fixed-column format
        const defaultKeys = ["name", "description", "parameters", "size"];
        const defaultCols = defaultKeys.map((key) => ({
          id: `col_${columnCounter++}`,
          label: { en: key.charAt(0).toUpperCase() + key.slice(1), ru: "", uz: "" },
        }));
        const parsedRows = parsed.map((row) => {
          const obj = {};
          defaultKeys.forEach((key, idx) => {
            const colId = defaultCols[idx].id;
            const cellValue = row[key];
            if (typeof cellValue === "string") {
              obj[colId] = MultilingualHelpers.parseMultilingual(cellValue);
            } else {
              obj[colId] = MultilingualHelpers.parseMultilingual(
                MultilingualHelpers.formatMultilingual(cellValue || {})
              );
            }
          });
          return obj;
        });
        setColumns(defaultCols);
        setRows(parsedRows);
      } else {
        setColumns([]);
        setRows([]);
      }
    } catch {
      setColumns([]);
      setRows([]);
    }
  }, [value]);

  const serializeAndChange = (newColumns, newRows) => {
    setColumns(newColumns);
    setRows(newRows);
    const serialized = {
      columns: newColumns.map((c) => ({
        id: c.id,
        label: MultilingualHelpers.formatMultilingual(c.label),
      })),
      rows: newRows.map((r) => {
        const obj = {};
        Object.entries(r).forEach(([colId, val]) => {
          obj[colId] = MultilingualHelpers.formatMultilingual(val);
        });
        return obj;
      }),
    };
    onChange(JSON.stringify(serialized));
  };

  const addRow = () => {
    const newRow = createRow(columns);
    serializeAndChange(columns, [...rows, newRow]);
  };

  const removeRow = (idx) => {
    const newRows = rows.filter((_, i) => i !== idx);
    serializeAndChange(columns, newRows);
  };

  const handleCellChange = (rowIdx, colId, val) => {
    const newRows = rows.map((row, i) =>
      i === rowIdx
        ? { ...row, [colId]: { ...row[colId], [currentFormLanguage]: val } }
        : row
    );
    serializeAndChange(columns, newRows);
  };

  const addColumn = () => {
    const newCol = createColumn();
    const newCols = [...columns, newCol];
    const newRows = rows.map((r) => ({ ...r, [newCol.id]: { en: "", ru: "", uz: "" } }));
    serializeAndChange(newCols, newRows);
  };

  const removeColumn = (colId) => {
    const newCols = columns.filter((c) => c.id !== colId);
    const newRows = rows.map((r) => {
      const { [colId]: _removed, ...rest } = r;
      return rest;
    });
    serializeAndChange(newCols, newRows);
  };

  const handleColumnNameChange = (colId, val) => {
    const newCols = columns.map((c) =>
      c.id === colId ? { ...c, label: { ...c.label, [currentFormLanguage]: val } } : c
    );
    serializeAndChange(newCols, rows);
  };

  const currentLang = getCurrentLanguage();

  const getLabel = (key, fallback) => {
    const translated = t(key);
    return translated === key ? fallback : translated;
  };

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
        <span className="text-xs text-gray-500">
          {rows.length} × {columns.length}
        </span>
      </Label>

      <div
        className={`border rounded-md overflow-x-auto ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      >
        <Table className="w-full text-sm">
          <TableHeader className="bg-gray-50">
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.id} className="p-2 text-left font-medium text-gray-700">
                  <div className="flex items-center space-x-2">
                    <Input
                      value={col.label[currentFormLanguage] || ""}
                      onChange={(e) => handleColumnNameChange(col.id, e.target.value)}
                      placeholder={getLabel("name", "Column")}
                      className="h-8"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeColumn(col.id)}
                      title={getLabel("delete", "Delete")}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </TableHead>
              ))}
              <TableHead className="p-2 w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="p-2 text-center text-gray-500"
                >
                  {getLabel("empty", "Empty")}
                </TableCell>
              </TableRow>
            )}
            {rows.map((row, rowIdx) => (
              <TableRow key={rowIdx} className="border-t">
                {columns.map((col) => (
                  <TableCell key={col.id} className="p-2 align-top">
                    <Input
                      value={row[col.id]?.[currentFormLanguage] || ""}
                      onChange={(e) => handleCellChange(rowIdx, col.id, e.target.value)}
                      placeholder={col.label[currentFormLanguage] || ""}
                    />
                  </TableCell>
                ))}
                <TableCell className="p-2 align-top">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRow(rowIdx)}
                    title={getLabel("delete", "Delete")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex space-x-2">
        <Button
          type="button"
          onClick={addRow}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <ArrowRight className="h-4 w-4" />
          <span>{getLabel("addNew", "Add Row")}</span>
        </Button>
        <Button
          type="button"
          onClick={addColumn}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <ArrowUp className="h-4 w-4" />
          <span>{getLabel("addNew", "Add Column")}</span>
        </Button>
      </div>

      {error && (
        <p className="text-red-500 text-sm flex items-center">{error}</p>
      )}
    </div>
  );
}

export default MultilingualTableInput;

