"use client";

import { useState } from "react";
import ApplicationModal from "./ApplicationModal";

export default function AddApplicationButton() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0052CC] text-white text-sm font-medium rounded-lg hover:bg-[#0747A6] transition-colors shadow-sm"
      >
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <path d="M8 3v10M3 8h10" />
        </svg>
        Add Application
      </button>

      <ApplicationModal
        open={showModal}
        onClose={() => setShowModal(false)}
        editData={null}
      />
    </>
  );
}
