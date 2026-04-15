import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { parseExcelFile } from './utils/excelParser';
import type { PerformanceRecord } from './utils/kpiEngine';
import { Overview } from './pages/Overview';
import { Affiliates } from './pages/Affiliates';
import { Campaigns } from './pages/Campaigns';
import { Insights } from './pages/Insights';

function App() {
  const [data, setData] = useState<PerformanceRecord[]>([]);
  const [activeTab, setActiveTab] = useState('Overview');
  const [loading, setLoading] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDraggingOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="app-container">
      <Sidebar onFileUpload={handleFileUpload} activeTab={activeTab} setActiveTab={setActiveTab} />
      <main
        className="main-content"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{ position: 'relative' }}
      >
        {isDraggingOver && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            borderRadius: '8px',
          }}>
            <div style={{
              border: '2px dashed #7c3aed',
              borderRadius: '12px',
              padding: '48px 64px',
              textAlign: 'center',
            }}>
              <p style={{ color: '#e2e8f0', fontSize: '1.25rem', fontWeight: 600 }}>
                Drop your Excel file here
              </p>
            </div>
          </div>
        )}
        {loading && <p>Processing Dataset...</p>}
        {!loading && data.length === 0 ? (
          <div className="empty-state">
            <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>Ready to analyze</h2>
            <p style={{ color: '#94a3b8', maxWidth: '400px', textAlign: 'center' }}>
              Upload your affiliate performance data via the sidebar to generate instant KPI dashboards and insights.
            </p>
          </div>
        ) : !loading && data.length > 0 ? (
          <div className="fade-in">
            {activeTab === 'Overview' && <Overview data={data} />}
            {activeTab === 'Affiliates' && <Affiliates data={data} />}
            {activeTab === 'Campaigns' && <Campaigns data={data} />}
            {activeTab === 'Insights' && <Insights data={data} />}
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default App;
