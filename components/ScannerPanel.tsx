'use client';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { useEffect, useRef, useState } from 'react';

const actions = ['CHECK_IN','CHECK_OUT','RESTROOM_OUT','RESTROOM_IN','FIELD_TRIP_DEPART','FIELD_TRIP_RETURN'] as const;

export function ScannerPanel({ stationName='Front Desk' }: { stationName?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [code, setCode] = useState('');
  const [result, setResult] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    reader.decodeFromVideoDevice(undefined, videoRef.current!, (r) => { if (r) { setCode(r.getText()); navigator.vibrate?.(80); } });
    return () => reader.reset();
  }, []);

  async function runAction(action: string) {
    setBusy(true);
    const res = await fetch('/api/scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, action, stationName })});
    setResult(await res.json());
    setBusy(false);
  }

  return <div className="bg-white border rounded p-4 space-y-3">
    <h2 className="text-lg font-semibold">Scan Station: {stationName}</h2>
    <video ref={videoRef} className="w-full rounded bg-black min-h-64" />
    <input className="w-full border p-2" placeholder="Manual code fallback" value={code} onChange={(e)=>setCode(e.target.value)} />
    <div className="grid grid-cols-2 gap-2">{actions.map((a)=><button key={a} disabled={!code||busy} onClick={()=>runAction(a)} className="bg-slate-800 text-white rounded p-2">{a}</button>)}</div>
    {result && <pre className="text-xs bg-slate-100 p-2 overflow-auto">{JSON.stringify(result,null,2)}</pre>}
  </div>;
}
