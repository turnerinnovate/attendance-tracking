import './globals.css';
import Link from 'next/link';
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"><body>
      <header className="no-print bg-white border-b p-3 flex gap-3 text-sm">
        <Link href="/staff/dashboard">Dashboard</Link><Link href="/kiosk">Kiosk</Link><Link href="/scan">Scan</Link>
      </header>
      <main className="p-4">{children}</main>
    </body></html>
  );
}
