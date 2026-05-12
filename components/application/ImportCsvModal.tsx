import { useRef, useState, useCallback } from "react";
import { X, Upload, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Papa from "papaparse";
import { importApplications } from "@/lib/actions/settings";
import { validateCsvRows, generateCsvTemplate } from "@/lib/csv-helpers";
import type { ImportValidationResult } from "@/lib/csv-helpers";

interface Props {
  onClose: () => void;
}

export default function ImportCsvModal({ onClose }: Props) {
  const [importResult, setImportResult] =
    useState<ImportValidationResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a .csv file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File is too large (max 2MB).");
      return;
    }
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const rawRows = results.data as Record<string, string>[];
        const validation = validateCsvRows(rawRows, headers);
        setImportResult(validation);
        if (validation.validRows.length === 0 && validation.errors.length > 0) {
          toast.error("No valid rows found. Check the errors below.");
        }
      },
      error: () => toast.error("Failed to parse the CSV file."),
    });
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  function handleDownloadTemplate() {
    const csv = generateCsvTemplate();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "jobpace-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleConfirmImport() {
    if (!importResult || importResult.validRows.length === 0) return;
    setImporting(true);
    const result = await importApplications(importResult.validRows);
    setImporting(false);
    if (result.success) {
      toast.success(
        result.changes?.[0] ||
          `Imported ${importResult.validRows.length} applications!`,
      );
      onClose();
    } else {
      toast.error(result.error || "Failed to import.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 space-y-5 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Import Applications
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Upload a CSV file to bulk-add applications. Need the right format?{" "}
          <button
            onClick={handleDownloadTemplate}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Download template
          </button>
        </p>

        {!importResult && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragActive
                ? "border-blue-400 bg-blue-50 dark:bg-blue-900/10"
                : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
            }`}
          >
            <Upload className="w-8 h-8 text-zinc-400 mx-auto mb-3" />
            <p className="text-sm text-zinc-600 dark:text-zinc-300 font-medium">
              {dragActive
                ? "Drop your CSV here"
                : "Click or drag a CSV file here"}
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
              Max 2MB • .csv files only
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}

        {importResult && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-sm">
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                  {importResult.validRows.length} valid
                </span>
              </div>
              {importResult.errors.length > 0 && (
                <div className="flex items-center gap-1.5 text-sm">
                  <X className="w-4 h-4 text-red-500" />
                  <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                    {importResult.errors.length} error
                    {importResult.errors.length !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>

            {importResult.errors.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 rounded-lg p-3 max-h-40 overflow-y-auto">
                <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1.5">
                  Skipped Rows:
                </p>
                <ul className="space-y-1">
                  {importResult.errors.map((err, i) => (
                    <li
                      key={i}
                      className="text-xs text-red-600 dark:text-red-400"
                    >
                      Row {err.row}: {err.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={handleConfirmImport}
                disabled={importing || importResult.validRows.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {importing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Import {importResult.validRows.length} Application
                    {importResult.validRows.length !== 1 ? "s" : ""}
                  </>
                )}
              </button>
              <button
                onClick={() => setImportResult(null)}
                className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                Re-upload
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
