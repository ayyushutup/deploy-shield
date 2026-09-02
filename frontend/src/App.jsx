import React, { useState, useEffect, useContext } from 'react';

const API_BASE = import.meta.env.VITE_API_SERVER_URL || 'http://localhost:5000';
const GATEWAY_BASE = 'http://localhost:8000';

export default function App() {
  const [apps, setApps] = useState([]);
  const [securityLogs, setSecurityLogs] = useState([]);
  const [stats, setStats] = useState({
    totalScored: 0,
    totalBlocked: 0,
    blocksByType: {}
  });

  // Deploy form state
  const [repoUrl, setRepoUrl] = useState('');
  const [appName, setAppName] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployFeedback, setDeployFeedback] = useState(null);

  // Security controls state
  const [sensitivity, setSensitivity] = useState(0.8);
  const [testPayload, setTestPayload] = useState('GET /apps/sample-app-1/search?q=UNION SELECT 1,2,3');
  const [testResult, setTestResult] = useState(null);

  // Fetch real telemetry from api-server
  const fetchDashboardData = async () => {
    try {
      const [appsRes, logsRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/api/apps`),
        fetch(`${API_BASE}/api/logs`),
        fetch(`${API_BASE}/api/stats`)
      ]);

      if (appsRes.ok) setApps(await appsRes.json());
      if (logsRes.ok) setSecurityLogs(await logsRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (err) {
      console.error('Error connecting to API server:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSensitivityChange = async (newVal) => {
    setSensitivity(newVal);
    try {
      await fetch(`${GATEWAY_BASE}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threshold: newVal })
      });
    } catch (err) {
      console.error('Error updating gateway sensitivity:', err);
    }
  };

  const runTestPayload = async () => {
    setTestResult({ status: 'testing', message: 'Sending test request to gateway...' });
    try {
      const targetUrl = `${GATEWAY_BASE}${testPayload.replace(/^(GET|POST|PUT|DELETE)\s+/, '')}`;
      const method = testPayload.startsWith('POST') ? 'POST' : 'GET';
      const res = await fetch(targetUrl, { method });
      const data = await res.json().catch(() => ({}));

      if (res.status === 403) {
        setTestResult({
          status: 'blocked',
          title: '⛔ BLOCKED BY DEPLOYSHIELD WAF',
          threat: data.threatDetected || 'MALICIOUS PAYLOAD',
          confidence: data.confidenceScore ? `${(data.confidenceScore * 100).toFixed(1)}%` : 'HIGH'
        });
      } else {
        setTestResult({
          status: 'allowed',
          title: '✅ ALLOWED (BENIGN TRAFFIC)',
          statusCode: res.status
        });
      }
      fetchDashboardData();
    } catch (err) {
      setTestResult({ status: 'error', message: `Test connection error: ${err.message}` });
    }
  };

  const handleDeploy = async (e) => {
    e.preventDefault();
    if (!repoUrl) return;

    setIsDeploying(true);
    setDeployFeedback({ type: 'info', message: 'Triggering deployment build...' });

    try {
      const res = await fetch(`${API_BASE}/api/apps/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl, name: appName || 'My Application' })
      });

      const data = await res.json();
      if (res.ok) {
        setDeployFeedback({
          type: 'success',
          message: `Deployment initiated successfully! App ID: ${data.app.id}`
        });
        setRepoUrl('');
        setAppName('');
        fetchDashboardData();
      } else {
        setDeployFeedback({
          type: 'error',
          message: `Deployment failed: ${data.error}`
        });
      }
    } catch (err) {
      setDeployFeedback({
        type: 'error',
        message: `Network error triggering deploy: ${err.message}`
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const fillSampleApp = () => {
    setRepoUrl('local://sample-app');
    setAppName('Sample Express Service');
  };

  if (!token) {
  const handleLogin = async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok) {
      login(data.token);
    } else {
      alert(data.error || 'Login failed');
    }
  };
  return (
    <div className="login-container" style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', background: 'var(--bg-card)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>DeployShield Admin Login</h2>
      <form onSubmit={handleLogin}>
        <input name="username" placeholder="Username" required style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem' }} />
        <input name="password" type="password" placeholder="Password" required style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem' }} />
        <button type="submit" style={{ width: '100%', padding: '0.5rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '4px' }}>Login</button>
      </form>
    </div>
  );
}
return (
    <div className="dashboard-layout">
      <header>
        <div className="brand">
          🛡️ DeployShield
          <span className="brand-badge">Consumer AI Security Shield</span>
        </div>
        <div className="status-indicator">
          <span style={{ color: 'var(--accent-success)', fontWeight: 600 }}>
            ● AI Gateway Guard Active
          </span>
        </div>
      </header>

      <main className="dashboard-grid">
        {/* Top Metric Bar */}
        <div className="card full-width">
          <div className="card-title">Security & ML Runtime Telemetry</div>
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-label">Total Requests Evaluated</div>
              <div className="stat-value" style={{ color: 'var(--accent-blue)' }}>
                {stats.totalScored}
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Blocked Malicious Requests</div>
              <div className="stat-value" style={{ color: 'var(--accent-danger)' }}>
                {stats.totalBlocked}
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-label">SQL Injection Blocks</div>
              <div className="stat-value">{stats.blocksByType.SQLI || stats.blocksByType.SQLi || 0}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">XSS Attacks Blocked</div>
              <div className="stat-value">{stats.blocksByType.XSS || 0}</div>
            </div>
          </div>
        </div>

        {/* Consumer Controls & Live Threat Simulator */}
        <div className="card full-width" style={{ background: 'linear-gradient(180deg, #1e293b, #0f172a)', border: '1px solid #3b82f6' }}>
          <div className="card-title" style={{ color: '#38bdf8' }}>⚙️ Consumer Security Sensitivity & Live Attack Simulator</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
            
            {/* Sensitivity Slider */}
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>AI Protection Strictness Slider:</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <input
                  type="range"
                  min="0.5"
                  max="0.95"
                  step="0.05"
                  value={sensitivity}
                  onChange={(e) => handleSensitivityChange(parseFloat(e.target.value))}
                  style={{ flex: 1, accentColor: '#38bdf8' }}
                />
                <span style={{ fontWeight: 700, color: '#38bdf8', minWidth: '45px' }}>{(sensitivity * 100).toFixed(0)}%</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                {sensitivity <= 0.65 ? '🟢 Relaxed Mode (Fewer false alarms)' : sensitivity >= 0.85 ? '🔴 Paranoid Mode (Max security for e-commerce)' : '🟡 Balanced Mode (Recommended default)'}
              </div>
            </div>

            {/* Attack Simulator */}
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Instant Attack Simulator:</div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  value={testPayload}
                  onChange={(e) => setTestPayload(e.target.value)}
                  style={{ flex: 1, padding: '0.4rem 0.8rem', background: '#090d16', border: '1px solid #334155', color: '#fff', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.85rem' }}
                />
                <button
                  onClick={runTestPayload}
                  style={{ padding: '0.4rem 1rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Test Gateway
                </button>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
                <button onClick={() => setTestPayload('/apps/sample-app-1/search?q=UNION SELECT 1,2,3')} style={{ background: '#1e293b', border: '1px solid #475569', color: '#cbd5e1', borderRadius: '3px', cursor: 'pointer' }}>Test SQLi</button>
                <button onClick={() => setTestPayload('/apps/sample-app-1/?user=<script>alert(1)</script>')} style={{ background: '#1e293b', border: '1px solid #475569', color: '#cbd5e1', borderRadius: '3px', cursor: 'pointer' }}>Test XSS</button>
                <button onClick={() => setTestPayload('/apps/sample-app-1/exec?cmd=cat /etc/passwd')} style={{ background: '#1e293b', border: '1px solid #475569', color: '#cbd5e1', borderRadius: '3px', cursor: 'pointer' }}>Test CmdI</button>
              </div>

              {testResult && (
                <div style={{ 
                  marginTop: '0.75rem', 
                  padding: '0.5rem 0.8rem', 
                  borderRadius: '4px', 
                  fontSize: '0.85rem', 
                  background: testResult.status === 'blocked' || testResult.status === 'error' ? 'rgba(239,68,68,0.2)' : testResult.status === 'testing' ? 'rgba(56,189,248,0.2)' : 'rgba(16,185,129,0.2)', 
                  border: `1px solid ${testResult.status === 'blocked' || testResult.status === 'error' ? '#ef4444' : testResult.status === 'testing' ? '#38bdf8' : '#10b981'}`, 
                  color: testResult.status === 'blocked' || testResult.status === 'error' ? '#fca5a5' : testResult.status === 'testing' ? '#bae6fd' : '#6ee7b7' 
                }}>
                  {testResult.status === 'error' ? (
                    <span><strong>⚠️ Connection Error:</strong> {testResult.message}</span>
                  ) : testResult.status === 'testing' ? (
                    <span><strong>⏳ Testing:</strong> {testResult.message}</span>
                  ) : (
                    <span><strong>{testResult.title}</strong> {testResult.threat ? `— Category: ${testResult.threat} (${testResult.confidence})` : ''}</span>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Deploy New App Card */}
        <div className="card full-width">
          <div className="card-title">Deploy Application</div>
          <form onSubmit={handleDeploy} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Git Repository URL or local://sample-app"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              style={{
                flex: 2,
                minWidth: '280px',
                padding: '0.6rem 1rem',
                background: '#0f172a',
                border: '1px solid var(--bg-card-border)',
                color: '#fff',
                borderRadius: '6px'
              }}
              required
            />
            <input
              type="text"
              placeholder="Application Name (optional)"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              style={{
                flex: 1,
                minWidth: '180px',
                padding: '0.6rem 1rem',
                background: '#0f172a',
                border: '1px solid var(--bg-card-border)',
                color: '#fff',
                borderRadius: '6px'
              }}
            />
            <button
              type="submit"
              disabled={isDeploying}
              style={{
                padding: '0.6rem 1.2rem',
                background: 'linear-gradient(135deg, #6366f1, #38bdf8)',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {isDeploying ? 'Deploying...' : 'Deploy App'}
            </button>
            <button
              type="button"
              onClick={fillSampleApp}
              style={{
                padding: '0.6rem 1rem',
                background: 'transparent',
                border: '1px solid var(--accent-blue)',
                color: 'var(--accent-blue)',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Use Sample App
            </button>
          </form>

          {deployFeedback && (
            <div
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                background: deployFeedback.type === 'error' ? 'rgba(244,63,94,0.15)' : 'rgba(16,185,129,0.15)',
                color: deployFeedback.type === 'error' ? 'var(--accent-danger)' : 'var(--accent-success)',
                border: `1px solid ${deployFeedback.type === 'error' ? 'var(--accent-danger)' : 'var(--accent-success)'}`
              }}
            >
              {deployFeedback.message}
            </div>
          )}
        </div>

        {/* Deployed Apps Registry */}
        <div className="card">
          <div className="card-title">
            Deployed Apps Registry ({apps.length})
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>App ID</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Gateway Gateway URL</th>
                </tr>
              </thead>
              <tbody>
                {apps.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      No applications deployed yet
                    </td>
                  </tr>
                ) : (
                  apps.map((app) => (
                    <tr key={app.id}>
                      <td className="code-font">{app.id}</td>
                      <td>{app.name}</td>
                      <td>
                        <span className={`badge ${app.status === 'running' ? 'badge-running' : 'badge-blocked'}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="code-font">
                        <a
                          href={`${GATEWAY_BASE}/apps/${app.id}/`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}
                        >
                          /apps/{app.id}/
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Security Threat Stream */}
        <div className="card">
          <div className="card-title">
            Live Blocked Threat Logs ({securityLogs.length})
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Attack Type</th>
                  <th>Target Path</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {securityLogs.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      No threat activity recorded yet. Send malicious traffic to trigger blocks!
                    </td>
                  </tr>
                ) : (
                  securityLogs.map((evt) => (
                    <tr key={evt.id}>
                      <td className="code-font" style={{ fontSize: '0.8rem' }}>
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--accent-warning)' }}>
                          {evt.attackType}
                        </span>{' '}
                        ({(evt.confidence * 100).toFixed(0)}%)
                      </td>
                      <td
                        className="code-font"
                        style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      >
                        {evt.path}
                      </td>
                      <td>
                        <span className="badge badge-blocked">{evt.action}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
