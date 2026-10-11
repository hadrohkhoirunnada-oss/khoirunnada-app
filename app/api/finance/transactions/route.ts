import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Sesi login telah berakhir.' }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('id, status')
      .eq('auth_user_id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Fetch public finance profile error:', profileError);
      return NextResponse.json({ error: 'Gagal memverifikasi anggota.' }, { status: 500 });
    }

    if (!profile || profile.status !== 'active') {
      return NextResponse.json({ error: 'Akses hanya untuk anggota aktif.' }, { status: 403 });
    }

    const [transactionsResult, categoriesResult] = await Promise.all([
      admin
        .from('finance_transactions')
        .select('id, type, amount, transaction_date, description, category_id, created_by, attachment_url')
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false }),
      admin.from('finance_categories').select('id, name'),
    ]);

    if (transactionsResult.error || categoriesResult.error) {
      console.error('Fetch public finance transactions error:', transactionsResult.error ?? categoriesResult.error);
      return NextResponse.json({ error: 'Gagal memuat rincian transaksi kas.' }, { status: 500 });
    }

    const transactions = transactionsResult.data ?? [];
    const categoryNames = new Map((categoriesResult.data ?? []).map((category) => [category.id, category.name]));
    const creatorIds = [...new Set(transactions.map((transaction) => transaction.created_by))];
    let creatorRows: Array<{ id: string; name: string }> = [];
    if (creatorIds.length > 0) {
      const creatorsResult = await admin.from('profiles').select('id, name').in('id', creatorIds);
      if (creatorsResult.error) {
        console.error('Fetch public finance creator names error:', creatorsResult.error);
        return NextResponse.json({ error: 'Gagal memuat nama pencatat transaksi.' }, { status: 500 });
      }
      creatorRows = (creatorsResult.data ?? []) as Array<{ id: string; name: string }>;
    }

    const creatorNames = new Map(creatorRows.map((creator) => [creator.id, creator.name]));
    const receiptPaths = transactions
      .map((transaction) => transaction.attachment_url)
      .filter((path): path is string => Boolean(path && !path.startsWith('http')));
    const signedReceipts = new Map<string, string>();

    if (receiptPaths.length > 0) {
      const { data: signedData, error: signedError } = await admin.storage
        .from('finance-receipts')
        .createSignedUrls(receiptPaths, 60 * 60);

      if (signedError) {
        console.error('Sign public finance receipts error:', signedError);
      } else {
        signedData?.forEach((receipt, index) => {
          if (receipt.signedUrl) signedReceipts.set(receiptPaths[index], receipt.signedUrl);
        });
      }
    }

    return NextResponse.json({
      transactions: transactions.map((transaction) => ({
        id: transaction.id,
        type: transaction.type,
        amount: Number(transaction.amount),
        transaction_date: transaction.transaction_date,
        description: transaction.description,
        category_name: categoryNames.get(transaction.category_id) ?? 'Tanpa Kategori',
        created_by_name: creatorNames.get(transaction.created_by) ?? 'Username tidak tersedia',
        attachment_url: transaction.attachment_url
          ? transaction.attachment_url.startsWith('http')
            ? transaction.attachment_url
            : signedReceipts.get(transaction.attachment_url)
          : undefined,
      })),
    }, {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    console.error('GET /api/finance/transactions error:', error);
    return NextResponse.json({ error: 'Gagal memuat rincian transaksi kas.' }, { status: 500 });
  }
}
