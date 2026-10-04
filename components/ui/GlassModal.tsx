'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
}

export function GlassModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
}: GlassModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  let maxW = 'max-w-md';
  if (maxWidth === 'sm') maxW = 'max-w-sm';
  if (maxWidth === 'lg') maxW = 'max-w-lg';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Frosted Scrim */}
      <div
        className="fixed inset-0 glass-scrim transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Sheet / Modal Container */}
      <div
        className={`relative w-full ${maxW} glass-modal rounded-t-[28px] sm:rounded-[24px] p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto transform-gpu transition-all duration-200 border border-white/80`}
      >
        {/* Mobile Drag Indicator Bar */}
        <div className="w-12 h-1 bg-black/15 rounded-full mx-auto mb-4 sm:hidden" />

        <div className="flex items-center justify-between pb-3 mb-4 border-b border-black/5">
          <div>
            <h3 className="text-lg font-bold text-[#151917] tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-[#525D58] mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 text-[#525D58] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
}
