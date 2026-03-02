'use client';
import { QRCodeSVG } from 'qrcode.react';
import JsBarcode from 'jsbarcode';
import { useEffect, useRef } from 'react';

export function CamperCard({ camper, orgName, token }: { camper: any; orgName: string; token: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  useEffect(() => { if (svgRef.current) JsBarcode(svgRef.current, token, { format: 'CODE128', width: 2, height: 40 }); }, [token]);
  return <div className="max-w-lg mx-auto bg-white border p-6 print:shadow-none shadow">
    <div className="flex gap-4 items-center"><div className="w-20 h-20 bg-slate-200 rounded"> </div><div><h1 className="text-2xl font-bold">{camper.name}</h1><p>{camper.camperCode}</p><p>{orgName}</p></div></div>
    <div className="grid grid-cols-2 mt-4 gap-4 items-center"><QRCodeSVG value={token} size={140} /><svg ref={svgRef} /></div>
    <p className="mt-2 text-sm">Emergency: {camper.emergencyPhone}</p>
  </div>;
}
