"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import ApplicationModal from "@/components/modals/ApplicationModal";
import type { UserDocumentRow } from "@/lib/queries";

export default function AddApplicationButton({ documents = [] }: { documents?: UserDocumentRow[] }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center cursor-pointer gap-2 px-4 py-2.5 bg-[#0052CC] text-white text-sm font-medium rounded-lg hover:bg-[#0747A6] transition-colors shadow-sm sm:w-auto w-full justify-center"
      >
        <Plus className="w-4 h-4 shrink-0" />
        <span className="sm:inline hidden">Add Application</span>
        <span className="sm:hidden inline">Add</span>
      </button>

      <ApplicationModal
        open={showModal}
        onClose={() => setShowModal(false)}
        editData={null}
        documents={documents}
      />
    </>
  );
}
