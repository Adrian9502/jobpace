"use client";

import React from "react";
import { CldUploadWidget } from "next-cloudinary";
import { Download, Upload, FileText, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import DeleteConfirmModal from "../modals/DeleteConfirmModal";

interface Document {
  id: string;
  type: string;
  url: string;
  name: string;
  createdAt: Date | null;
}

interface DocumentCardProps {
  title: string;
  type: string;
  icon: React.ReactNode;
  documents: Document[];
  limit: number;
  onUploadSuccess: (url: string, name: string) => void;
  onDelete: (id: string) => void;
  isDeleting: string | null;
}

export default function DocumentCard({
  title,
  type,
  icon,
  documents,
  limit,
  onUploadSuccess,
  onDelete,
  isDeleting,
}: DocumentCardProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const atLimit = documents.length >= limit;

  return (
    <>
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {title}
            </h3>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
              {documents.length} of {limit} files uploaded
            </p>
          </div>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            atLimit
              ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
          }`}
        >
          {documents.length}/{limit}
        </span>
      </div>

      {/* Document list */}
      <div className="px-5 py-3 flex flex-col gap-2">
        {documents.length === 0 ? (
          <div className="py-6 text-center">
            <FileText className="w-8 h-8 text-zinc-200 dark:text-zinc-700 mx-auto mb-2" />
            <p className="text-sm text-zinc-400 dark:text-zinc-500">
              No files uploaded yet
            </p>
            <p className="text-xs text-zinc-300 dark:text-zinc-600 mt-0.5">
              PDF, DOC, or DOCX · Max 5MB
            </p>
          </div>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors group"
            >
              <FileText className="w-4 h-4 text-blue-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate">
                  {doc.name}
                </p>
                {doc.createdAt && (
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                    {formatDistanceToNow(new Date(doc.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={doc.url}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-md text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setDocumentToDelete(doc)}
                  disabled={isDeleting === doc.id}
                  className="p-1.5 rounded-md text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                  title="Delete"
                >
                  {isDeleting === doc.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer upload button */}
      <div className="px-5 py-4 bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-100 dark:border-zinc-800">
        <CldUploadWidget
          uploadPreset={
            process.env.NEXT_PUBLIC_CLOUDINARY_DOCUMENTS_PRESET ||
            process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
          }
          options={{
            maxFiles: 1,
            resourceType: "raw",
            clientAllowedFormats: ["pdf", "doc", "docx"],
            maxFileSize: 5000000,
          }}
          onOpen={() => setIsUploading(true)}
          onClose={() => setIsUploading(false)}
          onSuccess={(result: any) => {
            setIsUploading(false);
            if (result?.info?.secure_url) {
              const url = result.info.secure_url;
              const format = result.info.format || result.info.original_extension;
              const name = result.info.original_filename + (format ? "." + format : "");
              onUploadSuccess(url, name);
            }
          }}
          onError={() => setIsUploading(false)}
        >
          {({ open }) => (
            <button
              onClick={(e) => {
                e.preventDefault();
                open();
              }}
              disabled={atLimit || isUploading}
              className={`w-full py-2.5 cursor-pointer px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                atLimit
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm active:scale-[0.98]"
              }`}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : atLimit ? (
                `Limit reached (${limit}/${limit})`
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload {title}
                </>
              )}
            </button>
          )}
        </CldUploadWidget>
      </div>
    </div>
    
    <DeleteConfirmModal
      open={!!documentToDelete}
      onClose={() => setDocumentToDelete(null)}
      onConfirm={async () => {
        if (documentToDelete) {
          onDelete(documentToDelete.id);
        }
      }}
      title="Delete Document"
      description="Are you sure you want to delete this document?"
      itemName={documentToDelete?.name}
    />
    </>
  );
}
