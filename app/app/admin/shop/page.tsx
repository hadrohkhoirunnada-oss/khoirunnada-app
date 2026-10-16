'use client';

import { useState } from 'react';
import {
  ShoppingBag,
  CreditCard,
  Shirt,
  Music,
  BookOpen,
  ShieldCheck,
  ExternalLink,
  AlertCircle,
  LoaderCircle,
  Info,
  RotateCcw,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { MobileAppShell } from '@/components/layout/MobileAppShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassModal } from '@/components/ui/GlassModal';
import { useAppStore } from '@/lib/store';

interface ShopProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  badge?: string;
  iconType: 'coins' | 'infaq' | 'apparel' | 'book';
}

const PRODUCTS: ShopProduct[] = [
  {
    id: 'prod-donasi-500',
    name: 'Donasi Kas Majelis (Uji Coba Rp 500)',
    category: 'Uji Coba Mikro',
    price: 500,
    description:
      'Nominal Rp 500 untuk simulasi transaksi instan QRIS dan e-wallet tanpa biaya besar.',
    badge: 'Uji Coba Rp 500',
    iconType: 'coins',
  },
  {
    id: 'prod-infaq-1000',
    name: 'Infaq Digital Sholawat (Uji Coba Rp 1.000)',
    category: 'Uji Coba Mikro',
    price: 1000,
    description:
      'Simulasi transaksi Rp 1.000 untuk pengujian pembayaran via Virtual Account Bank dan QRIS.',
    badge: 'Rp 1.000',
    iconType: 'infaq',
  },
  {
    id: 'prod-sample-2000',
    name: 'Sample Atribut Hadroh (Uji Coba Rp 2.000)',
    category: 'Busana & Atribut',
    price: 2000,
    description:
      'Sample pesanan atribut majelis dengan nominal terjangkau Rp 2.000 untuk pengetesan.',
    badge: 'Rp 2.000',
    iconType: 'apparel',
  },
  {
    id: 'prod-kitab-5000',
    name: 'E-Book Syair Qosidah (Uji Coba Rp 5.000)',
    category: 'Buku & Syair',
    price: 5000,
    description:
      'Simulasi lisensi digital kompilasi syair qosidah dengan nominal uji coba Rp 5.000.',
    badge: 'Rp 5.000',
    iconType: 'book',
  },
];

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ShopTestingPage() {
  const { currentUser } = useAppStore();

  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(null);
  const [customPrice, setCustomPrice] = useState<number>(500);
  const [customerName, setCustomerName] = useState(currentUser?.name || 'Admin Hadroh');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || 'admin@khoirunnada.org');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '081234567890');

  const [isLoading, setIsLoading] = useState(false);
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Status Pembayaran State
  const [checkoutResult, setCheckoutResult] = useState<{
    orderId: string;
    paymentId?: string;
    checkoutUrl: string;
    amount: number;
  } | null>(null);

  const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'PAID'>('PENDING');
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<{
    type: 'success' | 'warning' | 'info';
    text: string;
  } | null>(null);

  const handleOpenCheckout = (product: ShopProduct) => {
    setSelectedProduct(product);
    setCustomPrice(product.price);
    setErrorMessage(null);
    setCheckoutResult(null);
    setPaymentStatus('PENDING');
    setStatusFeedback(null);
    setIsIframeLoading(true);
    if (currentUser?.name) setCustomerName(currentUser.name);
    if (currentUser?.email) setCustomerEmail(currentUser.email);
    if (currentUser?.phone) setCustomerPhone(currentUser.phone);
  };

  const handleCloseModal = () => {
    if (isLoading) return;
    setSelectedProduct(null);
    setErrorMessage(null);
    setCheckoutResult(null);
    setPaymentStatus('PENDING');
    setStatusFeedback(null);
    setIsIframeLoading(true);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || isLoading) return;

    const finalAmount = Math.max(100, customPrice || selectedProduct.price);

    setIsLoading(true);
    setErrorMessage(null);
    setIsIframeLoading(true);
    setPaymentStatus('PENDING');
    setStatusFeedback(null);

    const generatedOrderId = `ORDER-${Date.now().toString().slice(-6)}`;

    try {
      const response = await fetch('/api/shop/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: generatedOrderId,
          description: selectedProduct.name,
          amount_idr: finalAmount,
          items: [
            {
              description: selectedProduct.name,
              quantity: 1,
              unit_price_idr: finalAmount,
            },
          ],
          customer: {
            name: customerName.trim() || 'Admin Khoirunnada',
            email: customerEmail.trim() || 'admin@khoirunnada.org',
            mobile: customerPhone.trim() || '081234567890',
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Gagal memproses pembayaran melalui gateway.');
      }

      const checkoutUrl = data.checkout_url || data.data?.checkout_url;

      if (!checkoutUrl) {
        throw new Error('Gateway tidak mengembalikan URL pembayaran (checkout_url).');
      }

      setCheckoutResult({
        orderId: data.order_id || generatedOrderId,
        paymentId: data.payment_id || data.data?.payment_id || data.data?.id,
        checkoutUrl,
        amount: finalAmount,
      });
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Terjadi kendala saat menghubungi Payment Gateway.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!checkoutResult || isCheckingStatus) return;

    setIsCheckingStatus(true);
    setStatusFeedback(null);

    try {
      const response = await fetch('/api/shop/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_id: checkoutResult.paymentId,
          order_id: checkoutResult.orderId,
        }),
      });

      const data = await response.json();

      if (data.is_paid || data.status === 'PAID') {
        setPaymentStatus('PAID');
        setStatusFeedback({
          type: 'success',
          text: 'Alhamdulillah! Pembayaran berhasil diverifikasi dan status dinyatakan SUDAH TERBAYAR.',
        });
      } else {
        setPaymentStatus('PENDING');
        setStatusFeedback({
          type: 'warning',
          text: 'Status saat ini masih MENUNGGU PEMBAYARAN. Silakan selesaikan pembayaran di atas, lalu cek kembali.',
        });
      }
    } catch {
      setStatusFeedback({
        type: 'info',
        text: 'Sedang menunggu sinkronisasi dengan Mayar. Coba klik cek status beberapa saat lagi.',
      });
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const renderIcon = (type: ShopProduct['iconType']) => {
    switch (type) {
      case 'coins':
        return <Sparkles className="w-5 h-5 text-[#70490E]" />;
      case 'infaq':
        return <CreditCard className="w-5 h-5 text-[#70490E]" />;
      case 'apparel':
        return <Shirt className="w-5 h-5 text-[#70490E]" />;
      case 'book':
        return <BookOpen className="w-5 h-5 text-[#70490E]" />;
      default:
        return <ShoppingBag className="w-5 h-5 text-[#70490E]" />;
    }
  };

  return (
    <MobileAppShell
      title="Shop (Testing)"
      subtitle="Eksperimen Payment Gateway"
      showBack
      backHref="/app/admin"
    >
      <div className="space-y-4 pb-8">
        {/* Banner Percobaan & Simulasi */}
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-[#F5EBD7]/80 to-amber-500/10 p-3.5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-[#70490E] flex items-center justify-center shrink-0 mt-0.5">
              <Info className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <div className="flex items-center gap-1.5 font-bold text-[#151917]">
                <span>Modul Uji Coba Mikro Transaksi</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-[#70490E]">
                  Mulai Rp 500
                </span>
              </div>
              <p className="text-[11px] text-[#585145] mt-1 leading-relaxed">
                Nominal pengujian disesuaikan mulai Rp 500. Kamu dapat langsung memilih metode QRIS / e-wallet di dalam popup dan mengecek status pembayaran secara realtime.
              </p>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between px-1 pt-1">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#585145]">
              Katalog Uji Coba Nominal Kecil
            </h3>
            <p className="text-[10px] text-[#70490E] mt-0.5 font-medium">
              Pilih item untuk mencoba transaksi dan verifikasi status
            </p>
          </div>
          <span className="text-[10px] font-bold text-[#70490E] bg-[#B58228]/15 px-2.5 py-1 rounded-full border border-[#B58228]/30">
            {PRODUCTS.length} Item
          </span>
        </div>

        {/* Grid Produk */}
        <div className="grid grid-cols-1 gap-3">
          {PRODUCTS.map((product) => (
            <GlassCard
              key={product.id}
              className="p-4 rounded-2xl !bg-[#FFFFFF]/95 !border-[#B58228]/25 hover:!border-[#B58228]/50 transition-all shadow-[0_4px_18px_rgba(112,73,14,0.05)]"
              variant="elevated"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F5EBD7] to-[#EBD5B3] border border-[#B58228]/30 flex items-center justify-center shrink-0 shadow-inner">
                  {renderIcon(product.iconType)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] font-bold text-[#996A19] uppercase tracking-wider">
                      {product.category}
                    </span>
                    {product.badge && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#B58228]/15 text-[#70490E] border border-[#B58228]/25 shrink-0">
                        {product.badge}
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-[#151917] mt-0.5 leading-snug">
                    {product.name}
                  </h4>

                  <p className="text-[11px] text-[#585145] mt-1 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>

                  <div className="mt-3.5 pt-3 border-t border-[#B58228]/15 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-[#585145] font-medium">Nominal Uji Coba</p>
                      <p className="text-sm font-extrabold text-[#70490E]">
                        {formatRupiah(product.price)}
                      </p>
                    </div>

                    <GlassButton
                      type="button"
                      variant="primary"
                      onClick={() => handleOpenCheckout(product)}
                      className="!py-1.5 !px-3.5 text-xs font-bold"
                    >
                      Beli / Donasi
                    </GlassButton>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Informasi Keamanan */}
        <div className="p-3 rounded-2xl bg-white/70 border border-black/5 flex items-center gap-2.5 text-[11px] text-[#585145]">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Transaksi terenkripsi aman didukung oleh Nexarin Payment Server & Mayar.</span>
        </div>
      </div>

      {/* Modal / Bottom Sheet Pembayaran Langsung */}
      <GlassModal
        isOpen={Boolean(selectedProduct)}
        onClose={handleCloseModal}
        maxWidth={checkoutResult ? 'lg' : 'md'}
        title={
          checkoutResult
            ? paymentStatus === 'PAID'
              ? 'Pembayaran Berhasil!'
              : 'Gerbang Pembayaran Mayar'
            : 'Konfirmasi Pesanan'
        }
        subtitle={
          checkoutResult
            ? `Nomor Pesanan: ${checkoutResult.orderId}`
            : 'Detail item & informasi pelanggan'
        }
      >
        {selectedProduct && (
          <div className="space-y-3">
            {checkoutResult ? (
              /* State Pembayaran: Render Langsung di Iframe Popup + Status Bar */
              <div className="space-y-3">
                {/* Panel Status Pembayaran Aktif */}
                {paymentStatus === 'PAID' ? (
                  <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-950 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                          Status Transaksi
                        </span>
                        <h4 className="text-base font-extrabold text-emerald-900 leading-tight">
                          SUDAH TERBAYAR (LUNAS)
                        </h4>
                      </div>
                    </div>
                    <p className="text-xs text-emerald-900/80 leading-relaxed pt-1 border-t border-emerald-500/20">
                      Alhamdulillah! Pembayaran sebesar{' '}
                      <span className="font-bold text-emerald-950">
                        {formatRupiah(checkoutResult.amount)}
                      </span>{' '}
                      telah berhasil diterima dan diverifikasi oleh sistem Mayar ID.
                    </p>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-600" />
                        </span>
                        <span className="text-xs font-bold text-amber-950">
                          Status: Menunggu Pembayaran
                        </span>
                      </div>
                      <span className="text-[10px] font-extrabold text-[#70490E] bg-white/80 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                        {formatRupiah(checkoutResult.amount)}
                      </span>
                    </div>

                    <p className="text-[11px] text-amber-900/80 leading-relaxed">
                      Selesaikan pembayaran melalui QRIS / Virtual Account pada tampilan di bawah, lalu klik tombol <b>Cek Status Pembayaran</b>.
                    </p>

                    {statusFeedback && (
                      <div
                        className={`p-2.5 rounded-xl text-xs flex items-start gap-2 ${
                          statusFeedback.type === 'success'
                            ? 'bg-emerald-500/20 text-emerald-900'
                            : statusFeedback.type === 'warning'
                            ? 'bg-amber-500/20 text-amber-950'
                            : 'bg-blue-500/15 text-blue-950'
                        }`}
                      >
                        {statusFeedback.type === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        )}
                        <span>{statusFeedback.text}</span>
                      </div>
                    )}

                    {/* Tombol Cek Status */}
                    <div className="pt-1">
                      <GlassButton
                        type="button"
                        variant="primary"
                        fullWidth
                        isLoading={isCheckingStatus}
                        onClick={handleCheckStatus}
                        icon={!isCheckingStatus ? <RotateCcw className="w-4 h-4" /> : undefined}
                        className="!py-2 text-xs font-bold shadow-md"
                      >
                        {isCheckingStatus ? 'Memeriksa ke Mayar...' : 'Cek Status Pembayaran'}
                      </GlassButton>
                    </div>
                  </div>
                )}

                {/* Wadah Iframe Mayar Langsung di Dalam Popup (Sembunyikan jika sudah lunas) */}
                {paymentStatus !== 'PAID' && (
                  <div className="relative w-full h-[500px] sm:h-[560px] rounded-2xl overflow-hidden border border-[#B58228]/25 bg-white shadow-inner">
                    {isIframeLoading && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F8F6F0]/90 backdrop-blur-sm z-10 text-xs text-[#585145] gap-2">
                        <LoaderCircle className="w-6 h-6 animate-spin text-[#996A19]" />
                        <span className="font-medium">Memuat antarmuka pembayaran Mayar...</span>
                      </div>
                    )}

                    <iframe
                      src={checkoutResult.checkoutUrl}
                      title="Invoice Pembayaran Mayar"
                      className="w-full h-full border-0 rounded-2xl"
                      allow="payment; camera"
                      onLoad={() => setIsIframeLoading(false)}
                    />
                  </div>
                )}

                {/* Tombol Aksi Bawah Modal */}
                <div className="flex items-center justify-between pt-1">
                  {paymentStatus !== 'PAID' && (
                    <a
                      href={checkoutResult.checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#585145] hover:text-[#151917]"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Buka di Tab Baru</span>
                    </a>
                  )}

                  <GlassButton
                    type="button"
                    variant={paymentStatus === 'PAID' ? 'primary' : 'ghost'}
                    onClick={handleCloseModal}
                    className="!py-1.5 !px-4 text-xs font-bold ml-auto"
                  >
                    {paymentStatus === 'PAID' ? 'Selesai & Tutup' : 'Tutup Popup'}
                  </GlassButton>
                </div>
              </div>
            ) : (
              /* State Form Pesanan Sebelum Buat Invoice */
              <form onSubmit={handleSubmitPayment} className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-[#F8F6F0] border border-[#B58228]/20 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <p className="text-[10px] font-bold text-[#996A19] uppercase tracking-wider">
                      {selectedProduct.category}
                    </p>
                    <h5 className="text-xs font-bold text-[#151917] truncate">
                      {selectedProduct.name}
                    </h5>
                  </div>
                  <span className="text-sm font-extrabold text-[#70490E] shrink-0">
                    {formatRupiah(customPrice)}
                  </span>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-2 text-xs text-red-800">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#151917] mb-1">
                      Nominal Uji Coba (Bisa diedit ke Rp 500)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={100}
                        step={100}
                        required
                        value={customPrice}
                        onChange={(e) => setCustomPrice(Number(e.target.value) || 500)}
                        className="glass-input !bg-white/90 !text-xs !py-2.5 !border-[#B58228]/25 font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => setCustomPrice(500)}
                        className="px-3 py-1 rounded-xl text-xs font-bold bg-[#B58228]/15 text-[#70490E] border border-[#B58228]/30 hover:bg-[#B58228]/25 shrink-0"
                      >
                        Rp 500
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#151917] mb-1">
                      Nama Pembeli
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Nama lengkap"
                      className="glass-input !bg-white/90 !text-xs !py-2.5 !border-[#B58228]/25"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#151917] mb-1">
                      Email Pembeli
                    </label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="glass-input !bg-white/90 !text-xs !py-2.5 !border-[#B58228]/25"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#151917] mb-1">
                      Nomor WhatsApp
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="081234567890"
                      className="glass-input !bg-white/90 !text-xs !py-2.5 !border-[#B58228]/25"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-[#B58228]/15 space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#585145]">
                    <span>Nominal Pembayaran</span>
                    <span className="font-bold text-[#70490E]">{formatRupiah(customPrice)}</span>
                  </div>
                  <div className="flex justify-between text-[#585145]">
                    <span>Biaya Layanan Gateway</span>
                    <span className="text-emerald-700 font-semibold">Gratis</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#151917] pt-1 border-t border-black/5 text-sm">
                    <span>Total Tagihan</span>
                    <span className="text-[#70490E] font-extrabold">
                      {formatRupiah(customPrice)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <GlassButton
                    type="button"
                    variant="ghost"
                    fullWidth
                    disabled={isLoading}
                    onClick={handleCloseModal}
                  >
                    Batal
                  </GlassButton>

                  <GlassButton
                    type="submit"
                    variant="primary"
                    fullWidth
                    isLoading={isLoading}
                    icon={!isLoading ? <CreditCard className="w-4 h-4" /> : undefined}
                  >
                    Bayar Sekarang
                  </GlassButton>
                </div>
              </form>
            )}
          </div>
        )}
      </GlassModal>
    </MobileAppShell>
  );
}
