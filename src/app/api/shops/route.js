import { NextResponse } from 'next/server';
import { listShops, createShop } from '@/lib/data';

export async function GET() {
  return NextResponse.json({ shops: listShops() });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, address, phone } = body;
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });
    const shop = createShop({ name, address, phone });
    return NextResponse.json({ shop });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
