import React, { useState } from 'react';
import { 
  Shield, 
  Users, 
  Activity, 
  Megaphone, 
  Terminal, 
  Sliders, 
  AlertOctagon, 
  Search,
  Lock,
  Unlock,
  Key
} from 'lucide-react';
import { useDashboard } from '../contexts/DashboardContext';
import { Toast } from '../components/Toast';

interface AdminUser {
  id: string;
  email: string;
  channelName: string;
  plan: 'Free' | 'Pro' | 'Agency';
  status: 'active' | 'suspended';
  tokenStatus: 'valid' | 'expired';
  apiUnits: number;
}

interface SystemError {
  id: string;
  timestamp: string;
  source: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
}

interface AuditLog {
  id: string;
  timestamp: string;
  operator: string;
  action: string;
  target: string;
}

export const AdminPanelPage: React.FC = () => {
  const { globalBroadcast, setGlobalBroadcast } = useDashboard();
  const [activeTab, setActiveTab] = useState<'health' | 'users' | 'flags' | 'audits'>('health');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Search filter inside Users
  const [userQuery, setUserQuery] = useState('');

  // Broadcast Notification Form
  const [broadcastInput, setBroadcastInput] = useState(globalBroadcast || '');

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  // 1. Mock Users Management
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([
    { id: 'usr-1', email: 'creator1@engage.ai', channelName: 'WebDev Tutorials', plan: 'Pro', status: 'active', tokenStatus: 'valid', apiUnits: 4120 },
    { id: 'usr-2', email: 'vibe-creator@gmail.com', channelName: 'Vibe Coding', plan: 'Free', status: 'active', tokenStatus: 'valid', apiUnits: 120 },
    { id: 'usr-3', email: 'growth-brand@outlook.com', channelName: 'Growth Hacking Brand', plan: 'Agency', status: 'active', tokenStatus: 'expired', apiUnits: 18450 },
    { id: 'usr-4', email: 'spammy-bot@yahoo.com', channelName: 'Giveaway Bots Central', plan: 'Free', status: 'suspended', tokenStatus: 'expired', apiUnits: 800 }
  ]);

  // 2. Feature Flags
  const [featureFlags, setFeatureFlags] = useState([
    { key: 'autopilot-replies', name: 'Global AI autopilot replies', active: true, desc: 'Allows background cron jobs to auto-publish high-confidence replies.' },
    { key: 'maintenance-mode', name: 'Global System Maintenance Mode', active: false, desc: 'Puts application in read-only access for migrations.' },
    { key: 'double-rate-limit', name: 'Restrictive API Quota Rate Limits', active: false, desc: 'Lowers default crawlers frequency to prevent token drainage.' },
    { key: 'live-moderation', name: 'Live Moderation triggers', active: true, desc: 'Enables quick-action bans and timeout triggers.' }
  ]);

  // 3. System Errors
  const [systemErrors] = useState<SystemError[]>([
    { id: 'err-1', timestamp: '12:40 PM', source: 'YouTube API Crawler', message: 'Token refresh expired for user growth-brand@outlook.com', severity: 'high' },
    { id: 'err-2', timestamp: '11:22 AM', source: 'AI Engine', message: 'Rate limit hit for prompt completion model key', severity: 'medium' },
    { id: 'err-3', timestamp: '10:05 AM', source: 'Database Broker', message: 'Read latency spike: transaction pool count at 95%', severity: 'low' }
  ]);

  // 4. Audit Security Trail
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: 'aud-1', timestamp: '07/04/2026, 12:15 PM', operator: 'admin@engage.ai', action: 'Toggle Maintenance Flag', target: 'Global System' },
    { id: 'aud-2', timestamp: '07/04/2026, 11:45 AM', operator: 'admin@engage.ai', action: 'Upgrade user plan to Agency', target: 'growth-brand@outlook.com' },
    { id: 'aud-3', timestamp: '07/04/2026, 10:12 AM', operator: 'System Cron', action: 'Auto-suspended malicious actor', target: 'spammy-bot@yahoo.com' }
  ]);

  // Handlers
  const handlePlanChange = (userId: string, newPlan: 'Free' | 'Pro' | 'Agency') => {
    setAdminUsers(prev => prev.map(u => u.id === userId ? { ...u, plan: newPlan } : u));
    const targetEmail = adminUsers.find(u => u.id === userId)?.email || '';
    
    // Add to audit trail
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      operator: 'admin@engage.ai',
      action: `Update Subscription Plan to ${newPlan}`,
      target: targetEmail
    };
    setAuditLogs(prev => [newLog, ...prev]);
    showToast(`Upgraded user to ${newPlan} plan.`, 'success');
  };

  const handleToggleStatus = (userId: string) => {
    setAdminUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'active' ? 'suspended' : 'active';
        
        // Add to audit trail
        const newLog: AuditLog = {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toLocaleString(),
          operator: 'admin@engage.ai',
          action: `${nextStatus === 'suspended' ? 'Suspended' : 'Activated'} User Account`,
          target: u.email
        };
        setAuditLogs(prev => [newLog, ...prev]);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
    showToast('User status modified.', 'info');
  };

  const handleToggleFlag = (flagKey: string) => {
    setFeatureFlags(prev => prev.map(f => {
      if (f.key === flagKey) {
        const nextActive = !f.active;
        // Add to audit trail
        const newLog: AuditLog = {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toLocaleString(),
          operator: 'admin@engage.ai',
          action: `${nextActive ? 'Enabled' : 'Disabled'} Feature Flag: ${f.name}`,
          target: 'System Settings'
        };
        setAuditLogs(prev => [newLog, ...prev]);
        return { ...f, active: nextActive };
      }
      return f;
    }));
    showToast('System configuration changed.', 'success');
  };

  const handlePublishBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    const val = broadcastInput.trim();
    if (val) {
      if (val.length > 500) {
        showToast('Broadcast messages must be 500 characters or less.', 'error');
        return;
      }
      setGlobalBroadcast(val);
      showToast('Global system announcement broadcasted.', 'success');
    } else {
      setGlobalBroadcast(null);
      showToast('System broadcast announcement cleared.', 'info');
    }
  };

  const handleClearBroadcast = () => {
    setBroadcastInput('');
    setGlobalBroadcast(null);
    showToast('Broadcast cleared.', 'info');
  };

  const filteredUsers = adminUsers.filter(u => 
    u.email.toLowerCase().includes(userQuery.toLowerCase()) || 
    u.channelName.toLowerCase().includes(userQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-slide-in">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-3xl tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary-500" />
            <span>Engage Admin Control Center</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-semibold">
            Global system dashboard to configure parameters, adjust feature flags, monitor API limits, and manage users.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl shadow-sm">
          {[
            { id: 'health', name: 'API & Health', icon: Activity },
            { id: 'users', name: 'Users & Plans', icon: Users },
            { id: 'flags', name: 'Flags & Alerts', icon: Sliders },
            { id: 'audits', name: 'Audit Trail', icon: Terminal }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-850 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Area 1: API & Health */}
      {activeTab === 'health' && (
        <div className="space-y-8">
          {/* KPI metrics cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel border border-slate-200/50 dark:border-slate-800/50 rounded-2xl bg-white dark:bg-slate-950/40 p-6 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Total System MRR</span>
              <p className="text-3xl font-black text-slate-900 dark:text-white">$14,520</p>
              <span className="text-[10px] text-emerald-500 font-bold">↑ 8.2% this week</span>
            </div>

            <div className="glass-panel border border-slate-200/50 dark:border-slate-800/50 rounded-2xl bg-white dark:bg-slate-950/40 p-6 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Registered Users</span>
              <p className="text-3xl font-black text-slate-900 dark:text-white">412 Users</p>
              <span className="text-[10px] text-emerald-500 font-bold">↑ 24 connection sessions active</span>
            </div>

            <div className="glass-panel border border-slate-200/50 dark:border-slate-800/50 rounded-2xl bg-white dark:bg-slate-950/40 p-6 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">System Errors Logs</span>
              <p className="text-3xl font-black text-rose-500">3 Reports</p>
              <span className="text-[10px] text-slate-400 font-semibold">1 high severity report active</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* API limits gauge (Left/Center) */}
            <div className="lg:col-span-2 glass-panel border border-slate-200/50 dark:border-slate-800/50 rounded-3xl bg-white dark:bg-slate-950/40 p-6 space-y-6">
              <div>
                <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Key className="w-5 h-5 text-indigo-500" />
                  <span>Google YouTube API Quota Consumption</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Consolidated daily YouTube API quota consumption index (Unit limit: 50,000 units/day).
                </p>
              </div>

              {/* Progress limit bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300">YouTube Quota API v3</span>
                  <span className="text-indigo-500">42,150 / 50,000 Units (84%)</span>
                </div>
                <div className="h-4 w-full bg-slate-100 dark:bg-slate-900 border border-slate-200/30 dark:border-slate-800/50 rounded-full overflow-hidden">
                  <div 
                    style={{ width: '84.3%' }}
                    className="h-full bg-gradient-to-r from-indigo-400 to-indigo-500 rounded-full transition-all duration-500"
                  />
                </div>
                <p className="text-[10px] text-amber-500 font-semibold flex items-center gap-1">
                  <AlertOctagon className="w-3.5 h-3.5 text-amber-500" />
                  <span>Warning: Daily quota approaching limit. Global rate-limiting safeguards activated.</span>
                </p>
              </div>
            </div>

            {/* Error reports log (Right) */}
            <div className="glass-panel border border-slate-200/50 dark:border-slate-800/50 rounded-3xl bg-white dark:bg-slate-950/40 p-6 space-y-4">
              <div>
                <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertOctagon className="w-4.5 h-4.5 text-rose-500 animate-pulse" />
                  <span>Live System Error Reports</span>
                </h3>
              </div>

              <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
                {systemErrors.map((err) => (
                  <div key={err.id} className="text-xs border-b border-slate-100 dark:border-slate-900 pb-3.5 space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-800 dark:text-slate-200">{err.source}</span>
                      <span className={`px-1.5 py-0.2 rounded uppercase text-[8px] font-black ${
                        err.severity === 'high' 
                          ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' 
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        {err.severity}
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                      {err.message}
                    </p>
                    <span className="text-[9px] text-slate-400 block font-semibold">{err.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Area 2: Users & Plans */}
      {activeTab === 'users' && (
        <div className="glass-panel border border-slate-200/50 dark:border-slate-800/50 rounded-3xl bg-white dark:bg-slate-950/40 p-6 space-y-6 shadow-md">
          {/* Controls header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-500" />
                <span>Subscribers Account Registry</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage registered user accounts, alter subscription billing tires, or suspend user access.
              </p>
            </div>

            {/* User Search Input */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search email or channel..."
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-xs font-semibold"
              />
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 uppercase tracking-wider font-extrabold text-[9px]">
                  <th className="py-3.5 px-4 font-black">User Email</th>
                  <th className="py-3.5 px-4 font-black">Connected Channel</th>
                  <th className="py-3.5 px-4 font-black text-center">Subscription Plan</th>
                  <th className="py-3.5 px-4 text-center font-black">Daily API Usage</th>
                  <th className="py-3.5 px-4 text-center font-black">Status</th>
                  <th className="py-3.5 px-4 text-right font-black">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900 font-semibold text-slate-700 dark:text-slate-350">
                {filteredUsers.map((usr) => (
                  <tr key={usr.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-950 dark:text-white">
                      {usr.email}
                    </td>
                    <td className="py-4 px-4">
                      {usr.channelName}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <select
                        value={usr.plan}
                        onChange={(e) => handlePlanChange(usr.id, e.target.value as any)}
                        className="px-3 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none text-[11px] font-bold cursor-pointer"
                      >
                        <option value="Free">Free ($0/mo)</option>
                        <option value="Pro">Pro ($29/mo)</option>
                        <option value="Agency">Agency ($99/mo)</option>
                      </select>
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-indigo-500">
                      {usr.apiUnits} units
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        usr.status === 'active' 
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                      }`}>
                        {usr.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(usr.id)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all hover:scale-[1.02] cursor-pointer ${
                          usr.status === 'active'
                            ? 'bg-rose-500/5 text-rose-600 border-rose-500/20 hover:bg-rose-500/10'
                            : 'bg-emerald-500/5 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/10'
                        }`}
                      >
                        {usr.status === 'active' ? (
                          <>
                            <Lock className="w-3 h-3" />
                            <span>Suspend</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3 h-3" />
                            <span>Activate</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Area 3: Flags & Alerts */}
      {activeTab === 'flags' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-in">
          
          {/* Feature flags settings (Left/Center) */}
          <div className="lg:col-span-2 glass-panel border border-slate-200/50 dark:border-slate-800/50 rounded-3xl bg-white dark:bg-slate-950/40 p-6 space-y-6">
            <div>
              <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-primary-500" />
                <span>Global Feature Switches</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Toggle system integrations on/off for hotfixing or staging rolls.
              </p>
            </div>

            <div className="space-y-4">
              {featureFlags.map((flag) => (
                <div 
                  key={flag.key}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {flag.name}
                    </p>
                    <p className="text-[10px] text-slate-400 leading-normal font-semibold max-w-sm">
                      {flag.desc}
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={flag.active}
                    onChange={() => handleToggleFlag(flag.key)}
                    className="w-5 h-5 rounded border-slate-350 text-primary-600 focus:ring-primary-500 cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Broadcast controller (Right) */}
          <div className="glass-panel border border-slate-200/50 dark:border-slate-800/50 rounded-3xl bg-white dark:bg-slate-950/40 p-6 space-y-6 shadow-md">
            <div>
              <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-amber-500" />
                <span>Global System Broadcasts</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Publish site-wide announcements or upgrade schedules to all logged-in creators.
              </p>
            </div>

            <form onSubmit={handlePublishBroadcast} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
                  Broadcast Alert Message
                </label>
                <textarea
                  value={broadcastInput}
                  onChange={(e) => setBroadcastInput(e.target.value)}
                  maxLength={500}
                  placeholder="e.g. Scheduled maintenance tonight at 2:00 AM PST. SaaS features will experience brief interruptions."
                  rows={4}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-100 placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-xs font-semibold resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleClearBroadcast}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 text-xs font-bold transition-colors cursor-pointer border-none bg-transparent"
                >
                  Clear Broadcast
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer border-none"
                >
                  Publish Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab Area 4: Audit Trail */}
      {activeTab === 'audits' && (
        <div className="glass-panel border border-slate-200/50 dark:border-slate-800/50 rounded-3xl bg-white dark:bg-slate-950/40 p-6 space-y-4 shadow-md">
          <div>
            <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-500" />
              <span>System Operations Audit Log</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Secure record tracking global administrative triggers and backend security events.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 uppercase tracking-wider font-extrabold text-[9px]">
                  <th className="py-3.5 px-4 font-black">Timestamp</th>
                  <th className="py-3.5 px-4 font-black">Operator Email</th>
                  <th className="py-3.5 px-4 font-black">Performed Action</th>
                  <th className="py-3.5 px-4 font-black">Target Subject</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900 font-semibold text-slate-650 dark:text-slate-400">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                    <td className="py-4 px-4 text-slate-400 dark:text-slate-500">
                      {log.timestamp}
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-800 dark:text-slate-200">
                      {log.operator}
                    </td>
                    <td className="py-4 px-4">
                      {log.action}
                    </td>
                    <td className="py-4 px-4 font-bold text-indigo-500">
                      {log.target}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};
