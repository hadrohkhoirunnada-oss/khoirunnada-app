'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Calendar, User } from 'lucide-react';

export function GlassBottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Beranda',
      href: '/app',
      icon: Home,
      exact: true,
    },
    {
      name: 'Qosidah',
      href: '/app/qosidah',
      icon: BookOpen,
      exact: false,
    },
    {
      name: 'Jadwal Job',
      href: '/app/jobs',
      icon: Calendar,
      exact: false,
    },
    {
      name: 'Profil',
      href: '/app/profile',
      icon: User,
      exact: false,
    },
  ];

  return (
    <nav className="absolute bottom-0 left-0 right-0 z-40 px-4 pb-3 pt-2 pointer-events-none">
      <div className="pointer-events-auto glass-dock rounded-2xl px-3 py-1.5 flex items-center justify-around border border-white/70 shadow-lg">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          const IconComponent = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center min-w-[64px] min-h-[44px] py-1 px-2.5 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer ${
                isActive
                  ? 'bg-[#996A19]/12 text-[#996A19] font-semibold'
                  : 'text-[#585145] hover:text-[#151917]'
              }`}
            >
              <div className="relative">
                <IconComponent
                  className={`w-5 h-5 transition-transform duration-150 ${
                    isActive ? 'scale-105 stroke-[2.2px]' : 'stroke-[1.8px]'
                  }`}
                />
              </div>
              <span
                className={`text-[10px] mt-0.5 tracking-tight ${
                  isActive ? 'font-bold text-[#996A19]' : 'font-medium'
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}