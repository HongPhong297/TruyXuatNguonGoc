/**
 * Header công khai — hiển thị trên tất cả trang public
 */
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { vi } from '@/lib/i18n/vi';
import { Menu, X, QrCode } from 'lucide-react';

export default function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-green-700 text-lg">
          <span className="text-2xl">🌿</span>
          <span className="hidden sm:inline">{vi.app.shortName}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-green-700 transition-colors">
            {vi.nav.home}
          </Link>
          <Link href="/trace" className="hover:text-green-700 transition-colors">
            {vi.nav.trace}
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/trace"
            className="hidden sm:inline-flex items-center gap-1 border border-gray-300 text-gray-700 hover:border-green-500 hover:text-green-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            <QrCode className="w-4 h-4" />
            {vi.nav.scanQr}
          </Link>
          <Link
            href="/login"
            className="bg-green-700 hover:bg-green-800 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            {vi.nav.login}
          </Link>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-white px-4 py-3 flex flex-col gap-3 text-sm">
          <Link href="/" onClick={() => setMobileOpen(false)} className="py-1 text-gray-700">
            {vi.nav.home}
          </Link>
          <Link href="/trace" onClick={() => setMobileOpen(false)} className="py-1 text-gray-700">
            {vi.nav.scanQr}
          </Link>
          <Link href="/login" onClick={() => setMobileOpen(false)} className="py-1 text-gray-700">
            {vi.nav.login}
          </Link>
        </div>
      )}
    </header>
  );
}
