"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ProofModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  type: "image" | "pdf";
  src: string;
}

export default function ProofModal({
  open,
  onClose,
  title,
  type,
  src,
}: ProofModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 30);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      window.clearTimeout(focusTimer);
      previous?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="proof-modal"
      role="dialog"
      aria-modal="true"
      aria-label={title || "Proof"}
      onClick={onClose}
    >
      <div className="proof-modal-backdrop" aria-hidden />
      <div
        className="proof-modal-card"
        data-lenis-prevent
        onClick={(event) => event.stopPropagation()}
      >
        <header className="proof-modal-head">
          <div>
            <span className="section-kicker">
              <span className="section-index">PROOF</span>
              DOCUMENT
            </span>
            <h3>{title || "Proof"}</h3>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="proof-modal-close"
            onClick={onClose}
            aria-label="Close proof"
          >
            <X aria-hidden />
          </button>
        </header>

        <div className="proof-modal-content">
          {type === "image" ? (
            <img src={src} alt={title || "Proof"} loading="lazy" />
          ) : (
            <iframe src={src} title={title || "Proof"} loading="lazy" />
          )}
        </div>
      </div>
    </div>
  );
}
