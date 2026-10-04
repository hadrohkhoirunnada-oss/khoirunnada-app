import React from 'react';
import { BookingStatus, JobStatus, AttendanceStatus } from '@/lib/types';

interface GlassStatusBadgeProps {
  status?: BookingStatus | JobStatus | AttendanceStatus | string;
  label?: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'gold' | 'default';
  className?: string;
}

export function GlassStatusBadge({
  status,
  label,
  variant,
  className = '',
}: GlassStatusBadgeProps) {
  let displayLabel = label;
  let resolvedVariant = variant || 'default';

  if (status && !variant) {
    switch (status) {
      // Booking Status
      case 'new':
        displayLabel = label || 'Baru';
        resolvedVariant = 'info';
        break;
      case 'contacted':
        displayLabel = label || 'Sudah Dihubungi';
        resolvedVariant = 'info';
        break;
      case 'negotiation':
        displayLabel = label || 'Negosiasi';
        resolvedVariant = 'warning';
        break;
      case 'waiting_dp':
        displayLabel = label || 'Menunggu DP';
        resolvedVariant = 'warning';
        break;
      case 'confirmed':
        displayLabel = label || 'Terkonfirmasi';
        resolvedVariant = 'success';
        break;
      case 'completed':
        displayLabel = label || 'Selesai';
        resolvedVariant = 'success';
        break;
      case 'cancelled':
        displayLabel = label || 'Dibatalkan';
        resolvedVariant = 'danger';
        break;
      case 'rejected':
        displayLabel = label || 'Ditolak';
        resolvedVariant = 'danger';
        break;

      // Job Status
      case 'upcoming':
        displayLabel = label || 'Akan Datang';
        resolvedVariant = 'info';
        break;
      case 'ongoing':
        displayLabel = label || 'Berlangsung';
        resolvedVariant = 'gold';
        break;

      // Attendance Status
      case 'attending':
        displayLabel = label || 'Hadir';
        resolvedVariant = 'success';
        break;
      case 'not_attending':
        displayLabel = label || 'Tidak Hadir';
        resolvedVariant = 'danger';
        break;
      case 'maybe':
        displayLabel = label || 'Belum Pasti';
        resolvedVariant = 'warning';
        break;
      case 'no_response':
        displayLabel = label || 'Belum Menjawab';
        resolvedVariant = 'default';
        break;

      default:
        displayLabel = label || status;
        resolvedVariant = 'default';
    }
  }

  let styleClasses = 'bg-black/5 border-black/10 text-[#525D58]';
  if (resolvedVariant === 'success') {
    styleClasses = 'status-pill-success';
  } else if (resolvedVariant === 'warning') {
    styleClasses = 'status-pill-warning';
  } else if (resolvedVariant === 'danger') {
    styleClasses = 'status-pill-danger';
  } else if (resolvedVariant === 'info') {
    styleClasses = 'status-pill-info';
  } else if (resolvedVariant === 'gold') {
    styleClasses = 'bg-[#B58A3A]/12 border-[#B58A3A]/30 text-[#8C6821]';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border shadow-xs transform-gpu ${styleClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      <span>{displayLabel}</span>
    </span>
  );
}
