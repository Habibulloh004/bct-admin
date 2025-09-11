"use client";

import React from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { getTranslatedValue, cn } from "@/lib/utils";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export default function ProductFeatures({ productData, variant = "full", className }) {
  const { currentLanguage, t } = useLanguage();
  const name = getTranslatedValue(productData?.name, currentLanguage);
  const lead = getTranslatedValue(productData?.ads_title, currentLanguage);

  let descriptionData = { columns: [], rows: [] };
  try {
    const parsed = JSON.parse(productData?.description || "{}");
    if (parsed && Array.isArray(parsed.columns) && Array.isArray(parsed.rows)) {
      descriptionData = parsed;
    }
  } catch (error) {
    console.error("Failed to parse description JSON:", error);
  }

  const { columns, rows } = descriptionData;

  const renderTable = () => (
    <Table className="bg-white text-primary w-full text-sm border-collapse">
      <TableHeader>
        <TableRow className="bg-gray-100">
          {columns.map((col) => (
            <TableHead
              key={col.id}
              className="border border-gray-200 p-2 text-left font-semibold"
            >
              {getTranslatedValue(col.label, currentLanguage) || "-"}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, index) => (
          <TableRow key={index} className="even:bg-gray-50">
            {columns.map((col) => (
              <TableCell key={col.id} className="border border-gray-200 p-2">
                {getTranslatedValue(row[col.id], currentLanguage) || "-"}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  if (variant === "inline") {
    return (
      <aside className={cn("w-full bg-white border rounded-xl p-2 shadow-sm", className)}>
        <h2 className="text-xl font-semibold mb-1">{name}</h2>
        {lead ? (
          <p
            className="text-sm text-muted-foreground mb-3"
            dangerouslySetInnerHTML={{ __html: lead }}
          />
        ) : null}
      </aside>
    );
  }

  return (
    <div className={cn("w-full py-4 h-full", className)}>
      <div className="w-11/12 md:w-10/12 max-w-[1440px] mx-auto flex flex-col items-start">
        <div className="w-full pt-4 text-white prose prose-invert max-w-none">
          {renderTable()}
        </div>
      </div>
    </div>
  );
}
