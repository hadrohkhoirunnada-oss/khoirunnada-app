'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
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
  sendAnnouncement: (title: string, message: string, targetType: 'all' | 'member' | 'treasurer' | 'admin') => Promise<void>;
  approveMember: (id: string) => Promise<void>;
  rejectMember: (id: string) => Promise<void>;
  toggleMemberRole: (id: string, roleKey: 'is_member' | 'is_treasurer' | 'is_admin') => Promise<void>;
  deactivateMember: (id: string) => Promise<void>;
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
  if (profile.status !== 'active') throw new Error('Akun ini sedang tidak aktif.');
  if (portal === 'admin') {
    if (!profile.is_admin && !profile.is_treasurer) {
      throw new Error('Akun ini tidak memiliki izin Admin atau Bendahara.');
    }
    return profile.is_admin ? '/app/admin' : '/app/admin/finance';
  }
  if ((profile.is_admin || profile.is_treasurer) && !profile.is_member) {
    throw new Error('Akun khusus pengurus hanya dapat masuk melalui tab Admin & Kas.');
  }
  if (!profile.is_member) throw new Error('Akun ini belum memiliki izin sebagai pemain.');
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
  const [qosidahs, setQosidahs] = useState<Qosidah[]>([]);
  const [categories, setCategories] = useState<QosidahCategory[]>([]);
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
    setQosidahs([]);
    setCategories([]);
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

    const [jobsResult, attendanceResult, assignmentsResult, categoriesResult, qosidahResult, favoritesResult, recentResult, notificationsResult, summaryResult] = await Promise.all([
      client.from('jobs').select('*').order('event_date', { ascending: true }),
      client.from('job_attendance').select('*').order('updated_at', { ascending: false }),
      client.from('job_assignments').select('*').order('created_at', { ascending: false }),
      client.from('qosidah_categories').select('*').order('sort_order'),
      client.from('qosidah').select('*').order('sort_order'),
      client.from('qosidah_favorites').select('qosidah_id').eq('user_id', profile.id),
      client.from('qosidah_recent').select('qosidah_id,last_opened_at').eq('user_id', profile.id).order('last_opened_at', { ascending: false }).limit(8),
      client.from('user_notifications').select('is_read,notifications!inner(id,title,message,type,target_type,target_id,target_url,created_at)').eq('user_id', profile.id).order('created_at', { ascending: false }),
      client.rpc('get_finance_summary'),
    ]);

    const firstError = [jobsResult, attendanceResult, assignmentsResult, categoriesResult, qosidahResult, favoritesResult, recentResult, notificationsResult, summaryResult].find((result) => result.error)?.error;
    if (firstError) throw new Error(firstError.message);

    const categoryRows = (categoriesResult.data ?? []) as unknown as QosidahCategory[];
    const categoryNames = new Map(categoryRows.map((item) => [item.id, item.name]));
    setCategories(categoryRows);
    setJobs((jobsResult.data ?? []) as unknown as Job[]);
    setAttendances((attendanceResult.data ?? []) as unknown as JobAttendance[]);
    setAssignments((assignmentsResult.data ?? []) as unknown as JobAssignment[]);
    setQosidahs(((qosidahResult.data ?? []) as unknown as Qosidah[]).map((item) => ({ ...item, tags: item.tags ?? [], category_name: categoryNames.get(item.category_id) })));
    setFavorites(((favoritesResult.data ?? []) as Array<{ qosidah_id: string }>).map((item) => item.qosidah_id));
    setRecentIds(((recentResult.data ?? []) as Array<{ qosidah_id: string }>).map((item) => item.qosidah_id));

    type NotificationRow = { is_read: boolean; notifications: Omit<AppNotification, 'is_read'> | Array<Omit<AppNotification, 'is_read'>> };
    const notificationRows = (notificationsResult.data ?? []) as unknown as NotificationRow[];
    setNotifications(notificationRows.flatMap((row) => {
      const notification = Array.isArray(row.notifications) ? row.notifications[0] : row.notifications;
      return notification ? [{ ...notification, is_read: row.is_read }] : [];
    }));

    const summary = ((summaryResult.data ?? []) as Array<{ balance: number | string; income_this_month: number | string; expense_this_month: number | string }>)[0];
    setFinanceSummary({ balance: Number(summary?.balance ?? 0), incomeThisMonth: Number(summary?.income_this_month ?? 0), expenseThisMonth: Number(summary?.expense_this_month ?? 0) });

    if (profile.is_admin) {
      const [profilesResult, bookingsResult, auditResult] = await Promise.all([
        client.from('profiles').select('*').order('created_at', { ascending: false }),
        client.from('bookings').select('*').order('created_at', { ascending: false }),
        client.from('audit_logs').select('*,profiles(name)').order('created_at', { ascending: false }).limit(100),
      ]);
      const adminError = [profilesResult, bookingsResult, auditResult].find((result) => result.error)?.error;
      if (adminError) throw new Error(adminError.message);
      setProfiles(((profilesResult.data ?? []) as Array<Record<string, unknown>>).map(normalizeProfile));
      setBookings((bookingsResult.data ?? []) as unknown as Booking[]);
      type AuditRow = AuditLog & { profiles: { name: string } | null };
      setAuditLogs(((auditResult.data ?? []) as unknown as AuditRow[]).map((row) => ({ id: row.id, user_id: row.user_id ?? '', user_name: row.profiles?.name ?? 'Sistem', action: row.action, entity_type: row.entity_type, entity_id: row.entity_id, description: row.description, created_at: row.created_at })));
    } else {
      setProfiles([]);
      setBookings([]);
      setAuditLogs([]);
    }

    if (profile.is_admin || profile.is_treasurer) {
      const [financeCategoriesResult, transactionsResult] = await Promise.all([
        client.from('finance_categories').select('*').eq('is_active', true).order('name'),
        client.from('finance_transactions').select('*').order('transaction_date', { ascending: false }),
      ]);
      if (financeCategoriesResult.error) throw new Error(financeCategoriesResult.error.message);
      if (transactionsResult.error) throw new Error(transactionsResult.error.message);
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
      setTransactions(rawTransactions.map((item) => ({ ...item, amount: Number(item.amount), category_name: financeCategoryNames.get(item.category_id) ?? 'Tanpa Kategori', job_title: item.job_id ? jobNames.get(item.job_id) : undefined, attachment_url: item.attachment_url ? signedUrls.get(item.attachment_url) ?? item.attachment_url : undefined })));
    } else {
      setFinanceCategories([]);
      setTransactions([]);
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

  useEffect(() => {
    if (!supabase || !currentUser.id) return;
    const channel = supabase.channel(`khoirunnada-${currentUser.id}`).on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${currentUser.id}` }, () => void refreshData());
    if (currentUser.status === 'active') {
      channel
        .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => void loadData(currentUser))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'user_notifications', filter: `user_id=eq.${currentUser.id}` }, () => void loadData(currentUser));
      if (currentUser.is_admin) channel.on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => void loadData(currentUser));
    }
    channel.subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [currentUser, loadData, refreshData, supabase]);

  const signInWithPassword = async (email: string, password: string, portal: PortalType) => {
    const client = ensureClient(supabase);
    const { data, error } = await client.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error || !data.user) throw new Error('Email atau password tidak sesuai.');
    try {
      const profile = await getProfileForUser(data.user);
      const destination = destinationFor(profile, portal);
      setCurrentUser(profile);
      if (profile.status === 'active') await loadData(profile);
      return destination;
    } catch (error) {
      await client.auth.signOut();
      throw error;
    }
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
    return result.booking;
  };

  const updateBookingStatus = async (id: string, status: BookingStatus, adminNotes?: string) => {
    const client = ensureClient(supabase);
    const { data, error } = await client.from('bookings').update({ status, admin_notes: adminNotes ?? null }).eq('id', id).select('*').single();
    if (error) throw new Error(error.message);
    setBookings((items) => items.map((item) => item.id === id ? data as Booking : item));
  };

  const convertBookingToJob = async (bookingId: string, extraData?: Partial<Job>) => {
    const client = ensureClient(supabase);
    const { data, error } = await client.rpc('convert_booking_to_job', { booking_uuid: bookingId, gather_time_value: extraData?.gather_time ?? '18:30 WITA', maps_url_value: extraData?.maps_url ?? null, dress_code_value: extraData?.dress_code ?? 'Gamis Putih, Jas Hitam Khoirunnada', transport_info_value: extraData?.transport_info ?? 'Kumpul bersama di Markaz Khoirunnada', notes_value: extraData?.notes ?? null });
    if (error || !data) throw new Error(error?.message ?? 'Booking gagal dikonversi.');
    await loadData(currentUser);
    return data as unknown as Job;
  };

  const createJob: AppStoreContextType['createJob'] = async (jobData) => {
    const client = ensureClient(supabase);
    const { data, error } = await client.from('jobs').insert({ ...jobData, created_by: currentUser.id }).select('*').single();
    if (error || !data) throw new Error(error?.message ?? 'Job gagal dibuat.');
    const job = data as unknown as Job;
    setJobs((items) => [job, ...items]);
    return job;
  };

  const updateJob = async (job: Job) => {
    const client = ensureClient(supabase);
    const { id, created_at: _createdAt, ...updates } = job;
    const { data, error } = await client.from('jobs').update(updates).eq('id', id).select('*').single();
    if (error) throw new Error(error.message);
    setJobs((items) => items.map((item) => item.id === id ? data as Job : item));
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
    const client = ensureClient(supabase);
    if (favorites.includes(qosidahId)) {
      const { error } = await client.from('qosidah_favorites').delete().eq('user_id', currentUser.id).eq('qosidah_id', qosidahId);
      if (error) throw new Error(error.message);
      setFavorites((items) => items.filter((id) => id !== qosidahId));
    } else {
      const { error } = await client.from('qosidah_favorites').insert({ user_id: currentUser.id, qosidah_id: qosidahId });
      if (error) throw new Error(error.message);
      setFavorites((items) => [...items, qosidahId]);
    }
  };

  const markAsRecent = async (qosidahId: string) => {
    const client = ensureClient(supabase);
    const { error } = await client.from('qosidah_recent').upsert({ user_id: currentUser.id, qosidah_id: qosidahId, last_opened_at: new Date().toISOString() }, { onConflict: 'user_id,qosidah_id' });
    if (error) throw new Error(error.message);
    setRecentIds((items) => [qosidahId, ...items.filter((id) => id !== qosidahId)].slice(0, 8));
  };

  const createQosidah: AppStoreContextType['createQosidah'] = async (input) => {
    const client = ensureClient(supabase);
    const { category_name: _categoryName, ...databaseInput } = input;
    const { data, error } = await client.from('qosidah').insert({ ...databaseInput, is_active: true, created_by: currentUser.id }).select('*').single();
    if (error || !data) throw new Error(error?.message ?? 'Qosidah gagal disimpan.');
    const qosidah = { ...(data as unknown as Qosidah), category_name: categories.find((item) => item.id === input.category_id)?.name };
    setQosidahs((items) => [qosidah, ...items]);
    return qosidah;
  };

  const updateQosidah = async (qosidah: Qosidah) => {
    const client = ensureClient(supabase);
    const { id, category_name: _categoryName, created_at: _createdAt, ...updates } = qosidah;
    const { data, error } = await client.from('qosidah').update(updates).eq('id', id).select('*').single();
    if (error) throw new Error(error.message);
    setQosidahs((items) => items.map((item) => item.id === id ? { ...(data as Qosidah), category_name: qosidah.category_name } : item));
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
    const client = ensureClient(supabase);
    const { error } = await client.from('user_notifications').update({ is_read: true, read_at: new Date().toISOString() }).eq('notification_id', id).eq('user_id', currentUser.id);
    if (error) throw new Error(error.message);
    setNotifications((items) => items.map((item) => item.id === id ? { ...item, is_read: true } : item));
  };

  const markAllNotificationsAsRead = async () => {
    const client = ensureClient(supabase);
    const { error } = await client.from('user_notifications').update({ is_read: true, read_at: new Date().toISOString() }).eq('user_id', currentUser.id).eq('is_read', false);
    if (error) throw new Error(error.message);
    setNotifications((items) => items.map((item) => ({ ...item, is_read: true })));
  };

  const sendAnnouncement = async (title: string, message: string, targetType: 'all' | 'member' | 'treasurer' | 'admin') => {
    const client = ensureClient(supabase);
    const { error } = await client.from('notifications').insert({ title, message, type: 'announcement', target_type: targetType, target_url: '/app', created_by: currentUser.id });
    if (error) throw new Error(error.message);
    await loadData(currentUser);
  };

  const updateMember = async (id: string, updates: Record<string, unknown>) => {
    const client = ensureClient(supabase);
    const { data, error } = await client.from('profiles').update(updates).eq('id', id).select('*').single();
    if (error || !data) throw new Error(error?.message ?? 'Profil anggota gagal diperbarui.');
    const profile = normalizeProfile(data as Record<string, unknown>);
    setProfiles((items) => items.map((item) => item.id === id ? profile : item));
  };

  const approveMember = async (id: string) => updateMember(id, { status: 'active', is_member: true, approved_at: new Date().toISOString(), approved_by: currentUser.id });
  const rejectMember = async (id: string) => updateMember(id, { status: 'rejected' });
  const toggleMemberRole = async (id: string, roleKey: 'is_member' | 'is_treasurer' | 'is_admin') => {
    const member = profiles.find((profile) => profile.id === id);
    if (!member) throw new Error('Anggota tidak ditemukan.');
    await updateMember(id, { [roleKey]: !member[roleKey] });
  };
  const deactivateMember = async (id: string) => updateMember(id, { status: 'inactive' });
  const unreadNotificationCount = notifications.filter((item) => !item.is_read).length;

  return (
    <AppStoreContext.Provider value={{ isLoading, isConfigured: configured, dataError, currentUser, profiles, signInWithPassword, signInWithGoogle, logout, refreshData, bookings, createBooking, updateBookingStatus, convertBookingToJob, jobs, attendances, assignments, createJob, updateJob, setAttendance, assignMember, qosidahs, categories, favorites, recentIds, toggleFavorite, markAsRecent, createQosidah, updateQosidah, transactions, financeCategories, addTransaction, uploadReceipt, balance: financeSummary.balance, incomeThisMonth: financeSummary.incomeThisMonth, expenseThisMonth: financeSummary.expenseThisMonth, notifications, unreadNotificationCount, markNotificationAsRead, markAllNotificationsAsRead, sendAnnouncement, approveMember, rejectMember, toggleMemberRole, deactivateMember, auditLogs }}>
      {children}
    </AppStoreContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppStoreContext);
  if (!context) throw new Error('useAppStore must be used within an AppStoreProvider');
  return context;
}
