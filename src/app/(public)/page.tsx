import CommodityCard from '@/components/layout/commodity-card';
import { vi } from '@/lib/i18n/vi';
import { Search, QrCode } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trang chủ',
};

const commodityList = Object.values(vi.commodities);

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-700 to-emerald-600 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4 whitespace-pre-line">
            {vi.landing.heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-green-100 mb-10">
            {vi.landing.heroSubtitle}
          </p>

          {/* Search bar */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={vi.landing.searchPlaceholder}
                className="w-full pl-9 pr-4 py-3 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
              />
            </div>
            <button className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
              {vi.landing.searchBtn}
            </button>
          </div>

          {/* QR scan button */}
          <div className="mt-4">
            <Link
              href="/trace"
              className="inline-flex items-center gap-2 border border-white text-white hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <QrCode className="w-4 h-4" />
              {vi.landing.scanBtn}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100 py-6 px-4">
        <div className="max-w-4xl mx-auto flex justify-center gap-12 flex-wrap">
          {vi.landing.stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold text-green-700">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Commodity cards */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">
          {vi.landing.featuredTitle}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {commodityList.map((c) => (
            <CommodityCard key={c.id} {...c} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-12">
            {vi.landing.howItWorksTitle}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {vi.landing.steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-3">
                <div className="w-16 h-16 rounded-full bg-white border-2 border-green-200 flex items-center justify-center text-3xl shadow-sm">
                  {step.icon}
                </div>
                {/* Connector line */}
                <p className="font-semibold text-gray-800 text-sm">{step.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA cho producer */}
      <section className="bg-green-700 text-white py-12 px-4 text-center">
        <h2 className="text-xl font-bold mb-3">Bạn là nông dân, hợp tác xã hay nhà phân phối?</h2>
        <p className="text-green-100 mb-6 text-sm">
          Đăng ký để ghi nhận hành trình sản phẩm và tạo mã QR truy xuất
        </p>
        <Link
          href="/login"
          className="inline-block bg-white text-green-700 hover:bg-green-50 font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
        >
          Đăng nhập / Đăng ký
        </Link>
      </section>
    </div>
  );
}
