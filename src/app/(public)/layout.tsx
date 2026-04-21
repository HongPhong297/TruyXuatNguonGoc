import PublicHeader from '@/components/layout/public-header';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-500">
        <p>🌿 Truy Xuất Nguồn Gốc Nông Sản Việt Nam — Minh bạch từng bước</p>
        <p className="mt-1">Chuẩn GS1 EPCIS · FSMA 204 · EUDR</p>
      </footer>
    </div>
  );
}
