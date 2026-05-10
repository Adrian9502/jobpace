"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FileText, Mail, FolderOpen } from "lucide-react";
import DocumentCard from "./DocumentCard";
import { addDocument, deleteDocument } from "@/app/actions/documents";

interface Document {
  id: string;
  type: string;
  url: string;
  name: string;
  createdAt: Date | null;
}

interface DocumentManagerProps {
  initialDocuments: Document[];
}

export default function DocumentManager({
  initialDocuments,
}: DocumentManagerProps) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    setDocuments(initialDocuments);
  }, [initialDocuments]);

  const handleUploadSuccess = async (
    type: string,
    url: string,
    name: string,
  ) => {
    try {
      const result = await addDocument({ type, url, name });
      if (result.success) {
        toast.success(`${name} uploaded successfully!`);
        // optimistic update
        setDocuments((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            type,
            url,
            name,
            createdAt: new Date(),
          },
        ]);
      } else {
        toast.error(result.error || "Failed to upload document");
      }
    } catch {
      toast.error("An unexpected error occurred");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(id);
      const result = await deleteDocument(id);
      if (result.success) {
        toast.success("Document deleted");
        setDocuments((prev) => prev.filter((d) => d.id !== id));
      } else {
        toast.error(result.error || "Failed to delete document");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(null);
    }
  };

  const resumes = documents.filter((d) => d.type === "resume");
  const coverLetters = documents.filter((d) => d.type === "cover_letter");
  const otherDocs = documents.filter((d) => d.type === "other");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      <DocumentCard
        title="Resume & CV"
        type="resume"
        icon={<FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
        documents={resumes}
        limit={5}
        onUploadSuccess={(url, name) =>
          handleUploadSuccess("resume", url, name)
        }
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />
      <DocumentCard
        title="Cover Letter"
        type="cover_letter"
        icon={<Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
        documents={coverLetters}
        limit={5}
        onUploadSuccess={(url, name) =>
          handleUploadSuccess("cover_letter", url, name)
        }
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />
      <DocumentCard
        title="Other Docs"
        type="other"
        icon={
          <FolderOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        }
        documents={otherDocs}
        limit={10}
        onUploadSuccess={(url, name) => handleUploadSuccess("other", url, name)}
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
