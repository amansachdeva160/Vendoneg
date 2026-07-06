import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, LayoutDashboard, FilePlus, Play, ClipboardList, FileText, Award,
  TrendingUp, ShieldAlert, Target, MessageSquare, PiggyBank, CheckCircle2,
  FileBarChart, BarChart3, Building2, Settings, Database, ChevronLeft,
  ChevronRight, Upload, Zap
} from 'lucide-react';

const navSections = [
  {
    title: 'Overview',
    items: [
      { path: '/', icon: Home, label: 'Home Portal' },
      { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/new-procurement', icon: FilePlus, label: 'Requirements & Budget' },
      { path: '/vendor-quotations', icon: Upload, label: 'Vendor Quotations' },
      { path: '/workflow', icon: Play, label: 'Workflow Manager' },
    ],
  },
  {
    title: 'AI Agents',
    items: [
      { path: '/agent/1', icon: ClipboardList, label: 'Requirements Agent' },
      { path: '/agent/2', icon: FileText, label: 'Quotation Agent' },
      { path: '/agent/3', icon: Award, label: 'Scoring Agent' },
      { path: '/agent/4', icon: TrendingUp, label: 'Market Intel Agent' },
      { path: '/agent/5', icon: ShieldAlert, label: 'Risk Agent' },
      { path: '/agent/6', icon: Target, label: 'Strategy Agent' },
      { path: '/agent/7', icon: MessageSquare, label: 'Negotiation Chat' },
      { path: '/agent/8', icon: PiggyBank, label: 'Savings Agent' },
      { path: '/agent/9', icon: CheckCircle2, label: 'Decision Agent' },
    ],
  },
  {
    title: 'Reports & Data',
    items: [
      { path: '/reports', icon: FileBarChart, label: 'Consolidated Report' },
      { path: '/analytics', icon: BarChart3, label: 'Analytics' },
      { path: '/vendors', icon: Building2, label: 'Vendor Directory' },
      { path: '/database', icon: Database, label: 'Database Inspector' },
      { path: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 280 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="h-screen sticky top-0 flex flex-col border-r border-[#253145] bg-[#0D1321] z-50 overflow-hidden"
    >
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-4 h-[68px] border-b border-[#253145] shrink-0">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0 shadow-lg shadow-[rgba(59,130,246,0.25)]">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col min-w-0"
            >
              <span className="text-[15px] font-extrabold text-white tracking-tight">
                Vendo<span className="text-[#A855F7]">neg</span>
              </span>
              <span className="text-[10px] font-medium text-[#8E7CA3] tracking-wide">
                AI procurement Agent
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-5 px-2.5 space-y-5">
        {navSections.map((section) => (
          <div key={section.title}>
            <AnimatePresence>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-widest text-[#4B5E78]"
                >
                  {section.title}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="space-y-2.5">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`
                      group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200
                      ${isActive
                        ? 'bg-[rgba(59,130,246,0.12)] text-white'
                        : 'text-[#8899B0] hover:text-white hover:bg-[rgba(255,255,255,0.04)]'
                      }
                    `}
                  >
                    <div className="relative shrink-0">
                      <item.icon className={`w-[18px] h-[18px] ${isActive ? 'text-[#3B82F6]' : 'text-[#5A6B80] group-hover:text-[#8899B0]'}`} />
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-indicator"
                          className="absolute -left-[15px] top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#3B82F6]"
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                        />
                      )}
                    </div>
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="truncate"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-[#253145] shrink-0">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[#5A6B80] hover:text-white hover:bg-[rgba(255,255,255,0.04)] transition-all"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs">
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
