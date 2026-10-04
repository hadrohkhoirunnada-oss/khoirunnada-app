import React from 'react';

interface GlassEmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function GlassEmptyState({
  icon,
  title,
  description,
  action,
}: GlassEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 glass-card my-6">
      {/* Frosted Medallion (PRD #75) */}
      <div className="w-16 h-16 rounded-full bg-white/80 border border-white shadow-[0_4px_16px_rgba(11,107,87,0.08)] flex items-center justify-center text-[#996A19] mb-4">
        {icon}
      </div>
      <h4 className="text-base font-bold text-[#151917] mb-1">{title}</h4>
      <p className="text-sm text-[#525D58] max-w-xs mb-4 leading-relaxed">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
