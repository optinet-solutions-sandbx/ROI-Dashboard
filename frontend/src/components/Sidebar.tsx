import React from 'react';
import { UploadCloud, LayoutDashboard, Users, Megaphone, Lightbulb } from 'lucide-react';

interface SidebarProps {
  onFileUpload: (file: File) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onFileUpload, activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'Overview', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'Affiliates', label: 'Affiliates', icon: <Users size={20} /> },
    { id: 'Campaigns', label: 'Campaigns', icon: <Megaphone size={20} /> },
    { id: 'Insights', label: 'Insights', icon: <Lightbulb size={20} /> },
  ];

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <aside className="sidebar">
      <h2>📊 RIO Dashboard</h2>
      
      <div 
        className="uploader-box" 
        style={{ padding: '20px', margin: '20px 0', border: '2px dashed #1e3a5f' }}
        onDragOver={handleDragOver} 
        onDrop={handleDrop}
      >
        <UploadCloud size={32} color="#94a3b8" />
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '8px 0' }}>Drag Excel here</p>
        <label className="uploader-btn" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'inline-block' }}>
          Browse
          <input type="file" accept=".xlsx,.xls,.csv" hidden onChange={handleFileChange} />
        </label>
      </div>

      <div className="sidebar-divider"></div>

      <div className="nav-links">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
    </aside>
  );
};
