import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { DataProvider } from '@/context/data-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FreshMart Local Supermarket — Your Local Shop, Now Online',
  description:
    'Order fresh groceries, daily essentials, organic produce & household supplies online with fast local home delivery and instant UPI payments.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-900 text-slate-100 min-h-screen antialiased`}>
        <DataProvider>{children}</DataProvider>
      </body>
    </html>
  );
}
