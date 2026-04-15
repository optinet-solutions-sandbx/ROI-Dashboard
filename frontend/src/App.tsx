import { useState } from 'react';
import { BarChart3, LayoutDashboard, Users, Megaphone, Lightbulb, Table, Menu } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { parseExcelFile } from './utils/excelParser';
import type { PerformanceRecord } from './utils/kpiEngine';
import { Overview } from './pages/Overview';
import { Affiliates } from './pages/Affiliates';
import { Campaigns } from './pages/Campaigns';
import { Insights } from './pages/Insights';
import { Data } from './pages/Data';

const TABS = [
  { id: 'Overview',   label: 'Overview',   Icon: LayoutDashboard },
  { id: 'Affiliates', label: 'Affiliates',  Icon: Users           },
  { id: 'Campaigns',  label: 'Campaigns',   Icon: Megaphone       },
  { id: 'Insights',   label: 'Insights',    Icon: Lightbulb       },
  { id: 'Data',       label: 'Data',        Icon: Table           },
];

function App() {
  const [data, setData]               = useState<PerformanceRecord[]>([]);
  const [activeTab, setActiveTab]     = useState('Overview');
  const [loading, setLoading]         = useState(false);
  const [isDraggingOver, setDragging] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleFileUpload = async (file: File) => {
    try {
      setLoading(true);
      const parsedData = await parseExcelFile(file);
      setData(parsedData);
    } catch (error) {
      console.error('Error parsing excel:', error);
      alert('Failed to parse Excel file. Make sure it is valid.');
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver  = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const name = file.name.toLowerCase();
    if (!name.endsWith('.xlsx') && !name.endsWith('.xls') && !name.endsWith('.csv')) {
      alert('Please drop an Excel file (.xlsx, .xls, or .csv)');
      return;
    }
    handleFileUpload(file);
  };

  const switchTab = (tab: string) => { setActiveTab(tab); setSidebarOpen(false); };

  return (
    <div className="app-root">

      {/* ── Mobile Top Header ── */}
      <header className="mobile-header">
        <div className="mobile-header__logo">
          <BarChart3 size={18} className="mobile-header__logo-icon" />
          <span>ROI Dashboard</span>
        </div>
        <button className="hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
          <Menu size={20} />
        </button>
      </header>

      {/* ── Sidebar Overlay (mobile) ── */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar
        onFileUpload={handleFileUpload}
        activeTab={activeTab}
        setActiveTab={switchTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ── Main Content ── */}
      <main
        className="main-content"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDraggingOver && (
          <div className="drop-overlay">
            <div className="drop-overlay__inner">
              <p>Drop your Excel file here</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="loading-state">
            <div className="spinner" />
            <p>Processing dataset…</p>
          </div>
        )}

        {!loading && data.length === 0 && (
          <div className="empty-state">
            <div className="empty-state__icon">
              <BarChart3 size={34} />
            </div>
            <h2>Ready to analyze</h2>
            <p>
              Upload your affiliate performance data via the sidebar to generate
              instant KPI dashboards and insights.
            </p>
          </div>
        )}

        {!loading && data.length > 0 && (
          <div className="fade-in">
            {activeTab === 'Overview'   && <Overview   data={data} />}
            {activeTab === 'Affiliates' && <Affiliates data={data} />}
            {activeTab === 'Campaigns'  && <Campaigns  data={data} />}
            {activeTab === 'Insights'   && <Insights   data={data} />}
            {activeTab === 'Data'       && <Data       data={data} />}
          </div>
        )}
      </main>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="mobile-bottom-nav">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`mobile-bottom-nav__item${activeTab === id ? ' active' : ''}`}
            onClick={() => switchTab(id)}
          >
            <Icon size={18} />
            <span className="mobile-bottom-nav__label">{label}</span>
          </button>
        ))}
      </nav>

    </div>
  );
}

export default App;
