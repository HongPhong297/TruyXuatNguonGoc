import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import NotificationToastListener from '@/components/notifications/notification-toast-listener';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Truy Xuất Nguồn Gốc Nông Sản',
    template: '%s | Truy Xuất Nông Sản',
  },
  description: 'Truy xuất nguồn gốc minh bạch từ nông trại đến bàn ăn — cà phê, gạo, rau sạch Việt Nam',
  keywords: ['truy xuất nguồn gốc', 'nông sản', 'cà phê', 'gạo', 'rau sạch', 'QR code'],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${geistSans.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-gray-50">
        {children}
        <NotificationToastListener />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
