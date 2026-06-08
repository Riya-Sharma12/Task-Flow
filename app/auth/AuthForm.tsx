'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { toast } from 'sonner';

const schema = z.object({
  email: z.string().trim().max(255).pipe(z.email('Enter a valid email')),
  password: z.string().min(6, 'At least 6 characters').max(72),
});

interface Props {
  defaultTab: 'signin' | 'signup';
  initialError?: string;
}

export default function AuthForm({ defaultTab, initialError }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState<string | null>(null);
  const [devVerifyUrl, setDevVerifyUrl] = useState<string | null>(null);

  useEffect(() => {
    if (initialError === 'invalid-token') {
      toast.error('That verification link is invalid or has already been used.');
    } else if (initialError === 'expired-token') {
      toast.error('That verification link has expired. Please register again.');
    }
  }, [initialError]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }
    setLoading(true);
    try {
      const endpoint = mode === 'signup' ? '/api/auth/register' : '/api/auth/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong');

      if (mode === 'signup') {
        setCheckEmail(parsed.data.email);
        if (data.devUrl) setDevVerifyUrl(data.devUrl);
      } else {
        toast.success('Welcome back');
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const leftPanel = (
    <div className="bg-ink text-paper p-10 flex flex-col justify-between min-h-[500px] relative overflow-hidden">
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] flex justify-between">
        <span>Indexcard</span>
        <span className="text-lime">№001</span>
      </div>

      <div className="relative z-10">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-lime mb-4">
          {checkEmail
            ? 'Confirmation sent'
            : mode === 'signin'
            ? 'Returning reader'
            : 'New subscriber'}
        </div>
        <h2 className="font-display text-6xl leading-[0.9]">
          {checkEmail ? (
            <>Check your<br /><em>inbox.</em></>
          ) : mode === 'signin' ? (
            <>Pick up<br /><em>where you</em><br />left off.</>
          ) : (
            <>Open a<br />fresh <em>page</em>.</>
          )}
        </h2>
      </div>

      <div className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-60 relative z-10">
        A daily ledger for the determined.
      </div>

      <div className="absolute -right-12 -bottom-12 w-56 h-56 bg-lime rounded-full opacity-90" />
      <div className="absolute right-6 bottom-6 font-mono text-[10px] uppercase tracking-[0.25em] text-ink z-10">
        stamp
      </div>
    </div>
  );

  if (checkEmail) {
    return (
      <div className="min-h-screen bg-background grid-paper flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-5xl grid md:grid-cols-2 gap-0 brutal-border brutal-shadow bg-card">
          {leftPanel}

          <div className="p-10 flex flex-col justify-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-lime mb-4">
              One step left
            </div>
            <h3 className="font-display text-4xl leading-[0.95] mb-6">
              Verify your<br /><em>email address.</em>
            </h3>
            <p className="font-mono text-xs text-muted-foreground leading-relaxed mb-3">
              We sent a confirmation link to:
            </p>
            <p className="font-mono text-sm font-bold text-ink mb-6 brutal-border px-4 py-3 bg-paper">
              {checkEmail}
            </p>
            <p className="font-mono text-[10px] text-muted-foreground leading-relaxed mb-6">
              Click the link in that email to activate your account and open your first ledger. Check your spam folder if it doesn&apos;t arrive within a minute.
            </p>

            {devVerifyUrl && (
              <div className="mb-8 brutal-border bg-lime/20 p-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-ink mb-2">
                  Dev mode — no email sent
                </p>
                <a
                  href={devVerifyUrl}
                  className="font-mono text-xs text-ink underline underline-offset-4 break-all hover:text-ember transition-colors"
                >
                  Click here to verify →
                </a>
              </div>
            )}

            <button
              type="button"
              onClick={() => { setCheckEmail(null); setMode('signin'); }}
              className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-ink transition-colors text-left"
            >
              ← Back to sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background grid-paper flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-0 brutal-border brutal-shadow bg-card">
        {leftPanel}

        {/* ── Right form panel ── */}
        <div className="p-10 flex flex-col justify-center">
          <div className="flex gap-1 brutal-border w-fit mb-8">
            {(['signin', 'signup'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`font-mono text-[11px] uppercase tracking-[0.2em] px-4 py-2 transition-colors ${
                  mode === m ? 'bg-ink text-paper' : 'bg-paper text-ink hover:bg-lime'
                }`}
              >
                {m === 'signin' ? 'Sign in' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground block mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={255}
                placeholder="you@somewhere.com"
                className="w-full bg-paper brutal-border px-4 py-3 font-mono text-sm focus:outline-none focus:brutal-shadow-sm focus:-translate-x-px focus:-translate-y-px transition-all"
              />
            </div>

            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground block mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                maxLength={72}
                placeholder="••••••"
                className="w-full bg-paper brutal-border px-4 py-3 font-mono text-sm focus:outline-none focus:brutal-shadow-sm focus:-translate-x-px focus:-translate-y-px transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full font-mono text-xs uppercase tracking-[0.25em] px-6 py-4 bg-lime text-ink brutal-border brutal-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-60"
            >
              {loading ? 'Working…' : mode === 'signin' ? 'Sign in →' : 'Create account →'}
            </button>
          </form>

          <Link
            href="/"
            className="mt-6 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-ink transition-colors"
          >
            ← back to cover
          </Link>
        </div>
      </div>
    </div>
  );
}
