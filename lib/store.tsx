'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { QOSIDAH_LIST, QOSIDAH_CATEGORIES } from './data/qosidah';
import type { User } from '@supabase/supabase-js';
import { createClient } from './supabase/client';
import { isSupabaseConfigured } from './supabase/config';
import type {
  Profile,
  Booking,
  BookingStatus,
  Job,
  JobAttendance,
  AttendanceStatus,
  JobAssignment,
  Qosidah,
  QosidahCategory,
  FinanceTransaction,
  FinanceCategory,
  AppNotification,
  AuditLog,
} from './types';

type PortalType = 'pemain' | 'admin';

interface AppStoreContextType {
  isLoading: boolean;
  isConfigured: boolean;
  dataError: string;
  currentUser: Profile;
  profiles: Profile[];
  signInWithPassword: (email: string, password: string, portal: PortalType) => Promise<string>;
  signInWithGoogle: (portal: PortalType) => Promise<void>;
  logout: () => Promise<void>;
  refreshData: () => Promise<Profile | null>;
  bookings: Booking[];
  createBooking: (data: Omit<Booking, 'id' | 'booking_code' | 'created_at' | 'status'>) => Promise<Booking>;
  updateBookingStatus: (id: string, status: BookingStatus, adminNotes?: string) => Promise<void>;
  convertBookingToJob: (bookingId: string, extraData?: Partial<Job>) => Promise<Job>;
  jobs: Job[];
  attendances: JobAttendance[];
  assignments: JobAssignment[];
  createJob: (jobData: Omit<Job, 'id' | 'created_at' | 'created_by'>) => Promise<Job>;
  updateJob: (job: Job) => Promise<void>;
  setAttendance: (jobId: string, status: AttendanceStatus, note?: string) => Promise<void>;
  assignMember: (jobId: string, userId: string, roleName: string, notes?: string) => Promise<void>;
  qosidahs: Qosidah[];
  categories: QosidahCategory[];
  favorites: string[];
  recentIds: string[];
  toggleFavorite: (qosidahId: string) => Promise<void>;
  markAsRecent: (qosidahId: string) => Promise<void>;
  createQosidah: (data: Omit<Qosidah, 'id' | 'created_at' | 'is_active'>) => Promise<Qosidah>;
  updateQosidah: (qosidah: Qosidah) => Promise<void>;
  transactions: FinanceTransaction[];
  financeCategories: FinanceCategory[];
  addTransaction: (transaction: Omit<FinanceTransaction, 'id' | 'created_at' | 'created_by' | 'created_by_name'>) => Promise<FinanceTransaction>;
  uploadReceipt: (file: File) => Promise<string>;
  balance: number;
  incomeThisMonth: number;
  expenseThisMonth: number;
  notifications: AppNotification[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  sendAnnouncement: (title: string, message: string, targetType?: 'all' | 'member' | 'treasurer' | 'admin') => Promise<void>;
  approveMember: (id: string) => Promise<void>;
  rejectMember: (id: string) => Promise<void>;
  toggleMemberRole: (id: string, roleKey: 'is_member' | 'is_treasurer' | 'is_admin') => Promise<void>;
  deactivateMember: (id: string) => Promise<void>;
  updateMemberRoleTitle: (id: string, roleTitle: string) => Promise<void>;
  updateAvatar: (file: File) => Promise<string>;
  removeAvatar: () => Promise<string>;
  updateUsername: (name: string) => Promise<string>;
  auditLogs: AuditLog[];
}

const EMPTY_PROFILE: Profile = {
  id: '',
  auth_user_id: '',
  name: 'Pengguna',
  email: '',
  avatar_url: '/logo-khoirunnada-192.png',
  status: 'pending',
  is_member: false,
  is_treasurer: false,
  is_admin: false,
  created_at: '',
};

const AppStoreContext = createContext<AppStoreContextType | null>(null);

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Terjadi kesalahan saat menghubungi server.';
}

function ensureClient(client: ReturnType<typeof createClient>) {
  if (!client) throw new Error('Supabase belum dikonfigurasi oleh pengurus.');
  return client;
}

function normalizeProfile(row: Record<string, unknown>): Profile {
  return {
    id: String(row.id ?? ''),
    auth_user_id: String(row.auth_user_id ?? ''),
    name: String(row.name ?? 'Pengguna'),
    email: String(row.email ?? ''),
    avatar_url: String(row.avatar_url ?? '/logo-khoirunnada-192.png'),
    phone: row.phone ? String(row.phone) : undefined,
    role_title: row.role_title ? String(row.role_title) : undefined,
    status: row.status as Profile['status'],
    is_member: Boolean(row.is_member),
    is_treasurer: Boolean(row.is_treasurer),
    is_admin: Boolean(row.is_admin),
    created_at: String(row.created_at ?? ''),
    approved_at: row.approved_at ? String(row.approved_at) : undefined,
    approved_by: row.approved_by ? String(row.approved_by) : undefined,
  };
}

function destinationFor(profile: Profile, portal: PortalType) {
  if (profile.status === 'pending') return '/pending';
  if (profile.status !== 'active') throw new Error('Akun ini sedang tidak aktif. Hubungi Pengurus Hadroh Khoirunnada.');
  if (portal === 'admin') {
    if (!profile.is_admin && !profile.is_treasurer) {
      throw new Error('Akun ini tidak memiliki hak akses Admin atau Bendahara.');
    }
    return profile.is_admin ? '/app/admin' : '/app/admin/finance';
  }
  // Jika portal === 'pemain':
  // Baik pemain resmi maupun pengurus (Admin) dapat langsung masuk ke portal pemain (/app)!
  return '/app';
}

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const configured = isSupabaseConfigured();
  const supabase = useMemo(() => createClient(), []);
  const [isLoading, setIsLoading] = useState(true);
  const [dataError, setDataError] = useState('');
  const [currentUser, setCurrentUser] = useState<Profile>(EMPTY_PROFILE);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [attendances, setAttendances] = useState<JobAttendance[]>([]);
  const [assignments, setAssignments] = useState<JobAssignment[]>([]);
  const [qosidahs, setQosidahs] = useState<Qosidah[]>(QOSIDAH_LIST);
  const [categories, setCategories] = useState<QosidahCategory[]>(QOSIDAH_CATEGORIES);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [financeCategories, setFinanceCategories] = useState<FinanceCategory[]>([]);
  const [financeSummary, setFinanceSummary] = useState({ balance: 0, incomeThisMonth: 0, expenseThisMonth: 0 });
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const resetPrivateData = useCallback(() => {
    setCurrentUser(EMPTY_PROFILE);
    setProfiles([]);
    setBookings([]);
    setJobs([]);
    setAttendances([]);
    setAssignments([]);
    setQosidahs(QOSIDAH_LIST);
    setCategories(QOSIDAH_CATEGORIES);
    setFavorites([]);
    setRecentIds([]);
    setTransactions([]);
    setFinanceCategories([]);
    setFinanceSummary({ balance: 0, incomeThisMonth: 0, expenseThisMonth: 0 });
    setNotifications([]);
    setAuditLogs([]);
  }, []);

  const getProfileForUser = useCallback(async (user: User) => {
    const client = ensureClient(supabase);
    const { data, error } = await client.from('profiles').select('*').eq('auth_user_id', user.id).single();
    if (error || !data) throw new Error('Profil pengguna belum tersedia di database.');
    return normalizeProfile(data as Record<string, unknown>);
  }, [supabase]);

  const loadData = useCallback(async (profile: Profile) => {
    const client = ensureClient(supabase);
    if (profile.status !== 'active') return;

    // 1. Ambil Notifikasi via Server API (Bypass RLS shadowing bug + Auto heal fanout)
    const fetchNotifsPromise = fetch(`/api/notifications?userId=${profile.id}`)
      .then((res) => (res.ok ? res.json() : null))
      .catch(() => null);

    // 2. Ambil Bookings via Server API (Bisa diakses Pemain & Admin)
    const fetchBookingsPromise = fetch('/api/bookings/manage')
      .then((res) => (res.ok ? res.json() : null))
      .catch(() => null);

    // 3. Ambil Members via Server API (Bisa diakses Pemain & Admin untuk struktur tim & peran)
    const fetchMembersPromise = fetch('/api/members')
      .then((res) => (res.ok ? res.json() : null))
      .catch(() => null);

    // 4. Ambil Favorit Qosidah Personal dari Database via Server API
    const fetchFavsPromise = fetch('/api/qosidah/favorites')
      .then((res) => (res.ok ? res.json() : null))
      .catch(() => null);

    // 5. Query Supabase untuk jobs, attendance, assignments, favorites, recent, finance
    const [
      jobsResult,
      attendanceResult,
      assignmentsResult,
      favoritesResult,
      recentResult,
      summaryResult,
      apiNotifs,
      apiBookings,
      apiMembers,
      apiFavs,
    ] = await Promise.all([
      client.from('jobs').select('*').order('event_date', { ascending: true }),
      client.from('job_attendance').select('*').order('updated_at', { ascending: false }),
      client.from('job_assignments').select('*').order('created_at', { ascending: false }),
      client.from('qosidah_favorites').select('qosidah_id').eq('user_id', profile.id),
      client.from('qosidah_recent').select('qosidah_id,last_opened_at').eq('user_id', profile.id).order('last_opened_at', { ascending: false }).limit(8),
      client.rpc('get_finance_summary'),
      fetchNotifsPromise,
      fetchBookingsPromise,
      fetchMembersPromise,
      fetchFavsPromise,
    ]);

    // Set Jobs, Attendance, Assignments
    setJobs((jobsResult.data ?? []) as unknown as Job[]);
    setAttendances((attendanceResult.data ?? []) as unknown as JobAttendance[]);
    setAssignments((assignmentsResult.data ?? []) as unknown as JobAssignment[]);
    setFavorites(((favoritesResult.data ?? []) as Array<{ qosidah_id: string }>).map((item) => item.qosidah_id));
    setRecentIds(((recentResult.data ?? []) as Array<{ qosidah_id: string }>).map((item) => item.qosidah_id));

    // Set Qosidah & Kategori langsung dari kode
    setQosidahs(QOSIDAH_LIST);
    setCategories(QOSIDAH_CATEGORIES);

    // Set Favorit Personal dari database
    if (apiFavs?.favorites && Array.isArray(apiFavs.favorites)) {
      setFavorites(apiFavs.favorites);
    }

    // Set Bookings (Untuk Admin maupun Pemain)
    if (apiBookings?.bookings) {
      setBookings(apiBookings.bookings as Booking[]);
    } else if (profile.is_admin) {
      const { data: bData } = await client.from('bookings').select('*').order('created_at', { ascending: false });
      if (bData) setBookings(bData as Booking[]);
    }

    // Set Profiles / Anggota (Untuk Admin maupun Pemain)
    if (apiMembers?.profiles) {
      setProfiles((apiMembers.profiles as Array<Record<string, unknown>>).map(normalizeProfile));
    } else if (profile.is_admin) {
      const { data: pData } = await client.from('profiles').select('*').order('created_at', { ascending: false });
      if (pData) setProfiles((pData as Array<Record<string, unknown>>).map(normalizeProfile));
    }

    // Set Notifications & Badge Counter
    if (apiNotifs?.notifications) {
      setNotifications(apiNotifs.notifications as AppNotification[]);
    } else {
      // Fallback direct supabase query
      const { data: uNotifs } = await client
        .from('user_notifications')
        .select('is_read,notifications(id,title,message,type,target_type,target_id,target_url,created_at)')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (uNotifs) {
        type FallbackRow = { is_read: boolean; notifications: Omit<AppNotification, 'is_read'> | Array<Omit<AppNotification, 'is_read'>> };
        setNotifications((uNotifs as unknown as FallbackRow[]).flatMap((row) => {
          const n = Array.isArray(row.notifications) ? row.notifications[0] : row.notifications;
          return n ? [{ ...n, is_read: row.is_read }] : [];
        }));
      }
    }

    // Set Finance Summary
    const summary = ((summaryResult.data ?? []) as Array<{ balance: number | string; income_this_month: number | string; expense_this_month: number | string }>)[0];
    setFinanceSummary({
      balance: Number(summary?.balance ?? 0),
      incomeThisMonth: Number(summary?.income_this_month ?? 0),
      expenseThisMonth: Number(summary?.expense_this_month ?? 0),
    });

    // Admin Audit Logs
    if (profile.is_admin) {
      const { data: auditData } = await client
        .from('audit_logs')
        .select('*,profiles(name)')
        .order('created_at', { ascending: false })
        .limit(100);

      if (auditData) {
        type AuditRow = AuditLog & { profiles: { name: string } | null };
        setAuditLogs(
          (auditData as unknown as AuditRow[]).map((row) => ({
            id: row.id,
            user_id: row.user_id ?? '',
            user_name: row.profiles?.name ?? 'Sistem',
            action: row.action,
            entity_type: row.entity_type,
            entity_id: row.entity_id,
            description: row.description,
            created_at: row.created_at,
          }))
        );
      }
    }

    // Admin / Treasurer Finance Transactions
    if (profile.is_admin || profile.is_treasurer) {
      const [financeCategoriesResult, transactionsResult] = await Promise.all([
        client.from('finance_categories').select('*').eq('is_active', true).order('name'),
        client.from('finance_transactions').select('*').order('transaction_date', { ascending: false }),
      ]);
      if (!financeCategoriesResult.error && !transactionsResult.error) {
        const categoryList = (financeCategoriesResult.data ?? []) as unknown as FinanceCategory[];
        const financeCategoryNames = new Map(categoryList.map((item) => [item.id, item.name]));
        const jobNames = new Map(((jobsResult.data ?? []) as unknown as Job[]).map((item) => [item.id, item.title]));
        const rawTransactions = (transactionsResult.data ?? []) as unknown as FinanceTransaction[];
        const receiptPaths = rawTransactions.map((item) => item.attachment_url).filter((path): path is string => Boolean(path && !path.startsWith('http')));
        const signedUrls = new Map<string, string>();
        if (receiptPaths.length) {
          const { data: signedData } = await client.storage.from('finance-receipts').createSignedUrls(receiptPaths, 60 * 60);
          (signedData as Array<{ signedUrl?: string }> | null)?.forEach((item, index) => {
            if (item.signedUrl) signedUrls.set(receiptPaths[index], item.signedUrl);
          });
        }
        setFinanceCategories(categoryList);
        setTransactions(
          rawTransactions.map((item) => ({
            ...item,
            amount: Number(item.amount),
            category_name: financeCategoryNames.get(item.category_id) ?? 'Tanpa Kategori',
            job_title: item.job_id ? jobNames.get(item.job_id) : undefined,
            attachment_url: item.attachment_url ? signedUrls.get(item.attachment_url) ?? item.attachment_url : undefined,
          }))
        );
      }
    }
  }, [supabase]);

  const refreshData = useCallback(async () => {
    if (!supabase) {
      setIsLoading(false);
      setDataError('Supabase belum dikonfigurasi.');
      return null;
    }
    setIsLoading(true);
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        resetPrivateData();
        return null;
      }
      const profile = await getProfileForUser(user);
      setCurrentUser(profile);
      if (profile.status === 'active') await loadData(profile);
      setDataError('');
      return profile;
    } catch (error) {
      setDataError(getErrorMessage(error));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getProfileForUser, loadData, resetPrivateData, supabase]);

  useEffect(() => {
    const timer = window.setTimeout(() => void refreshData(), 0);
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((event: string) => {
      if (event === 'SIGNED_OUT') {
        resetPrivateData();
        setIsLoading(false);
      }
    });
    return () => {
      window.clearTimeout(timer);
      data.subscription.unsubscribe();
    };
  }, [refreshData, resetPrivateData, supabase]);

  // Realtime Subscriptions & Polling Sync
  useEffect(() => {
    if (!supabase || !currentUser.id) return;

    // 1. Channel Realtime Supabase
    const channel = supabase
      .channel(`khoirunnada-realtime-${currentUser.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => void loadData(currentUser))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => void loadData(currentUser))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => void loadData(currentUser))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'qosidah' }, () => void loadData(currentUser))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => void loadData(currentUser))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_notifications' }, () => void loadData(currentUser));

    channel.subscribe();

    // 2. Background Revalidation (Setiap 7 detik & saat tab aktif) agar sinkronisasi 100% instan
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        void loadData(currentUser);
      }
    }, 7000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void loadData(currentUser);
      }
    };
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      void supabase.removeChannel(channel);
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [currentUser, loadData, supabase]);

  const signInWithPassword = async (email: string, password: string, portal: PortalType) => {
    const client = ensureClient(supabase);
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Panggil API backend untuk verifikasi, sinkronisasi password Google, atau auto-register akun baru
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalizedEmail, password, portal }),
    });

    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(result.error || 'Email atau password tidak sesuai.');
    }

    // 2. Hubungkan session ke client Supabase agar cookie / localStorage tersimpan di browser
    try {
      await client.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
    } catch (e) {
      console.warn('Client signIn warning:', e);
    }

    // 3. Jika status masih pending (misal akun baru), arahkan ke /pending
    if (result.destination === '/pending' || result.status === 'pending') {
      return '/pending';
    }

    // 4. Muat data profil terbaru dan tentukan tujuan portal
    try {
      const { data: { user } } = await client.auth.getUser();
      if (user) {
        const profile = await getProfileForUser(user);
        setCurrentUser(profile);
        if (profile.status === 'active') await loadData(profile);
        return destinationFor(profile, portal);
      }
    } catch {
      // Fallback
    }

    return result.destination || (portal === 'admin' ? '/app/admin' : '/app');
  };

  const signInWithGoogle = async (portal: PortalType) => {
    const client = ensureClient(supabase);
    const redirectTo = `${window.location.origin}/auth/callback?portal=${portal}`;
    const { error } = await client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
    if (error) throw new Error('Login Google belum dapat dimulai.');
  };

  const logout = async () => {
    const client = ensureClient(supabase);
    await client.auth.signOut();
    resetPrivateData();
  };

  const createBooking: AppStoreContextType['createBooking'] = async (input) => {
    const response = await fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
    const result = (await response.json()) as { booking?: Booking; error?: string };
    if (!response.ok || !result.booking) throw new Error(result.error ?? 'Booking gagal disimpan.');
    await loadData(currentUser);
    return result.booking;
  };

  const updateBookingStatus = async (id: string, status: BookingStatus, adminNotes?: string) => {
    const res = await fetch('/api/bookings/manage', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, adminNotes }),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(result.error || 'Status booking gagal diperbarui.');
    setBookings((items) => items.map((item) => (item.id === id ? (result.booking as Booking) : item)));
  };

  const convertBookingToJob = async (bookingId: string, extraData?: Partial<Job>) => {
    const res = await fetch('/api/bookings/manage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId,
        gatherTime: extraData?.gather_time,
        mapsUrl: extraData?.maps_url,
        dressCode: extraData?.dress_code,
        transportInfo: extraData?.transport_info,
        notes: extraData?.notes,
        createdBy: currentUser.id,
      }),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok || !result.job) throw new Error(result.error || 'Booking gagal dikonversi.');
    await loadData(currentUser);
    return result.job as Job;
  };

  const createJob: AppStoreContextType['createJob'] = async (jobData) => {
    const client = ensureClient(supabase);
    const { data, error } = await client.from('jobs').insert({ ...jobData, created_by: currentUser.id }).select('*').single();
    if (error || !data) throw new Error(error?.message ?? 'Job gagal dibuat.');
    const job = data as unknown as Job;
    setJobs((items) => [job, ...items]);
    await loadData(currentUser);
    return job;
  };

  const updateJob = async (job: Job) => {
    const client = ensureClient(supabase);
    const { id, created_at: _createdAt, ...updates } = job;
    const { data, error } = await client.from('jobs').update(updates).eq('id', id).select('*').single();
    if (error) throw new Error(error.message);
    setJobs((items) => items.map((item) => item.id === id ? data as Job : item));
    await loadData(currentUser);
  };

  const setAttendance = async (jobId: string, status: AttendanceStatus, note?: string) => {
    const client = ensureClient(supabase);
    const { data, error } = await client.from('job_attendance').upsert({ job_id: jobId, user_id: currentUser.id, status, note: note ?? null }, { onConflict: 'job_id,user_id' }).select('*').single();
    if (error || !data) throw new Error(error?.message ?? 'Kehadiran gagal disimpan.');
    const attendance = data as unknown as JobAttendance;
    setAttendances((items) => [attendance, ...items.filter((item) => !(item.job_id === jobId && item.user_id === currentUser.id))]);
  };

  const assignMember = async (jobId: string, userId: string, roleName: string, notes?: string) => {
    const client = ensureClient(supabase);
    const { data, error } = await client.from('job_assignments').insert({ job_id: jobId, user_id: userId, role_name: roleName, notes: notes ?? null }).select('*').single();
    if (error || !data) throw new Error(error?.message ?? 'Penugasan gagal disimpan.');
    setAssignments((items) => [data as JobAssignment, ...items]);
  };

  const toggleFavorite = async (qosidahId: string) => {
    const isFav = favorites.includes(qosidahId);
    const updated = isFav ? favorites.filter((id) => id !== qosidahId) : [...favorites, qosidahId];
    setFavorites(updated);

    try {
      const res = await fetch('/api/qosidah/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qosidah_id: qosidahId }),
      });
      if (!res.ok) {
        console.warn('Sync favorite response status:', res.status);
      }
    } catch (err) {
      console.warn('Gagal sinkronisasi favorit ke database:', err);
    }
  };

  const markAsRecent = async (qosidahId: string) => {
    const client = ensureClient(supabase);
    const { error } = await client.from('qosidah_recent').upsert({ user_id: currentUser.id, qosidah_id: qosidahId, last_opened_at: new Date().toISOString() }, { onConflict: 'user_id,qosidah_id' });
    if (error) throw new Error(error.message);
    setRecentIds((items) => [qosidahId, ...items.filter((id) => id !== qosidahId)].slice(0, 8));
  };

  const createQosidah: AppStoreContextType['createQosidah'] = async (input) => {
    const res = await fetch('/api/qosidah', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...input, created_by: currentUser.id }),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok || !result.qosidah) throw new Error(result.error || 'Qosidah gagal disimpan.');
    const qosidah = {
      ...(result.qosidah as Qosidah),
      category_name: categories.find((item) => item.id === input.category_id)?.name || 'Sholawat',
    };
    setQosidahs((items) => [qosidah, ...items]);
    await loadData(currentUser);
    return qosidah;
  };

  const updateQosidah = async (qosidah: Qosidah) => {
    const res = await fetch('/api/qosidah', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(qosidah),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(result.error || 'Qosidah gagal diperbarui.');
    setQosidahs((items) => items.map((item) => (item.id === qosidah.id ? qosidah : item)));
    await loadData(currentUser);
  };

  const addTransaction: AppStoreContextType['addTransaction'] = async (transaction) => {
    const client = ensureClient(supabase);
    const { category_name: _categoryName, job_title: _jobTitle, ...databaseInput } = transaction;
    const { data, error } = await client.from('finance_transactions').insert({ ...databaseInput, attachment_url: databaseInput.attachment_url ?? null, created_by: currentUser.id }).select('*').single();
    if (error || !data) throw new Error(error?.message ?? 'Transaksi gagal disimpan.');
    const created: FinanceTransaction = { ...(data as unknown as FinanceTransaction), amount: Number(data.amount), category_name: transaction.category_name, job_title: transaction.job_title, attachment_url: transaction.attachment_url };
    setTransactions((items) => [created, ...items]);
    await loadData(currentUser);
    return created;
  };

  const uploadReceipt = async (file: File) => {
    const client = ensureClient(supabase);
    if (file.size > 5 * 1024 * 1024) throw new Error('Ukuran bukti maksimal 5 MB.');
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) throw new Error('Format bukti harus JPG, PNG, WebP, atau PDF.');
    const extension = file.name.split('.').pop()?.toLowerCase() || 'bin';
    const path = `${currentUser.id}/${crypto.randomUUID()}.${extension}`;
    const { error } = await client.storage.from('finance-receipts').upload(path, file, { cacheControl: '3600', upsert: false });
    if (error) throw new Error(error.message);
    return path;
  };

  const markNotificationAsRead = async (id: string) => {
    // 1. Optimistic update langsung agar badge di icon lonceng langsung hilang seketika
    setNotifications((items) => items.map((item) => (item.id === id ? { ...item, is_read: true } : item)));
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id, userId: currentUser.id }),
      });
    } catch (err) {
      console.error('Failed to sync notification read status to server:', err);
    }
  };

  const markAllNotificationsAsRead = async () => {
    // 1. Optimistic update: langsung bersihkan seluruh unread count
    setNotifications((items) => items.map((item) => ({ ...item, is_read: true })));
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true, userId: currentUser.id }),
      });
    } catch (err) {
      console.error('Failed to sync all notifications read status:', err);
    }
  };

  const sendAnnouncement = async (
    title: string,
    message: string,
    _targetType: 'all' | 'member' | 'treasurer' | 'admin' = 'all'
  ) => {
    // Selalu siarkan khusus untuk SEMUA ANGGOTA sesuai instruksi user
    const res = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        message,
        targetType: 'all',
        createdBy: currentUser.id,
      }),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(result.error || 'Pengumuman gagal disiarkan.');
    await loadData(currentUser);
  };

  const updateMember = async (id: string, updates: Record<string, unknown>) => {
    const res = await fetch('/api/members', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, updates }),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok || !result.profile) throw new Error(result.error || 'Profil anggota gagal diperbarui.');
    const profile = normalizeProfile(result.profile);
    setProfiles((items) => items.map((item) => (item.id === id ? profile : item)));
    if (id === currentUser.id) {
      setCurrentUser(profile);
    }
  };

  const approveMember = async (id: string) =>
    updateMember(id, {
      status: 'active',
      is_member: true,
      approved_at: new Date().toISOString(),
      approved_by: currentUser.id,
    });

  const rejectMember = async (id: string) => updateMember(id, { status: 'rejected' });

  const toggleMemberRole = async (id: string, roleKey: 'is_member' | 'is_treasurer' | 'is_admin') => {
    const member = profiles.find((profile) => profile.id === id);
    if (!member) throw new Error('Anggota tidak ditemukan.');
    await updateMember(id, { [roleKey]: !member[roleKey] });
  };

  const deactivateMember = async (id: string) => updateMember(id, { status: 'inactive' });

  const updateMemberRoleTitle = async (id: string, roleTitle: string) =>
    updateMember(id, { role_title: roleTitle.trim() });

  const updateAvatar = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    if (currentUser?.id) formData.append('id', currentUser.id);

    const query = currentUser?.id ? `?id=${encodeURIComponent(currentUser.id)}` : '';
    const res = await fetch(`/api/profile/avatar${query}`, {
      method: 'POST',
      body: formData,
    });

    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(result.error || 'Gagal mengunggah foto profil.');
    }

    const newUrl = result.avatarUrl;
    if (newUrl) {
      setCurrentUser((prev) => ({ ...prev, avatar_url: newUrl }));
      setProfiles((prev) =>
        prev.map((p) => (p.id === currentUser.id ? { ...p, avatar_url: newUrl } : p))
      );
      await loadData({ ...currentUser, avatar_url: newUrl });
    }
    return newUrl;
  };

  const removeAvatar = async () => {
    const res = await fetch('/api/profile/avatar', {
      method: 'DELETE',
    });

    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(result.error || 'Gagal menghapus foto profil.');
    }

    const defaultUrl = result.avatarUrl || '/logo-khoirunnada-192.png';
    setCurrentUser((prev) => ({ ...prev, avatar_url: defaultUrl }));
    setProfiles((prev) =>
      prev.map((p) => (p.id === currentUser.id ? { ...p, avatar_url: defaultUrl } : p))
    );
    await loadData({ ...currentUser, avatar_url: defaultUrl });
    return defaultUrl;
  };

  const updateUsername = async (name: string) => {
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, id: currentUser.id }),
    });

    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(result.error || 'Gagal memperbarui username.');
    }

    const newName = (result.name as string) || name.trim();
    setCurrentUser((prev) => ({ ...prev, name: newName }));
    setProfiles((prev) =>
      prev.map((p) => (p.id === currentUser.id ? { ...p, name: newName } : p))
    );
    await loadData({ ...currentUser, name: newName });
    return newName;
  };

  const unreadNotificationCount = notifications.filter((item) => !item.is_read).length;

  return (
    <AppStoreContext.Provider
      value={{
        isLoading,
        isConfigured: configured,
        dataError,
        currentUser,
        profiles,
        signInWithPassword,
        signInWithGoogle,
        logout,
        refreshData,
        bookings,
        createBooking,
        updateBookingStatus,
        convertBookingToJob,
        jobs,
        attendances,
        assignments,
        createJob,
        updateJob,
        setAttendance,
        assignMember,
        qosidahs,
        categories,
        favorites,
        recentIds,
        toggleFavorite,
        markAsRecent,
        createQosidah,
        updateQosidah,
        transactions,
        financeCategories,
        addTransaction,
        uploadReceipt,
        balance: financeSummary.balance,
        incomeThisMonth: financeSummary.incomeThisMonth,
        expenseThisMonth: financeSummary.expenseThisMonth,
        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        sendAnnouncement,
        approveMember,
        rejectMember,
        toggleMemberRole,
        deactivateMember,
        updateMemberRoleTitle,
        updateAvatar,
        removeAvatar,
        updateUsername,
        auditLogs,
      }}
    >
      {children}
    </AppStoreContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppStoreContext);
  if (!context) throw new Error('useAppStore must be used within an AppStoreProvider');
  return context;
}
