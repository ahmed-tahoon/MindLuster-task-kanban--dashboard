import { NextResponse } from 'next/server';
import type { Task, TaskFormData } from '@/types/task';
import { getStore } from './store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.toLowerCase();
  const column = searchParams.get('column') || undefined;
  const page = parseInt(searchParams.get('_page') || '1', 10);
  const limit = parseInt(searchParams.get('_limit') || '1000', 10);

  let items = getStore();
  if (q) {
    items = items.filter((t) =>
      t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    );
  }
  if (column) {
    items = items.filter((t) => t.column === column);
  }

  const total = items.length;
  const start = (page - 1) * limit;
  const data = items.slice(start, start + limit);

  const res = NextResponse.json(data, {
    headers: {
      'x-total-count': String(total),
      'cache-control': 'no-store',
      'x-fallback-note': 'Using Next.js in-memory API fallback',
    },
  });
  return res;
}

export async function POST(request: Request) {
  const body = (await request.json()) as TaskFormData & Partial<Task>;
  const store = getStore();
  const id = body.id || Date.now().toString();
  const position = body.position ?? (store.reduce((m, t) => Math.max(m, t.position ?? 0), 0) + 1);
  const newTask: Task = {
    id,
    title: body.title,
    description: body.description,
    column: body.column,
    position,
  };
  store.push(newTask);
  return NextResponse.json(newTask, { status: 201, headers: { 'cache-control': 'no-store' } });
}


