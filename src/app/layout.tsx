import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { DataProvider } from '@/context/data-context';
import { ThemeProvider } from '@/context/theme-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sri Samundi Store & Tea Stall — Your Local Shop, Now Online',
  description:
    'Order fresh groceries, tea, daily essentials, organic produce & household supplies online with fast local home delivery and instant UPI payments.',
};

const themeScript = `
  (function() {
    try {
      var saved = localStorage.getItem('theme');
      var isDark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.className} bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 min-h-screen antialiased transition-colors duration-200`}>
        <ThemeProvider>
          <DataProvider>{children}</DataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
