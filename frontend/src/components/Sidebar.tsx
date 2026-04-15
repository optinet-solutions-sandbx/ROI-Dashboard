import React from 'react';
import {
  UploadCloud, LayoutDashboard, Users, Megaphone,
  Lightbulb, Table, BarChart3, X,
} from 'lucide-react';

interface SidebarProps {
  onFileUpload: (file: File) => void;
  activeTab:    string;
  setActiveTab: (tab: string) => void;
  isOpen:       boolean;
  onClose:      () => void;
}

const TABS = [
  { id: 'Overview',   label: 'Overview',   Icon: LayoutDashboard },
  { id: 'Affiliates', label: 'Affiliates',  Icon: Users           },
  { id: 'Campaigns',  label: 'Campaigns',   Icon: Megaphone       },
  { id: 'Insights',   label: 'Insights',    Icon: Lightbulb       },
  { id: 'Data',       label: 'Raw Data',    Icon: Table           },
];

export const Sidebar: React.FC<SidebarProps> = ({
  onFileUpload, activeTab, setActiveTab, isOpen, onClose,
}) => {

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
    onFileUpload(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) onFileUpload(e.target.files[0]);
  };

  return (
    <aside className={`sidebar${isOpen ? ' open' : ''}`}>

      {/* Close button — visible on mobile only via CSS */}
      <button className="sidebar__close-btn" onClick={onClose} aria-label="Close menu">
        <X size={15} />
      </button>

      {/* Brand */}
      <div className="sidebar__logo">
        <BarChart3 size={22} className="sidebar__logo-icon" />
        <div>
          <div className="sidebar__logo-text">ROI Dashboard</div>
          <span className="sidebar__logo-sub">Affiliate Intelligence</span>
        </div>
      </div>

      {/* Upload */}
      <div className="sidebar__upload-section">
        <span className="sidebar__upload-label">Data Source</span>
        <div
          className="upload-dropzone"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="upload-dropzone__icon">
            <UploadCloud size={26} />
          </div>
          <p className="upload-dropzone__text">
            Drag &amp; drop an Excel or CSV file, or browse below.
          </p>
          <label className="upload-btn">
            <UploadCloud size={13} />
            Browse File
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              hidden
              onChange={handleFileChange}
            />
          </label>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        <div className="sidebar__nav-label">Navigation</div>
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`nav-item${activeTab === id ? ' active' : ''}`}
            onClick={() => setActiveTab(id)}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </nav>

    </aside>
  );
};
