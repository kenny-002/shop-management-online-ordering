import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { DataProvider } from '@/context/data-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sri Samundi Store & Tea Stall — Online Ordering',
  description:
    'Order fresh tea, snacks, daily groceries, cold drinks & household essentials online from Sri Samundi Store & Tea Stall with fast local delivery and instant UPI payment.',
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
