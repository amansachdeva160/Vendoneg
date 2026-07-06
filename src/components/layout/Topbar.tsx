import { useLocation } from 'react-router-dom';
import { Bell, Search, User, Zap, Bot } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const routeNames: Record<string, string> = {
  '/': 'Portal Homepage',
  '/dashboard': 'Dashboard',
  '/new-procurement': 'Requirements & Budget',
  '/vendor-quotations': 'Vendor Quotation Upload',
  '/workflow': 'Workflow Manager',
  '/agent/1': 'Requirements & Budget Agent',
  '/agent/2': 'Vendor Quotation Agent',
  '/agent/3': 'Vendor Scoring Agent',
  '/agent/4': 'Market Intelligence Agent',
  '/agent/5': 'Risk Detection Agent',
  '/agent/6': 'Negotiation Strategy Agent',
  '/agent/7': 'Negotiation Chat Agent',
  '/agent/8': 'Savings Prediction Agent',
  '/agent/9': 'Final Decision Agent',
  '/reports': 'Consolidated Report',
  '/analytics': 'Analytics',
  '/vendors': 'Vendor Directory',
  '/database': 'Database Inspector',
  '/settings': 'Settings',
};

export default function Topbar() {
  const location = useLocation();
  const { isDemoMode, loadDemoData, resetWorkflow } = useApp();
  const pageName = routeNames[location.pathname] || 'Vendoneg';

  return (
    <header className="h-16 border-b border-[#253145] bg-[rgba(15,23,42,0.85)] backdrop-blur-xl sticky top-0 z-40 flex items-center justify-between px-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <span className="text-[#5A6B80] text-sm">Vendoneg</span>
        <span className="text-[#344563]">/</span>
        <span className="text-white text-sm font-medium">{pageName}</span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-[#131B2E] border border-[#253145] rounded-xl px-3 py-2 w-64">
          <Search className="w-4 h-4 text-[#5A6B80]" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm text-white placeholder-[#5A6B80] outline-none w-full"
          />
          <kbd className="hidden lg:inline text-[10px] text-[#5A6B80] bg-[#0F172A] px-1.5 py-0.5 rounded border border-[#253145]">⌘K</kbd>
        </div>

        {/* Demo Mode Clickable Toggle */}
        <button
          onClick={() => {
            if (isDemoMode) {
              resetWorkflow();
            } else {
              loadDemoData();
            }
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
            isDemoMode
               ? 'bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.25)] text-[#10B981] hover:bg-[rgba(16,185,129,0.15)] shadow-md shadow-[rgba(16,185,129,0.05)] cursor-pointer'
              : 'bg-[rgba(59,130,246,0.05)] border-[rgba(59,130,246,0.15)] text-[#8899B0] hover:text-white hover:bg-[rgba(59,130,246,0.1)] cursor-pointer'
          }`}
          title={isDemoMode ? "Click to clear demo data and reset" : "Click to load complete demo run"}
        >
          <Zap className={`w-3.5 h-3.5 ${isDemoMode ? 'text-[#10B981] fill-[#10B981]' : 'text-[#8899B0]'}`} />
          <span>{isDemoMode ? 'Demo Active' : 'Run Demo'}</span>
        </button>

        {/* AI Copilot toggle */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('toggle-copilot'))}
          className="p-2 rounded-xl hover:bg-[rgba(255,255,255,0.04)] text-[#94A3B8] hover:text-white transition-colors"
          title="Open AI Copilot"
        >
          <Bot className="w-[18px] h-[18px]" />
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl hover:bg-[rgba(255,255,255,0.04)] transition-colors">
          <Bell className="w-[18px] h-[18px] text-[#94A3B8]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#3B82F6] rounded-full" />
        </button>

        {/* User Avatar */}
        <button className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[rgba(255,255,255,0.04)] transition-colors">
          <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        </button>
      </div>
    </header>
  );
}
