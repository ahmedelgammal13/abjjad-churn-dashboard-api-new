import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// API Configuration - Update this after deploying Worker
const API_URL = process.env.REACT_APP_API_URL || 'https://abjjad-churn-dashboard-api.YOUR-SUBDOMAIN.workers.dev';

const Dashboard = () => {
  const [viewMode, setViewMode] = useState('simple');
  const [filters, setFilters] = useState({
    dateRange: 'Q1 2026',
    country: 'All',
    product: 'All'
  });
  const [cohortFilters, setCohortFilters] = useState({
    cohortMonth: 'Jan 2026',
    viewType: 'curve'
  });
  const [simpleData, setSimpleData] = useState(null);
  const [cohortData, setCohortData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch simple churn data
  useEffect(() => {
    if (viewMode === 'simple') {
      fetchSimpleChurnData();
    }
  }, [viewMode, filters]);

  // Fetch cohort data
  useEffect(() => {
    if (viewMode === 'cohort') {
      fetchCohortData();
    }
  }, [viewMode, filters, cohortFilters]);

  const fetchSimpleChurnData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        country: filters.country,
        product: filters.product,
        dateRange: filters.dateRange
      });
      
      const response = await fetch(`${API_URL}/api/simple-churn?${params}`);
      const data = await response.json();
      setSimpleData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching simple churn data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCohortData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        country: filters.country,
        product: filters.product,
        cohortMonth: cohortFilters.cohortMonth
      });
      
      const response = await fetch(`${API_URL}/api/cohort-analysis?${params}`);
      const data = await response.json();
      setCohortData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching cohort data:', error);
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({ title, value, change, suffix = '%', isPositive }) => (
    <div className="metric-card">
      <div className="metric-label">{title}</div>
      <div className="metric-value">
        {loading ? '...' : `${value}${suffix}`}
      </div>
      {!loading && change !== undefined && (
        <div className={`metric-change ${isPositive ? 'positive' : 'negative'}`}>
          {change > 0 ? '↑' : '↓'} {Math.abs(change)}% vs Q1 2025
        </div>
      )}
    </div>
  );

  const StatusBadge = ({ status }) => {
    const colors = {
      healthy: '#00ff88',
      good: '#00ff88',
      excellent: '#00ff88',
      average: '#ffaa00',
      'at-risk': '#ff4466'
    };
    return (
      <span style={{ 
        color: colors[status?.toLowerCase()] || colors.average,
        fontWeight: 600,
        fontSize: '0.875rem'
      }}>
        {status?.toUpperCase() || 'N/A'}
      </span>
    );
  };

  return (
    <div className="dashboard-container">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #0a0e1a;
          color: #e0e6ed;
        }

        .dashboard-container {
          min-height: 100vh;
          padding: 2rem;
          max-width: 1600px;
          margin: 0 auto;
        }

        .header {
          margin-bottom: 2rem;
          border-bottom: 1px solid #1e2940;
          padding-bottom: 1.5rem;
        }

        .header-title {
          font-size: 2rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 0.5rem;
          letter-spacing: -0.02em;
        }

        .header-subtitle {
          color: #8892a6;
          font-size: 0.875rem;
          font-family: 'Courier New', monospace;
        }

        .view-toggle {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          background: #0f1420;
          padding: 0.5rem;
          border-radius: 12px;
          border: 1px solid #1e2940;
        }

        .view-toggle-btn {
          flex: 1;
          padding: 0.75rem 1.5rem;
          background: transparent;
          border: none;
          color: #8892a6;
          font-weight: 600;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s;
          font-size: 0.875rem;
        }

        .view-toggle-btn.active {
          background: #1a4d8f;
          color: #00d9ff;
        }

        .filters-section {
          background: #0f1420;
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid #1e2940;
          margin-bottom: 2rem;
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-label {
          font-size: 0.75rem;
          color: #8892a6;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .filter-select {
          background: #1a2332;
          border: 1px solid #2a3547;
          color: #e0e6ed;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-select:hover {
          border-color: #00d9ff;
        }

        .filter-select:focus {
          outline: none;
          border-color: #00d9ff;
          box-shadow: 0 0 0 3px rgba(0, 217, 255, 0.1);
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .metric-card {
          background: #0f1420;
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid #1e2940;
          transition: all 0.2s;
        }

        .metric-card:hover {
          border-color: #2a3547;
          transform: translateY(-2px);
        }

        .metric-label {
          font-size: 0.75rem;
          color: #8892a6;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.75rem;
        }

        .metric-value {
          font-size: 2.5rem;
          font-weight: 700;
          font-family: 'Courier New', monospace;
          color: #fff;
          margin-bottom: 0.5rem;
        }

        .metric-change {
          font-size: 0.875rem;
          font-weight: 600;
        }

        .metric-change.positive {
          color: #00ff88;
        }

        .metric-change.negative {
          color: #ff4466;
        }

        .chart-section {
          background: #0f1420;
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid #1e2940;
          margin-bottom: 2rem;
        }

        .chart-title {
          font-size: 1rem;
          font-weight: 600;
          color: #fff;
          margin-bottom: 1.5rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th {
          text-align: left;
          padding: 1rem;
          font-size: 0.75rem;
          color: #8892a6;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #1e2940;
        }

        .data-table td {
          padding: 1rem;
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          color: #e0e6ed;
          border-bottom: 1px solid #0f1420;
        }

        .data-table tbody tr:hover {
          background: #1a2332;
        }

        .trend-indicator {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-weight: 600;
        }

        .trend-indicator.up {
          color: #ff4466;
        }

        .trend-indicator.down {
          color: #00ff88;
        }

        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(10, 14, 26, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .loading-spinner {
          border: 3px solid #1e2940;
          border-top: 3px solid #00d9ff;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .dashboard-container {
            padding: 1rem;
          }

          .metrics-grid {
            grid-template-columns: 1fr;
          }

          .filters-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

      {/* Header */}
      <div className="header">
        <h1 className="header-title">ABJJAD Subscription Health</h1>
        <div className="header-subtitle">
          {lastUpdated 
            ? `Last Updated: ${lastUpdated.toLocaleString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}`
            : 'Loading...'
          } • Daily Refresh at 06:00 UTC
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="view-toggle">
        <button 
          className={`view-toggle-btn ${viewMode === 'simple' ? 'active' : ''}`}
          onClick={() => setViewMode('simple')}
        >
          Simple Churn View
        </button>
        <button 
          className={`view-toggle-btn ${viewMode === 'cohort' ? 'active' : ''}`}
          onClick={() => setViewMode('cohort')}
        >
          Cohort Analysis
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label className="filter-label">📅 Date Range</label>
            <select 
              className="filter-select"
              value={filters.dateRange}
              onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
            >
              <option>Q1 2026</option>
              <option>Q4 2025</option>
              <option>Q1 2025</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label className="filter-label">🌍 Country</label>
            <select 
              className="filter-select"
              value={filters.country}
              onChange={(e) => setFilters({...filters, country: e.target.value})}
            >
              <option>All</option>
              <option>🇸🇦 KSA</option>
              <option>🇪🇬 Egypt</option>
              <option>🇦🇪 UAE</option>
              <option>🇺🇸 USA</option>
              <option>🇩🇪 Germany</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label className="filter-label">📦 Product Type</label>
            <select 
              className="filter-select"
              value={filters.product}
              onChange={(e) => setFilters({...filters, product: e.target.value})}
            >
              <option>All</option>
              <option>Monthly</option>
              <option>Semi-Annual</option>
              <option>Annual</option>
            </select>
          </div>
        </div>
      </div>

      {/* Simple Churn View */}
      {viewMode === 'simple' && simpleData && (
        <>
          {/* Key Metrics */}
          <div className="metrics-grid">
            <MetricCard 
              title="Churn Rate"
              value={simpleData.overall?.churnRate || 0}
              change={simpleData.overall?.vsLastYear?.churn}
              isPositive={false}
            />
            <MetricCard 
              title="Retention Rate"
              value={simpleData.overall?.retentionRate || 0}
              change={simpleData.overall?.vsLastYear?.retention}
              isPositive={true}
            />
            <MetricCard 
              title="Total Expirations"
              value={(simpleData.overall?.expirations || 0).toLocaleString()}
              change={simpleData.overall?.vsLastYear?.expirations}
              suffix=""
              isPositive={false}
            />
          </div>

          {/* Churn Trend Chart */}
          {simpleData.trendData && simpleData.trendData.length > 0 && (
            <div className="chart-section">
              <h3 className="chart-title">Churn Rate Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={simpleData.trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2940" />
                  <XAxis dataKey="month" stroke="#8892a6" />
                  <YAxis stroke="#8892a6" />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#0f1420', 
                      border: '1px solid #1e2940',
                      borderRadius: '8px',
                      color: '#e0e6ed'
                    }} 
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="churn2026" 
                    stroke="#00d9ff" 
                    strokeWidth={3}
                    name="2026"
                    dot={{ fill: '#00d9ff', r: 5 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="churn2025" 
                    stroke="#8892a6" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="2025"
                    dot={{ fill: '#8892a6', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Breakdown by Country */}
          {simpleData.byCountry && simpleData.byCountry.length > 0 && (
            <div className="chart-section">
              <h3 className="chart-title">Breakdown by Country</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Country</th>
                    <th>Churn %</th>
                    <th>Retention %</th>
                    <th>Expirations</th>
                    <th>YoY Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {simpleData.byCountry.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.country}</td>
                      <td>{row.churnRate}%</td>
                      <td>{row.retentionRate}%</td>
                      <td>{row.expirations.toLocaleString()}</td>
                      <td>
                        <span className={`trend-indicator ${row.trend > 0 ? 'up' : 'down'}`}>
                          {row.trend > 0 ? '↑' : '↓'} {Math.abs(row.trend)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Breakdown by Product */}
          {simpleData.byProduct && simpleData.byProduct.length > 0 && (
            <div className="chart-section">
              <h3 className="chart-title">Breakdown by Product Type</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Churn %</th>
                    <th>Retention %</th>
                    <th>Expirations</th>
                    <th>YoY Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {simpleData.byProduct.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.product}</td>
                      <td>{row.churnRate}%</td>
                      <td>{row.retentionRate}%</td>
                      <td>{row.expirations.toLocaleString()}</td>
                      <td>
                        <span className={`trend-indicator ${row.trend > 0 ? 'up' : 'down'}`}>
                          {row.trend > 0 ? '↑' : '↓'} {Math.abs(row.trend)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Cohort Analysis View */}
      {viewMode === 'cohort' && cohortData && (
        <>
          {/* Cohort Filters */}
          <div className="filters-section">
            <div className="filters-grid">
              <div className="filter-group">
                <label className="filter-label">📅 Cohort Month</label>
                <select 
                  className="filter-select"
                  value={cohortFilters.cohortMonth}
                  onChange={(e) => setCohortFilters({...cohortFilters, cohortMonth: e.target.value})}
                >
                  <option>Jan 2026</option>
                  <option>Dec 2025</option>
                  <option>Nov 2025</option>
                  <option>Oct 2025</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label className="filter-label">📊 View Type</label>
                <select 
                  className="filter-select"
                  value={cohortFilters.viewType}
                  onChange={(e) => setCohortFilters({...cohortFilters, viewType: e.target.value})}
                >
                  <option value="curve">Retention Curve</option>
                  <option value="table">Monthly Table</option>
                </select>
              </div>
            </div>
          </div>

          {/* Retention Curve */}
          {cohortFilters.viewType === 'curve' && cohortData.retentionCurve && (
            <div className="chart-section">
              <h3 className="chart-title">Cohort Retention Curve</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={cohortData.retentionCurve}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2940" />
                  <XAxis dataKey="month" stroke="#8892a6" />
                  <YAxis stroke="#8892a6" domain={[60, 100]} />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#0f1420', 
                      border: '1px solid #1e2940',
                      borderRadius: '8px',
                      color: '#e0e6ed'
                    }} 
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="jan2026" 
                    stroke="#00ff88" 
                    strokeWidth={3}
                    name="Jan 2026 Cohort"
                    dot={{ fill: '#00ff88', r: 5 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="jan2025" 
                    stroke="#8892a6" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Jan 2025 Cohort"
                    dot={{ fill: '#8892a6', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Cohort Comparison Table */}
          {cohortData.cohorts && cohortData.cohorts.length > 0 && (
            <div className="chart-section">
              <h3 className="chart-title">Cohort Comparison</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Cohort</th>
                    <th>Size</th>
                    <th>M1 Retention</th>
                    <th>M2 Retention</th>
                    <th>M3 Retention</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {cohortData.cohorts.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.cohort}</td>
                      <td>{row.size.toLocaleString()}</td>
                      <td>{row.m1}%</td>
                      <td>{row.m2}%</td>
                      <td>{row.m3}%</td>
                      <td><StatusBadge status={row.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Breakdown by Product Type */}
          {cohortData.byProduct && cohortData.byProduct.length > 0 && (
            <div className="chart-section">
              <h3 className="chart-title">Cohort Performance by Product Type</h3>
              <div style={{ marginBottom: '1rem', color: '#8892a6', fontSize: '0.875rem' }}>
                {cohortFilters.cohortMonth} Cohort Analysis
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product Type</th>
                    <th>Cohort Size</th>
                    <th>M3 Retention</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {cohortData.byProduct.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.product}</td>
                      <td>{row.cohortSize.toLocaleString()}</td>
                      <td>{row.m3Retention}%</td>
                      <td><StatusBadge status={row.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
