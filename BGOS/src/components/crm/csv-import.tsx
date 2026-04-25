"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import { Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { CrmLead } from "@/components/crm/types";

type CsvImportProps = {
  onSuccess: (leads: CrmLead[]) => void;
};

const bgosFields = [
  "ignore",
  "name",
  "phone",
  "email",
  "company",
  "source",
  "value",
  "notes",
];

const sampleCsv =
  "name,phone,email,company,source,value,notes\nAarav Mehta,9876543210,aarav@example.com,Acme Labs,WEBSITE,50000,Interested in demo\n";

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"' && nextChar === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function toCsvValue(value: string) {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

export function CsvImport({ onSuccess }: CsvImportProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvData, setCsvData] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<number, string>>({});
  const [importing, setImporting] = useState(false);

  const importCount = Math.max(rows.length, 0);
  const previewRows = useMemo(() => rows.slice(0, 5), [rows]);

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const lines = text.split(/\r?\n/).filter(Boolean);
      const parsedHeaders = parseCsvLine(lines[0] ?? "");
      const parsedRows = lines.slice(1).map(parseCsvLine);
      const nextMapping = parsedHeaders.reduce<Record<number, string>>(
        (result, header, index) => {
          const normalized = header.toLowerCase().trim();
          result[index] = bgosFields.includes(normalized) ? normalized : "ignore";
          return result;
        },
        {},
      );

      setCsvData(text);
      setHeaders(parsedHeaders);
      setRows(parsedRows);
      setMapping(nextMapping);
    };
    reader.readAsText(file);
  }

  function buildMappedCsv() {
    const targetHeaders = bgosFields.filter((field) => field !== "ignore");
    const mappedRows = rows.map((row) =>
      targetHeaders.map((field) => {
        const sourceIndex = Object.entries(mapping).find(
          ([, mappedField]) => mappedField === field,
        )?.[0];
        return sourceIndex === undefined ? "" : row[Number(sourceIndex)] ?? "";
      }),
    );

    return [
      targetHeaders.join(","),
      ...mappedRows.map((row) => row.map(toCsvValue).join(",")),
    ].join("\n");
  }

  async function importCsv() {
    if (!csvData) return;

    setImporting(true);
    const response = await fetch("/api/leads/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csvData: buildMappedCsv() }),
    });
    setImporting(false);

    if (!response.ok) {
      toast("Unable to import CSV", "error");
      return;
    }

    const data = (await response.json()) as { imported: number; leads: CrmLead[] };
    toast(`${data.imported} leads imported. NEXA is scoring them now.`, "success");
    setCsvData("");
    setHeaders([]);
    setRows([]);
    setMapping({});
    onSuccess(data.leads);
  }

  function downloadSample() {
    const blob = new Blob([sampleCsv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "bgos-leads-sample.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#13131c] p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-lg font-bold text-white">
            Import leads
          </h2>
          <button
            type="button"
            onClick={downloadSample}
            className="mt-1 text-sm font-medium text-[#7C6FFF] hover:text-[#9f97ff]"
          >
            Download sample CSV
          </button>
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-xl bg-[#7C6FFF] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6b60e8]"
        >
          <Upload className="h-4 w-4" />
          Import CSV
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFile}
          className="hidden"
        />
      </div>

      {headers.length > 0 ? (
        <div className="mt-5 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase text-zinc-500">
                  {headers.map((header, index) => (
                    <th key={`${header}-${index}`} className="px-3 py-2">
                      <div className="space-y-2">
                        <p>{header}</p>
                        <select
                          value={mapping[index] ?? "ignore"}
                          onChange={(event) =>
                            setMapping({
                              ...mapping,
                              [index]: event.target.value,
                            })
                          }
                          className="w-full rounded-lg border border-white/10 bg-[#0e0e13] px-2 py-1 text-xs text-white outline-none"
                        >
                          {bgosFields.map((field) => (
                            <option key={field} value={field}>
                              {field}
                            </option>
                          ))}
                        </select>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-white/5">
                    {headers.map((header, columnIndex) => (
                      <td
                        key={`${header}-${columnIndex}`}
                        className="px-3 py-2 text-xs text-zinc-400"
                      >
                        {row[columnIndex]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Button type="button" loading={importing} onClick={importCsv}>
            Import {importCount} leads
          </Button>
        </div>
      ) : null}
    </div>
  );
}
