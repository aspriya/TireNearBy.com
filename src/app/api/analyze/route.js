import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { listShops } from '@/lib/data';

export const runtime = 'nodejs';

export async function POST(req) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'Server missing OPENAI_API_KEY' }, { status: 500 });
    }
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const form = await req.formData();
    const file = form.get('image');
    if (!file) return NextResponse.json({ error: 'Missing image' }, { status: 400 });

  const arrayBuffer = await file.arrayBuffer();
  // Convert to base64 without Buffer (edge compatible fallback, though we're on node runtime)
  let b64 = '';
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  b64 = Buffer.from(binary, 'binary').toString('base64');

    const systemPrompt = `You are an assistant that extracts CONSUMER-FRIENDLY tire info from a sidewall image.
Return STRICT JSON (no markdown) with shape:
{
  "core": {"size": string, "loadIndex": string, "speedRating": string, "brand": string, "model": string, "dot": {"week": string|null, "year": string|null, "description": string|null}},
  "condition": {"status": "green"|"amber"|"red", "label": string, "reasons": string[], "confidence": number, "disclaimer": string},
  "context": {"ageYears": number|null, "ageAdvisory": string|null, "commonFitment": string[]}
}
Guidelines: 
- Keep label short (<=40 chars).
- Reasons max 3 concise items, consumer vocabulary.
- If DOT not visible, set week & year null.
- status mapping: new/excellent -> green; worn/aging/minor cracks -> amber; severe, damaged, bulge, exposed cords -> red.
- confidence 0.5-0.99 (never 1.0).
- disclaimer ALWAYS: "Visual-only assessment. A professional inspection is recommended."`;

    const result = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: [
          { type: 'text', text: 'Extract structured tire info for a consumer. Only JSON.' },
          { type: 'image_url', image_url: { url: `data:${file.type};base64,${b64}` } }
        ] }
      ],
      response_format: { type: 'json_object' }
    });

    let parsed = {};
    try { parsed = JSON.parse(result.choices[0].message.content); } catch (e) { parsed = {}; }

    // Defensive normalization
    const core = parsed.core || {};
    // Attempt to parse size & load/speed if missing pieces
    if (core.size && (!core.loadIndex || !core.speedRating)) {
      // Common pattern 205/55R16 91V
      const match = /\b(\d{3}\/[0-9]{2}R?\d{2})\s+(\d{2,3})([A-Z])\b/.exec(parsed.rawLine || core.size);
      if (match) {
        core.size = core.size.includes(match[1]) ? core.size : match[1];
        core.loadIndex = core.loadIndex || match[2];
        core.speedRating = core.speedRating || match[3];
      }
    }

    // DOT age calculation
    let ageYears = null;
    if (core.dot && core.dot.year && core.dot.week) {
      const week = parseInt(core.dot.week, 10);
      const year = parseInt(core.dot.year, 10);
      if (!isNaN(week) && !isNaN(year) && week>=1 && week<=53) {
        const firstDayOfYear = new Date(year,0,1);
        const ms = firstDayOfYear.getTime() + (week-1)*7*24*3600*1000;
        ageYears = (Date.now() - ms)/(365.25*24*3600*1000);
      }
    }
    if (parsed.context) parsed.context.ageYears = parsed.context.ageYears ?? (ageYears ? Number(ageYears.toFixed(2)) : null);
    else parsed.context = { ageYears: ageYears ? Number(ageYears.toFixed(2)) : null, ageAdvisory: null, commonFitment: [] };
    if (parsed.context.ageYears != null) {
      if (parsed.context.ageYears > 7) parsed.context.ageAdvisory = 'This tire is over 7 years old. Industry guidelines recommend replacing tires older than 6 years.';
      else if (parsed.context.ageYears > 5) parsed.context.ageAdvisory = 'Age approaching typical replacement window (5+ years).';
    }

    // Availability & price from local data
    const size = core.size;
    if (size) {
      const allShops = listShops();
      const matches = [];
      const shopSet = new Set();
      for (const s of allShops) {
        for (const t of s.tires) {
          if (t.size === size) {
            matches.push(t);
            shopSet.add(s.id);
          }
        }
      }
      if (matches.length) {
        const prices = matches.map(m=>m.price).filter(p=>typeof p === 'number');
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        parsed.availability = {
          shopsWithSize: shopSet.size,
          inventoryCount: matches.reduce((a,m)=>a+(m.quantity||0),0),
          priceRange: { currency: 'USD', min, max },
          samplePrices: prices.slice(0,5)
        };
      } else {
        parsed.availability = { shopsWithSize: 0, inventoryCount: 0, priceRange: null };
      }
    } else {
      parsed.availability = { shopsWithSize: 0, inventoryCount: 0, priceRange: null };
    }

    // Ensure condition section conforms
    if (!parsed.condition) parsed.condition = { status: 'amber', label: 'Limited data', reasons: [], confidence: 0.6, disclaimer: 'Visual-only assessment. A professional inspection is recommended.' };

    return NextResponse.json({ analysis: parsed });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
