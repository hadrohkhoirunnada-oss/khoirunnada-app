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
  iconType: 'apparel' | 'instrument' | 'book' | 'subscription';
}

const PRODUCTS: ShopProduct[] = [
  {
    id: 'prod-seragam',
    name: 'Seragam Resmi Hadroh Khoirunnada',
    category: 'Busana & Atribut',
    price: 175000,
    description:
      'Kain Toyobo Fodu Grade A bertekstur adem dan lembut dengan bordir presisi benang emas lambang Khoirunnada.',
    badge: 'Terlaris',
    iconType: 'apparel',
  },
  {
    id: 'prod-rebana',
    name: 'Rebana Hadroh Jepara Super',
    category: 'Alat Musik',
    price: 385000,
    description:
      'Kayu mangga bubut pilihan dengan membran kulit punggung kambing terbaik, menghasilkan suara kencang dan bulat.',
    badge: 'Kualitas Super',
    iconType: 'instrument',
  },
  {
    id: 'prod-kitab',
    name: "Kitab Qosidah & Majmu'ah Hardcover",
    category: 'Buku & Syair',
    price: 65000,
    description:
      'Kompilasi 104 qosidah lengkap dengan teks Arab berharakat, transliterasi huruf latin, dan makna terjemahan.',
    badge: 'Edisi Khusus',
    iconType: 'book',
  },
  {
    id: 'prod-sub',
    name: 'Langganan Member Prioritas (1 Bulan)',
    category: 'Keanggotaan Digital',
    price: 75000,
    description:
      'Akses prioritas fitur majelis, notifikasi jadwal khusus, serta donasi dukungan kas operasional majelis.',
    badge: 'Uji Coba Langganan',
    iconType: 'subscription',
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
  const [customerName, setCustomerName] = useState(currentUser?.name || 'Admin Hadroh');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || 'admin@khoirunnada.org');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '081234567890');

  const [isLoading, setIsLoading] = useState(false);
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [checkoutResult, setCheckoutResult] = useState<{
    orderId: string;
    checkoutUrl: string;
    amount: number;
  } | null>(null);

  const handleOpenCheckout = (product: ShopProduct) => {
    setSelectedProduct(product);
    setErrorMessage(null);
    setCheckoutResult(null);
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
    setIsIframeLoading(true);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);
    setIsIframeLoading(true);

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
          amount_idr: selectedProduct.price,
          items: [
            {
              description: selectedProduct.name,
              quantity: 1,
              unit_price_idr: selectedProduct.price,
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

      // Langsung simpan checkoutResult agar iframe Mayar langsung dirender di dalam modal popup
      setCheckoutResult({
        orderId: data.order_id || generatedOrderId,
        checkoutUrl,
        amount: selectedProduct.price,
      });
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Terjadi kendala saat menghubungi Payment Gateway.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderIcon = (type: ShopProduct['iconType']) => {
    switch (type) {
      case 'apparel':
        return <Shirt className="w-5 h-5 text-[#70490E]" />;
      case 'instrument':
        return <Music className="w-5 h-5 text-[#70490E]" />;
      case 'book':
        return <BookOpen className="w-5 h-5 text-[#70490E]" />;
      case 'subscription':
        return <CreditCard className="w-5 h-5 text-[#70490E]" />;
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
                <span>Modul Uji Coba Transaksi</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-[#70490E]">
                  Eksperimental
                </span>
              </div>
              <p className="text-[11px] text-[#585145] mt-1 leading-relaxed">
                Halaman ini difungsikan khusus untuk menguji integrasi Payment Gateway Nexarin Pay.
                Seluruh proses pembayaran diproses langsung di dalam antarmuka popup aplikasi ini.
              </p>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between px-1 pt-1">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#585145]">
              Katalog Produk Uji Coba
            </h3>
            <p className="text-[10px] text-[#70490E] mt-0.5 font-medium">
              Pilih produk di bawah untuk mencoba alur pembayaran langsung
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
                      <p className="text-[9px] text-[#585145] font-medium">Harga</p>
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
                      Beli Sekarang
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
        title={checkoutResult ? 'Gerbang Pembayaran Mayar' : 'Konfirmasi Pesanan'}
        subtitle={
          checkoutResult
            ? `Nomor Pesanan: ${checkoutResult.orderId}`
            : 'Detail item & informasi pelanggan'
        }
      >
        {selectedProduct && (
          <div className="space-y-3">
            {checkoutResult ? (
              /* State Pembayaran: Render Langsung di Iframe Popup */
              <div className="space-y-3">
                {/* Header Ringkasan Tagihan */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-[#F8F6F0] via-white to-[#F8F6F0] border border-[#B58228]/25 flex items-center justify-between shadow-sm">
                  <div className="min-w-0 pr-2">
                    <p className="text-[10px] font-bold text-[#996A19] uppercase tracking-wider truncate">
                      {selectedProduct.name}
                    </p>
                    <p className="text-xs font-extrabold text-[#70490E]">
                      {formatRupiah(checkoutResult.amount)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                      Mayar ID Active
                    </span>
                    <a
                      href={checkoutResult.checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Buka tab baru jika diperlukan"
                      className="w-7 h-7 rounded-lg bg-black/5 hover:bg-black/10 flex items-center justify-center text-[#585145] transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Wadah Iframe Mayar Langsung di Dalam Popup */}
                <div className="relative w-full h-[520px] sm:h-[580px] rounded-2xl overflow-hidden border border-[#B58228]/25 bg-white shadow-inner">
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

                {/* Tombol Aksi Bawah Modal */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsIframeLoading(true);
                      const iframe = document.querySelector('iframe');
                      if (iframe) iframe.src = checkoutResult.checkoutUrl;
                    }}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#585145] hover:text-[#151917]"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Muat Ulang Tampilan</span>
                  </button>

                  <GlassButton
                    type="button"
                    variant="ghost"
                    onClick={handleCloseModal}
                    className="!py-1.5 !px-4 text-xs font-bold"
                  >
                    Tutup Popup
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
                    {formatRupiah(selectedProduct.price)}
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
                    <span>Harga Item</span>
                    <span>{formatRupiah(selectedProduct.price)}</span>
                  </div>
                  <div className="flex justify-between text-[#585145]">
                    <span>Biaya Layanan Gateway</span>
                    <span className="text-emerald-700 font-semibold">Gratis</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#151917] pt-1 border-t border-black/5 text-sm">
                    <span>Total Pembayaran</span>
                    <span className="text-[#70490E] font-extrabold">
                      {formatRupiah(selectedProduct.price)}
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
