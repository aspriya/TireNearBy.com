import OpenAI from 'openai';
import { NextResponse } from 'next/server';

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

    const result = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You extract tire specifications and condition from a photo of a tire sidewall. Return JSON with fields: code, brand, model, size, loadSpeed, condition (new|good|worn|replace), notes.' },
        { role: 'user', content: [
          { type: 'text', text: 'Analyze this tire' },
          { type: 'image_url', image_url: { url: `data:${file.type};base64,${b64}` } }
        ] }
      ],
      response_format: { type: 'json_object' }
    });

    let parsed = {};
    try { parsed = JSON.parse(result.choices[0].message.content); } catch (e) {}
    return NextResponse.json({ analysis: parsed });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
