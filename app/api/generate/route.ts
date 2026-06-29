import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'local';
  const now = Date.now();
  const limit = rateLimitMap.get(ip);
  if (limit && now < limit.resetAt && limit.count >= 3) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }
  if (!limit || now >= limit.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 86400000 });
  } else {
    limit.count++;
  }

  const { productName, category, features, audience, platform } = await req.json();

  const etsyPrompt = `You are an Etsy SEO expert. Generate an optimized listing.
Product: ${productName}
Category: ${category}
Features/materials: ${features}
Target audience: ${audience}

Return ONLY valid JSON: {"title":"max 140 chars, front-load keyword","tags":["exactly 13 tags, diverse, 1-20 chars each"],"description":"700+ words, no markdown headers, starts with hook, ends with CTA"}`;

  const shopifyPrompt = `You are a Shopify SEO expert. Generate an optimized product listing.
Product: ${productName}, Category: ${category}, Features: ${features}, Audience: ${audience}
Return ONLY valid JSON: {"title":"SEO title max 70 chars","metaDescription":"max 160 chars","description":"500 word benefit-focused description"}`;

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1500,
    messages: [{ role: 'user', content: platform === 'shopify' ? shopifyPrompt : etsyPrompt }],
  });

  const text = (msg.content[0] as { type: string; text: string }).text;
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}') + 1;
  const data = JSON.parse(text.slice(start, end));
  return NextResponse.json(data);
}
