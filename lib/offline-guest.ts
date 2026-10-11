'use client';

import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'khoirunnada_offline_guest';
const CHANGE_EVENT = 'khoirunnada:offline-guest-change';
export const OFFLINE_SECTION_EVENT = 'khoirunnada:offline-section';
export const OFFLINE_QOSIDAH_EVENT = 'khoirunnada:offline-open-qosidah';
let memoryValue = false;
let storageAvailable = true;

export function getIsOfflineGuest(): boolean {
  if (typeof window === 'undefined') return false;
  if (!storageAvailable) return memoryValue;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    storageAvailable = false;
    return memoryValue;
  }
}

export function setIsOfflineGuest(value: boolean): void {
  memoryValue = value;
  if (typeof window === 'undefined') return;
  try {
    if (value) window.localStorage.setItem(STORAGE_KEY, 'true');
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    storageAvailable = false;
    // Mode tetap berlaku selama tab terbuka jika penyimpanan browser dibatasi.
  }
  try {
    document.cookie = value
      ? 'khoirunnada_offline_guest=true; Path=/; SameSite=Lax'
      : 'khoirunnada_offline_guest=; Path=/; Max-Age=0; SameSite=Lax';
  } catch {
    // Navigasi lokal tetap dapat menggunakan flag selama tab terbuka.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function checkIsOnline(): boolean {
  return typeof navigator === 'undefined' ? true : navigator.onLine;
}

export async function verifyOnlineConnection(): Promise<boolean> {
  if (!checkIsOnline()) return false;
  try {
    const response = await fetch('/connectivity.txt', { cache: 'no-store' });
    return response.ok;
  } catch {
    return false;
  }
}

function subscribe(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

export function useOfflineGuest(): boolean {
  return useSyncExternalStore(subscribe, getIsOfflineGuest, () => false);
}
