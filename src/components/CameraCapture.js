"use client";
import { useRef, useState, useCallback, useEffect } from 'react';
import Image from 'next/image';

export default function CameraCapture({ onAnalysis }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [capturedUrl, setCapturedUrl] = useState(null);
  const [lastCaptureTime, setLastCaptureTime] = useState(null);

  const start = useCallback(async () => {
    setCapturedBlob(null);
    setCapturedUrl(null);
    setResult(null);
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = media;
        await videoRef.current.play();
        setStreaming(true);
      }
    } catch (e) {
      setError(e.message);
    }
  }, []);

  const captureFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    if (!video.videoWidth) return; // not ready yet
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', 0.9));
    setCapturedBlob(blob);
    setCapturedUrl(URL.createObjectURL(blob));
    setLastCaptureTime(Date.now());
    setResult(null);
    setError(null);
    // stop stream
    if (video.srcObject instanceof MediaStream) {
      video.srcObject.getTracks().forEach(t=>t.stop());
    }
    video.pause();
    video.srcObject = null;
    setStreaming(false);
  }, []);

  const analyze = useCallback(async () => {
    if (!capturedBlob) return;
    setAnalyzing(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('image', capturedBlob, 'tire.jpg');
      const res = await fetch('/api/analyze', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setResult(data.analysis);
      onAnalysis?.(data.analysis);
    } catch (e) {
      setError(e.message);
    } finally {
      setAnalyzing(false);
    }
  }, [capturedBlob, onAnalysis]);

  const retry = useCallback(() => {
    setCapturedBlob(null);
    if (capturedUrl) URL.revokeObjectURL(capturedUrl);
    setCapturedUrl(null);
    setResult(null);
    start();
  }, [capturedUrl, start]);

  // Cleanup on unmount: stop any active tracks & revoke blob URL
  useEffect(() => {
    const videoEl = videoRef.current;
    const url = capturedUrl;
    return () => {
      if (videoEl && videoEl.srcObject instanceof MediaStream) {
        videoEl.srcObject.getTracks().forEach(t => t.stop());
      }
      if (url) URL.revokeObjectURL(url);
    };
  }, [capturedUrl]);

  return (
  <div className="w-full flex flex-col gap-4 text-zinc-900">
      {!streaming && (
        <div className="group relative w-full">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/20 via-violet-500/20 to-amber-400/20 opacity-0 group-hover:opacity-100 blur-sm transition" aria-hidden />
          <button
            onClick={start}
            className="relative w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-zinc-900/90 backdrop-blur border border-zinc-700/60 hover:border-emerald-400/50 text-white text-sm font-medium tracking-wide shadow-sm hover:shadow-md transition active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-emerald-400">
              <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h2.382a1 1 0 0 0 .894-.553l.724-1.447A1 1 0 0 1 10.382 3h3.236a1 1 0 0 1 .882.526l.724 1.447A1 1 0 0 0 16.118 6H18.5A2.5 2.5 0 0 1 21 8.5v7A2.5 2.5 0 0 1 18.5 18h-13A2.5 2.5 0 0 1 3 15.5v-7Z" stroke="currentColor" strokeWidth="1.7" />
              <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.7" />
            </svg>
            <span>Open Camera</span>
          </button>
        </div>
      )}
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
        {capturedUrl ? (
          <Image src={capturedUrl} alt="Captured" fill className="object-cover" />
        ) : (
          <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
        )}
        <canvas ref={canvasRef} className="hidden" />
        {capturedBlob && (
          <div className="absolute top-2 left-2 text-[10px] px-2 py-1 rounded bg-emerald-600/80 text-white backdrop-blur-sm">Captured</div>
        )}
      </div>
      {(streaming || capturedBlob) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {!capturedBlob ? (
            <button onClick={captureFrame} disabled={analyzing} className="flex-1 px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium shadow disabled:opacity-50 active:scale-95 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
              Capture
            </button>
          ) : (
            <button onClick={retry} disabled={analyzing} className="flex-1 px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium shadow disabled:opacity-50 active:scale-95 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
              Retry
            </button>
          )}
          <button onClick={analyze} disabled={!capturedBlob || analyzing} className="flex-1 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow disabled:opacity-50 active:scale-95 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
            {analyzing ? 'Analyzing…' : 'Analyze'}
          </button>
        </div>
      )}
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {result && (
        <div className="relative p-px rounded-xl bg-gradient-to-r from-emerald-500 via-violet-500 to-amber-400">
          <div className="rounded-[10px] bg-white p-5 text-sm space-y-5 shadow-sm">
            {/* Core identifiers */}
            <div className="space-y-3">
              <h3 className="font-semibold text-zinc-900 flex items-center gap-2 text-base">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] font-semibold">1</span>
                Your Tire
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoRow label="Size" value={result?.core?.size} />
                <InfoRow label="Load/Speed" value={result?.core?.loadIndex && result?.core?.speedRating ? `${result.core.loadIndex}${result.core.speedRating}` : null} />
                <InfoRow label="Brand" value={result?.core?.brand} />
                <InfoRow label="Model" value={result?.core?.model} />
                {result?.core?.dot && (
                  <InfoRow label="DOT Date" value={(result.core.dot.week && result.core.dot.year) ? `Week ${result.core.dot.week}, ${result.core.dot.year}${result.context?.ageYears ? ` (${result.context.ageYears} yrs)` : ''}`: 'Not visible'} />
                )}
              </div>
            </div>
            {/* Condition summary */}
            <div className="space-y-3">
              <h3 className="font-semibold text-zinc-900 flex items-center gap-2 text-base">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-semibold">2</span>
                Condition Summary
              </h3>
              <div className="rounded-lg border border-zinc-200 p-4 bg-zinc-50/80 space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex h-3 w-3 rounded-full ${result?.condition?.status === 'green' ? 'bg-emerald-500' : result?.condition?.status === 'red' ? 'bg-red-500' : 'bg-amber-500'}`} />
                  <span className="font-medium text-zinc-800 text-sm">{badgeLabel(result?.condition)}</span>
                  {result?.condition?.confidence && <span className="ml-auto text-[10px] text-zinc-500">{Math.round(result.condition.confidence*100)}% confidence</span>}
                </div>
                {result?.condition?.reasons?.length > 0 && (
                  <ul className="text-xs text-zinc-600 list-disc pl-4 space-y-0.5">
                    {result.condition.reasons.slice(0,3).map(r=> <li key={r}>{r}</li>)}
                  </ul>
                )}
                <p className="text-[10px] text-zinc-500">{result?.condition?.disclaimer || 'Visual-only assessment. A professional inspection is recommended.'}</p>
                {result?.context?.ageAdvisory && (
                  <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 flex items-start gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="mt-0.5 text-amber-500"><path d="M12 9v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M10.29 3.86 2.82 17a2 2 0 0 0 1.71 3h14.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span>{result.context.ageAdvisory}</span>
                  </div>
                )}
              </div>
            </div>
            {/* Availability & pricing */}
            <div className="space-y-3">
              <h3 className="font-semibold text-zinc-900 flex items-center gap-2 text-base">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 text-white text-[10px] font-semibold">3</span>
                Nearby Availability
              </h3>
              <div className="rounded-lg border border-zinc-200 p-4 bg-zinc-50/80 space-y-3">
                {result?.availability ? (
                  <div className="space-y-2">
                    <InfoRow label="Matching Shops" value={`${result.availability.shopsWithSize || 0}`} small />
                    {result.availability.priceRange && <InfoRow label="Price Range" value={`${currency(result.availability.priceRange.min)} – ${currency(result.availability.priceRange.max)}`} small />}
                    <InfoRow label="Inventory" value={`${result.availability.inventoryCount || 0} units`} small />
                  </div>
                ) : <p className="text-xs text-zinc-500">No local data.</p>}
                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-3 py-2 shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
                    📞 Call Shop
                  </button>
                  <button className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium px-3 py-2 shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500">
                    📍 Get Directions
                  </button>
                </div>
              </div>
            </div>
            {lastCaptureTime && (
              <p className="text-[10px] text-zinc-400 pt-1">Captured {new Date(lastCaptureTime).toLocaleTimeString()}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, small }) {
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className="w-24 text-[10px] uppercase tracking-wide font-semibold text-zinc-500 mt-0.5">{label}</span>
      <span className={`text-zinc-800 ${small ? 'text-xs' : 'text-sm'} font-medium break-words`}>{value || '—'}</span>
    </div>
  );
}

function badgeLabel(condition) {
  if (!condition) return '—';
  if (condition.label) return condition.label;
  switch (condition.status) {
    case 'green': return 'Looks good';
    case 'amber': return 'Usable – monitor';
    case 'red': return 'Replace now';
    default: return '—';
  }
}

function currency(n) {
  if (typeof n !== 'number') return '—';
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}
