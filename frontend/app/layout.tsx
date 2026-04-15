import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { DataProvider } from '@/components/DataProvider';
import { Sidebar }      from '@/components/Sidebar';
import { MainContent }  from '@/components/MainContent';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'ROI Dashboard',
  description: 'Affiliate performance analytics',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#0a0f1e] text-[#e2e8f0] min-h-screen font-sans">
        <DataProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <MainContent>
              {children}
            </MainContent>
          </div>
        </DataProvider>
      </body>
    </html>
  );
}
