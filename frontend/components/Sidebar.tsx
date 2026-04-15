'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UploadCloud, LayoutDashboard, Users, Megaphone, Lightbulb, Table } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useData } from './DataProvider';

const tabs = [
  { href: '/overview',   label: 'Overview',  Icon: LayoutDashboard },
  { href: '/affiliates', label: 'Affiliates', Icon: Users            },
  { href: '/campaigns',  label: 'Campaigns',  Icon: Megaphone        },
  { href: '/insights',   label: 'Insights',   Icon: Lightbulb        },
  { href: '/data',       label: 'Data',       Icon: Table            },
];

export function Sidebar() {
  const pathname   = usePathname();
  const { upload } = useData();

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const name = file.name.toLowerCase();
    if (!name.endsWith('.xlsx') && !name.endsWith('.xls') && !name.endsWith('.csv')) {
      alert('Please drop an Excel file (.xlsx, .xls, or .csv)');
      return;
    }
    upload(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) upload(e.target.files[0]);
  };

  return (
    <aside className="w-64 bg-[#0d1427] border-r border-[#1e293b] h-screen sticky top-0 flex flex-col gap-6 p-5">
      <h2 className="text-[#e2e8f0] text-2xl font-bold flex items-center gap-2">
        📊 ROI Dashboard
      </h2>

      <div
        className="border-2 border-dashed border-[#1e3a5f] rounded-xl p-5 text-center cursor-pointer bg-[rgba(13,20,39,0.7)] transition-colors hover:border-[#00d4ff]"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <UploadCloud size={32} className="text-[#94a3b8] mx-auto" />
        <p className="text-xs text-[#94a3b8] my-2">Drag Excel here</p>
        <label className="inline-block bg-gradient-to-r from-sky-500 to-purple-700 text-white px-3 py-1.5 rounded-lg font-semibold cursor-pointer text-xs mt-1">
          Browse
          <input type="file" accept=".xlsx,.xls,.csv" hidden onChange={handleFileChange} />
        </label>
      </div>

      <div className="h-px bg-[#1e293b]" />

      <nav className="flex flex-col gap-2">
        {tabs.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
              pathname === href
                ? 'bg-[#1e293b]/50 text-[#e2e8f0]'
                : 'text-[#94a3b8] hover:bg-[#1e293b]/50 hover:text-[#e2e8f0]'
            )}
          >
            <Icon size={20} />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
