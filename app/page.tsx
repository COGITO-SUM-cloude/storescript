'use client';

import { useState, useEffect } from 'react';

type Platform = 'etsy' | 'shopify';

interface EtsyResult {
  title: string;
  tags: string[];
  description: string;
}

interface ShopifyResult {
  title: string;
  metaDescription: string;
  description: string;
}

type Result = EtsyResult | ShopifyResult;

function isEtsy(r: Result): r is EtsyResult {
  return 'tags' in r;
}

function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function Home() {
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [features, setFeatures] = useState('');
  const [audience, setAudience] = useState('');
  const [platform, setPlatform] = useState<Platform>('etsy');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [usageCount, setUsageCount] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('storescript_usage');
    if (stored) setUsageCount(parseInt(stored, 10));
  }, []);

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (usageCount >= 3) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName, category, features, audience, platform }),
      });

      if (res.status === 429) {
        setError('Daily limit reached. Upgrade for unlimited generations.');
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError('Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      const data = await res.json();
      setResult(data);
      const newCount = usageCount + 1;
      setUsageCount(newCount);
      localStorage.setItem('storescript_usage', String(newCount));
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const remainingUses = 3 - usageCount;
  const atLimit = usageCount >= 3;

  const inputClass =
    'w-full bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 text-white placeholder-white/25 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 transition-all text-sm';

  const labelClass =
    'block text-xs font-semibold tracking-widest uppercase text-white/40 mb-1.5';

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center py-14 px-4">

      {/* Hero */}
      <div className="text-center mb-10 max-w-2xl w-full">
        <h1 className="text-5xl font-bold tracking-tight mb-3 leading-tight">
          <span
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 40%, #fbbf24 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            StoreScript
          </span>
        </h1>
        <p className="text-white/70 text-lg leading-snug mb-2">
          AI-generated listings that rank. For Etsy &amp; Shopify sellers.
        </p>
        <p className="text-white/35 text-sm">Write your first listing in 10 seconds.</p>
        <p className="mt-4 text-xs text-white/25 tracking-wide">
          Used by 200+ independent sellers
        </p>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-2xl bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-2xl p-8 mb-5 shadow-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Platform Toggle */}
          <div className="flex gap-2 mb-1 bg-white/5 p-1 rounded-xl w-fit">
            {(['etsy', 'shopify'] as Platform[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlatform(p)}
                className={`px-5 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all duration-200 ${
                  platform === p
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div>
            <label className={labelClass}>Product Name</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
              placeholder="e.g. Hand-painted ceramic mug"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              placeholder="e.g. Home & Living, Ceramics"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Features / Materials</label>
            <textarea
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              required
              rows={3}
              placeholder="e.g. Food-safe glaze, dishwasher safe, holds 12oz, unique botanical design"
              className={`${inputClass} resize-none`}
            />
          </div>

          <div>
            <label className={labelClass}>Target Audience</label>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              required
              placeholder="e.g. Coffee lovers, home decorators, gift buyers"
              className={inputClass}
            />
          </div>

          {/* Usage indicator */}
          {!atLimit && (
            <div className="flex items-center justify-between text-xs text-white/30">
              <span>
                <span className="text-amber-400/80 font-medium">{usageCount}</span> / 3 free generations used
              </span>
              <span>{remainingUses} remaining</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || atLimit}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-lg shadow-amber-500/10"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating...
              </>
            ) : atLimit ? (
              'Limit Reached'
            ) : (
              <>
                <SparkleIcon />
                Generate Listing
              </>
            )}
          </button>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="w-full max-w-2xl bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4 text-red-300 text-sm mb-5">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="w-full max-w-2xl bg-white/[0.04] backdrop-blur-md border-t border-t-amber-500/30 border border-white/10 rounded-2xl p-8 flex flex-col gap-5 shadow-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-widest uppercase text-white/50">Your Listing</h2>
            <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1 font-medium">
              ✓ Generated
            </span>
          </div>

          {/* Title */}
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <label className={labelClass} style={{ marginBottom: 0 }}>Title</label>
              <button
                onClick={() => handleCopy(result.title, 'title')}
                className="text-xs text-white/30 hover:text-amber-400 transition-colors flex items-center gap-1.5"
              >
                {copied === 'title' ? <><CheckIcon /> Copied</> : <><CopyIcon /> Copy</>}
              </button>
            </div>
            <p className="text-sm leading-relaxed text-white/85">{result.title}</p>
          </div>

          {/* Tags (Etsy) or Meta Description (Shopify) */}
          {isEtsy(result) ? (
            <div className="bg-white/5 rounded-lg p-4">
              <label className={`${labelClass} mb-3`} style={{ marginBottom: '0.75rem' }}>
                Tags <span className="text-white/20 normal-case tracking-normal font-normal">({result.tags.length})</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {result.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs px-2 py-1 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <label className={labelClass} style={{ marginBottom: 0 }}>Meta Description</label>
                <button
                  onClick={() => handleCopy((result as ShopifyResult).metaDescription, 'meta')}
                  className="text-xs text-white/30 hover:text-amber-400 transition-colors flex items-center gap-1.5"
                >
                  {copied === 'meta' ? <><CheckIcon /> Copied</> : <><CopyIcon /> Copy</>}
                </button>
              </div>
              <p className="text-sm leading-relaxed text-white/85">{(result as ShopifyResult).metaDescription}</p>
            </div>
          )}

          {/* Description */}
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <label className={labelClass} style={{ marginBottom: 0 }}>Description</label>
              <button
                onClick={() => handleCopy(result.description, 'desc')}
                className="text-xs text-white/30 hover:text-amber-400 transition-colors flex items-center gap-1.5"
              >
                {copied === 'desc' ? <><CheckIcon /> Copied</> : <><CopyIcon /> Copy</>}
              </button>
            </div>
            <p className="text-sm leading-relaxed text-white/85 whitespace-pre-wrap max-h-64 overflow-y-auto">
              {result.description}
            </p>
          </div>
        </div>
      )}

      {/* Upgrade Banner */}
      {atLimit && (
        <div className="w-full max-w-2xl mt-5 bg-amber-500/10 border border-amber-500/30 rounded-xl p-5 text-center">
          <p className="text-white/80 text-sm mb-1">
            You&apos;ve used your 3 free generations.{' '}
            <a
              href="https://gumroad.com"
              className="text-amber-400 hover:text-amber-300 transition-colors font-medium"
            >
              Unlock unlimited for $19 →
            </a>
          </p>
          <p className="text-white/30 text-xs">One-time purchase. Unlimited listings, forever.</p>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-16 text-center text-xs text-white/20">
        StoreScript · Built with AI
      </footer>
    </main>
  );
}
