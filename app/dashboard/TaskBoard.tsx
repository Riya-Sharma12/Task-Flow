'use client';

import { useState, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

type Filter = 'all' | 'pending' | 'completed';

// ── API helpers ────────────────────────────────────────────────────────────────
async function fetchTasks(): Promise<Task[]> {
  const res = await fetch('/api/tasks');
  if (!res.ok) throw new Error('Failed to load tasks');
  return res.json();
}

async function apiCreateTask(data: { title: string; description: string; dueDate: string | null }) {
  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).error ?? 'Create failed');
  return res.json() as Promise<Task>;
}

async function apiUpdateTask(id: string, data: Partial<Pick<Task, 'title' | 'description' | 'status' | 'dueDate'>>) {
  const res = await fetch(`/api/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).error ?? 'Update failed');
  return res.json() as Promise<Task>;
}

async function apiDeleteTask(id: string) {
  const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Delete failed');
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function TaskBoard({ email }: { email: string; userId: string }) {
  const qc = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  });

  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [deleteCandidate, setDeleteCandidate] = useState<Task | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  // ── Mutations ──────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: apiCreateTask,
    onSuccess: (created) => {
      qc.setQueryData<Task[]>(['tasks'], (old = []) => [created, ...old]);
      toast.success('Entry filed');
      resetForm();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pick<Task, 'title' | 'description' | 'status' | 'dueDate'>> }) =>
      apiUpdateTask(id, data),
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: ['tasks'] });
      const prev = qc.getQueryData<Task[]>(['tasks']);
      qc.setQueryData<Task[]>(['tasks'], (old = []) =>
        old.map((t) => (t.id === id ? { ...t, ...data } : t))
      );
      return { prev };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['tasks'], ctx.prev);
      toast.error('Update failed');
    },
    onSuccess: (updated) => {
      qc.setQueryData<Task[]>(['tasks'], (old = []) =>
        old.map((t) => (t.id === updated.id ? updated : t))
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: apiDeleteTask,
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: ['tasks'] });
      const prev = qc.getQueryData<Task[]>(['tasks']);
      qc.setQueryData<Task[]>(['tasks'], (old = []) => old.filter((t) => t.id !== id));
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(['tasks'], ctx.prev);
      toast.error('Failed to delete');
    },
    onSuccess: () => toast.success('Entry removed'),
  });

  // ── Derived ────────────────────────────────────────────────────────────────
  const total = tasks.length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const pct = total === 0 ? 0 : Math.round((completedCount / total) * 100);

  const visible = useMemo(() => {
    let list = [...tasks];
    if (filter !== 'all') list = list.filter((t) => t.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [tasks, filter, search]);

  const todayISO = new Date().toISOString().split('T')[0];
  const today = new Date()
    .toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    .toUpperCase();

  // ── Handlers ───────────────────────────────────────────────────────────────
  const resetForm = () => { setEditingId(null); setTitle(''); setDescription(''); setDueDate(''); };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setTitle(task.title);
    setDescription(task.description);
    setDueDate(task.dueDate ?? '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    requestAnimationFrame(() => titleRef.current?.focus());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error('Title is required'); return; }
    if (editingId) {
      updateMutation.mutate(
        { id: editingId, data: { title: title.trim(), description: description.trim(), dueDate: dueDate || null } },
        { onSuccess: () => { toast.success('Entry updated'); resetForm(); } }
      );
    } else {
      createMutation.mutate({ title: title.trim(), description: description.trim(), dueDate: dueDate || null });
    }
  };

  const toggleStatus = (task: Task) => {
    const next = task.status === 'pending' ? 'completed' : 'pending';
    updateMutation.mutate(
      { id: task.id, data: { status: next } },
      { onSuccess: () => toast.success(next === 'completed' ? 'Marked complete ✓' : 'Moved back to pending') }
    );
  };

  const handleDelete = (task: Task) => setDeleteCandidate(task);

  const confirmDelete = () => {
    if (!deleteCandidate) return;
    if (editingId === deleteCandidate.id) resetForm();
    deleteMutation.mutate(deleteCandidate.id);
    setDeleteCandidate(null);
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-ink text-paper border-b-2 border-ink">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 font-mono text-[11px] uppercase tracking-[0.2em]">
          <Link href="/" className="hover:text-lime transition-colors">← Indexcard</Link>
          <span className="hidden md:block">{today}</span>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="hover:text-lime transition-colors">Sign out →</button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10 grid-paper min-h-[calc(100vh-52px)]">

        {/* Hero */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">{email}</p>
            <h1 className="font-display text-7xl md:text-8xl leading-[0.9]">Today&rsquo;s <em>ledger.</em></h1>
          </div>
          <p className="font-display text-xl italic text-muted-foreground max-w-xs md:text-right leading-snug">
            "The shortest pencil beats the longest memory."
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 brutal-border brutal-shadow mb-6">
          <StatCard label="Total" value={total} />
          <StatCard label="Completed" value={completedCount} highlight="lime" />
          <StatCard label="Pending" value={pendingCount} />
          <StatCard label="Done %" value={`${pct}%`} highlight="ink" />
        </div>

        {/* Progress bar */}
        <div className="brutal-border p-4 mb-10">
          <div className="flex justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
            <span>Progress</span>
            <span className="tabular-nums">{completedCount} / {total}</span>
          </div>
          <div className="h-2 bg-muted brutal-border overflow-hidden">
            <div
              className="h-full bg-lime transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Board */}
        <div className="brutal-border brutal-shadow grid md:grid-cols-[360px_1fr]">

          {/* Left: Form */}
          <div className="border-b-2 md:border-b-0 md:border-r-2 border-ink p-6 flex flex-col gap-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground border-b-2 border-ink pb-3">
              {editingId ? '✎  Editing entry' : '+  File a new entry'}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground block mb-1.5">
                  Title <span className="text-ember">*</span>
                </label>
                <Input
                  ref={titleRef}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs doing?"
                  maxLength={200}
                  required
                />
              </div>

              <div>
                <label className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground block mb-1.5">
                  Notes <span className="opacity-50">(optional)</span>
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Any context or notes…"
                  rows={3}
                  maxLength={500}
                />
              </div>

              <div>
                <label className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground block mb-1.5">
                  Due date <span className="opacity-50">(optional)</span>
                </label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    min={todayISO}
                    className="flex-1"
                  />
                  {dueDate && (
                    <Button type="button" variant="outline" size="sm" onClick={() => setDueDate('')}>×</Button>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? 'Filing…' : editingId ? 'Update entry →' : 'File entry →'}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                )}
              </div>
            </form>
          </div>

          {/* Right: Task list */}
          <div className="p-6 flex flex-col gap-5">
            {/* Search + filter */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search the ledger…"
                className="flex-1"
              />
              <div className="flex brutal-border self-start">
                {(['all', 'pending', 'completed'] as Filter[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={`font-mono text-[11px] uppercase tracking-[0.15em] px-4 py-2.5 transition-colors border-r-2 last:border-r-0 border-ink ${
                      filter === f ? 'bg-ink text-paper' : 'bg-paper text-ink hover:bg-lime'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Task list */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground animate-pulse">
                  Loading…
                </span>
              </div>
            ) : visible.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <p className="font-display text-4xl text-muted-foreground">
                  {search ? 'No results.' : 'A blank page.'}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  {search ? 'Try a different search term.' : 'File your first entry to begin.'}
                </p>
              </div>
            ) : (
              <div>
                {visible.map((task, i) => {
                  const isOverdue = task.dueDate && task.status === 'pending' && task.dueDate < todayISO;
                  return (
                    <div
                      key={task.id}
                      className={`relative border-b-2 border-ink py-4 pl-5 pr-3 flex gap-3 group transition-colors ${
                        editingId === task.id ? 'bg-lime/20' : 'hover:bg-muted/30'
                      }`}
                    >
                      {/* Left status accent strip */}
                      <div className={`absolute left-0 top-0 bottom-0 w-[3px] transition-colors ${
                        task.status === 'completed'
                          ? 'bg-ink/20'
                          : isOverdue
                          ? 'bg-ember'
                          : 'bg-lime'
                      }`} />

                      {/* Row number */}
                      <span className="font-mono text-[9px] text-muted-foreground/60 flex-shrink-0 w-5 text-right mt-[5px] select-none tabular-nums">
                        {String(i + 1).padStart(2, '0')}
                      </span>

                      {/* Checkbox */}
                      <button
                        type="button"
                        onClick={() => toggleStatus(task)}
                        title={task.status === 'completed' ? 'Mark pending' : 'Mark complete'}
                        className={`mt-[3px] w-5 h-5 flex-shrink-0 brutal-border transition-colors ${
                          task.status === 'completed' ? 'bg-ink' : 'bg-paper hover:bg-lime'
                        }`}
                      >
                        {task.status === 'completed' && (
                          <svg viewBox="0 0 16 16" fill="none" className="w-full h-full p-[3px]">
                            <path d="M2 8l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Title + badges inline */}
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className={`font-display text-xl leading-tight ${
                            task.status === 'completed' ? 'line-through text-muted-foreground' : ''
                          }`}>
                            {task.title}
                          </p>
                          <div className="flex gap-1.5 flex-wrap">
                            {task.dueDate && (
                              <Badge variant={isOverdue ? 'destructive' : task.status === 'completed' ? 'default' : 'lime'}>
                                {isOverdue && '⚠ '}
                                {new Date(task.dueDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </Badge>
                            )}
                            <Badge variant={task.status === 'completed' ? 'completed' : 'pending'}>
                              {task.status}
                            </Badge>
                          </div>
                        </div>

                        {task.description && (
                          <p className="font-mono text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>

                      {/* Actions — dimly visible at rest, full on hover */}
                      <div className="flex items-start gap-1 flex-shrink-0 opacity-30 group-hover:opacity-100 transition-opacity">
                        <Button variant="outline" size="sm" onClick={() => startEdit(task)}>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(task)}>×</Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Delete confirmation modal */}
      {deleteCandidate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: 'rgba(28,24,18,0.7)' }}
          onClick={() => setDeleteCandidate(null)}
        >
          <div
            className="w-full max-w-sm bg-card brutal-border brutal-shadow"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="bg-ember text-paper px-6 py-4 border-b-2 border-ink flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em]">Confirm deletion</span>
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="font-mono text-sm leading-none hover:opacity-60 transition-opacity"
              >
                ×
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-6">
              <h2 className="font-display text-3xl leading-tight mb-3">
                Delete this<br /><em>entry?</em>
              </h2>
              <p className="font-mono text-xs text-muted-foreground leading-relaxed mb-4">
                This will permanently remove:
              </p>
              <div className="brutal-border bg-muted/40 px-4 py-3 mb-6">
                <p className="font-display text-lg truncate">{deleteCandidate.title}</p>
              </div>
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-6">
                This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDeleteCandidate(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="flex-1"
                  onClick={confirmDelete}
                >
                  Delete →
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string | number; highlight?: 'lime' | 'ink' }) {
  return (
    <div className={`p-6 border-r-2 last:border-r-0 border-b-2 md:border-b-0 border-ink ${
      highlight === 'lime' ? 'bg-lime' : highlight === 'ink' ? 'bg-ink text-paper' : 'bg-card'
    }`}>
      <p className={`font-mono text-[10px] uppercase tracking-[0.25em] mb-2 ${
        highlight === 'ink' ? 'text-paper/60' : 'text-muted-foreground'
      }`}>{label}</p>
      <p className="font-display text-5xl tabular-nums">{value}</p>
    </div>
  );
}
