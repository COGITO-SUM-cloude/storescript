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

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center py-12 px-4">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-2">StoreScript</h1>
        <p className="text-slate-400 text-lg">AI-powered listings for Etsy &amp; Shopify sellers</p>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-2xl bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 mb-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Platform Toggle */}
          <div className="flex gap-2 mb-1">
            <button
              type="button"
              onClick={() => setPlatform('etsy')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                platform === 'etsy'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-white/10 text-slate-300 hover:bg-white/15'
              }`}
            >
              Etsy
            </button>
            <button
              type="button"
              onClick={() => setPlatform('shopify')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                platform === 'shopify'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-white/10 text-slate-300 hover:bg-white/15'
              }`}
            >
              Shopify
            </button>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Product Name</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
              placeholder="e.g. Hand-painted ceramic mug"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              placeholder="e.g. Home & Living, Ceramics"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Features / Materials</label>
            <textarea
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              required
              rows={3}
              placeholder="e.g. Food-safe glaze, dishwasher safe, holds 12oz, unique botanical design"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Target Audience</label>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              required
              placeholder="e.g. Coffee lovers, home decorators, gift buyers"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Usage Counter */}
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>
              {atLimit ? (
                <span className="text-amber-400">Daily limit reached</span>
              ) : (
                <>
                  <span className="text-amber-400 font-medium">{usageCount}</span> / 3 free generations used
                </>
              )}
            </span>
            {remainingUses > 0 && (
              <span className="text-slate-500">{remainingUses} remaining today</span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || atLimit}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
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
              'Generate Listing'
            )}
          </button>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="w-full max-w-2xl bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4 text-red-300 text-sm mb-6">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="w-full max-w-2xl bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 flex flex-col gap-6">
          <h2 className="text-lg font-semibold text-amber-400">Your Optimized Listing</h2>

          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-slate-400">Title</label>
              <button
                onClick={() => handleCopy(result.title, 'title')}
                className="text-xs text-amber-500 hover:text-amber-400 transition-colors"
              >
                {copied === 'title' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm leading-relaxed">
              {result.title}
            </div>
          </div>

          {/* Tags (Etsy) or Meta Description (Shopify) */}
          {isEtsy(result) ? (
            <div>
              <label className="block text-sm text-slate-400 mb-2">Tags ({result.tags.length})</label>
              <div className="flex flex-wrap gap-2">
                {result.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm text-slate-400">Meta Description</label>
                <button
                  onClick={() => handleCopy((result as ShopifyResult).metaDescription, 'meta')}
                  className="text-xs text-amber-500 hover:text-amber-400 transition-colors"
                >
                  {copied === 'meta' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm leading-relaxed">
                {(result as ShopifyResult).metaDescription}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-slate-400">Description</label>
              <button
                onClick={() => handleCopy(result.description, 'desc')}
                className="text-xs text-amber-500 hover:text-amber-400 transition-colors"
              >
                {copied === 'desc' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
              {result.description}
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Banner */}
      {atLimit && (
        <div className="w-full max-w-2xl mt-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 text-center">
          <p className="text-amber-300 font-medium mb-1">You&apos;ve used all 3 free generations</p>
          <p className="text-slate-400 text-sm mb-4">Upgrade for unlimited listings, priority access, and more.</p>
          <a
            href="#gumroad"
            className="inline-block bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
          >
            Upgrade — Get Unlimited Access
          </a>
        </div>
      )}
    </main>
  );
}
