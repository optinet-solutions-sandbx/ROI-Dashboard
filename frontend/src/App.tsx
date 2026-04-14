import React, { useState } from 'react';
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

  return (
    <div className="app-container">
      <Sidebar onFileUpload={handleFileUpload} activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
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
