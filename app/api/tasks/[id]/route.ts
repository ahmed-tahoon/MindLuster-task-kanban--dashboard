import { NextResponse } from 'next/server';
import type { Task } from '@/types/task';
import { getStore } from '../store';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const store = getStore();
  const task = store.find((t) => t.id === params.id);
  if (!task) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json(task, { headers: { 'cache-control': 'no-store' } });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const updates = await request.json();
  const store = getStore();
  const idx = store.findIndex((t) => t.id === params.id);
  if (idx === -1) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  store[idx] = { ...store[idx], ...updates } as Task;
  return NextResponse.json(store[idx], { headers: { 'cache-control': 'no-store' } });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const store = getStore();
  const idx = store.findIndex((t) => t.id === params.id);
  if (idx === -1) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  store.splice(idx, 1);
  return NextResponse.json({}, { status: 204, headers: { 'cache-control': 'no-store' } });
}


