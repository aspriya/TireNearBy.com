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
          <div className="rounded-[10px] bg-white p-4 text-sm space-y-2 shadow-sm">
            <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Analysis
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
              {Object.entries(result).map(([k,v]) => (
                <div key={k} className="flex items-start gap-2">
                  <span className="text-zinc-500 capitalize text-xs tracking-wide mt-0.5 w-24">{k}</span>
                  <span className="text-zinc-800 text-sm font-medium break-words">{String(v) || '—'}</span>
                </div>
              ))}
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
