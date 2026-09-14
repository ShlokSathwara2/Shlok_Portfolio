"use client";

import { useEffect } from "react";

interface ProofModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  type: "image" | "pdf";
  src: string;
}

export default function ProofModal({ open, onClose, title, type, src }: ProofModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-[modalIn_0.25s_ease]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06]">
          <h3 className="font-[family-name:var(--font-space-grotesk)] text-lg font-bold truncate pr-4">
            {title || "Proof"}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-colors text-lg font-bold flex-shrink-0"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {type === "image" ? (
            <img
              src={src}
              alt={title || "Proof"}
              className="w-full h-auto rounded-lg object-contain max-h-[75vh]"
            />
          ) : (
            <iframe
              src={src}
              className="w-full h-[75vh] rounded-lg border-0"
              title={title || "Proof"}
            />
          )}
        </div>
      </div>
    </div>
  );
}
