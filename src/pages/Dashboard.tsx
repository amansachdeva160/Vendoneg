import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign, Building2, Award, TrendingDown, Percent, ShieldCheck,
  BarChart3, CheckCircle2, ArrowUpRight, Zap, Play,
  Clock, Activity, ShieldAlert, BarChart as ChartIcon
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../lib/utils';
import { DEMO_REQUEST } from '../lib/demo-data';

// Animated counter hook
function useAnimatedCounter(target: number, duration = 1500) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const COLORS = ['#A855F7', '#3B82F6', '#00E676', '#F59E0B', '#EF4444'];

export default function Dashboard() {
  const { sharedMemory, isDemoMode, loadDemoData, startWorkflow, activities, currentRequest, workflowRun } = useApp();
  const navigate = useNavigate();
  const [demoRunning, setDemoRunning] = useState(false);

  const handleRunDemo = async () => {
    if (demoRunning) return;
    setDemoRunning(true);
    await startWorkflow(DEMO_REQUEST);
    setDemoRunning(false);
  };

  const decision = sharedMemory.finalDecision;
  const savings = sharedMemory.savingsPrediction;
  const scores = sharedMemory.scores || [];
  const risks = sharedMemory.riskAssessment;
  const quotations = sharedMemory.quotations || [];

  // Metrics calculation
  const totalVendors = quotations.length || 5;
  const totalSavings = decision?.savings || 67500;
  const averageScore = scores.length
    ? Math.round((scores.reduce((sum, s) => sum + s.totalScore, 0) / scores.length) * 10) / 10
    : 84.0;
  const activeRfqsCount = currentRequest ? 1 : (isDemoMode ? 1 : 0);
  
  // Count risks
  const riskAlertsCount = risks?.vendorRisks.filter(r => r.riskLevel === 'medium' || r.riskLevel === 'high').length || 2;
  const negotiationCount = quotations.length || 5;

  // KPI data
  const kpis = [
    {
      title: 'Total Vendors',
      value: totalVendors.toString(),
      change: '+2 new',
      icon: Building2,
      color: 'from-[#A855F7] to-[#3B82F6]',
      glow: 'shadow-[0_0_20px_rgba(168,85,247,0.15)]',
    },
    {
      title: 'Procurement Savings',
      value: formatCurrency(totalSavings),
      change: '10.5% saved',
      icon: TrendingDown,
      color: 'from-[#00E676] to-[#3B82F6]',
      glow: 'shadow-[0_0_20px_rgba(0,230,118,0.15)]',
    },
    {
      title: 'Avg. Procurement Score',
      value: `${averageScore}/100`,
      change: 'Weighted',
      icon: Award,
      color: 'from-[#3B82F6] to-[#A855F7]',
      glow: 'shadow-[0_0_20px_rgba(59,130,246,0.15)]',
    },
    {
      title: 'Active RFQs',
      value: activeRfqsCount.toString(),
      change: 'In-progress',
      icon: Zap,
      color: 'from-[#F59E0B] to-[#EF4444]',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    },
    {
      title: 'Risk Alerts',
      value: riskAlertsCount.toString(),
      change: 'Medium-High',
      icon: ShieldAlert,
      color: 'from-[#EF4444] to-[#F59E0B]',
      glow: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]',
    },
    {
      title: 'Negotiation Openings',
      value: `${negotiationCount} sessions`,
      change: 'BATNA model',
      icon: DollarSign,
      color: 'from-[#00E676] to-[#F59E0B]',
      glow: 'shadow-[0_0_20px_rgba(0,230,118,0.15)]',
    },
  ];

  // 1. Vendor Comparison
  const scoreChartData = scores.map(s => ({
    name: s.vendorName.split(' ')[0],
    Price: s.priceScore,
    Quality: s.qualityScore,
    Delivery: s.deliveryScore,
    Warranty: s.warrantyScore,
  }));

  // 2. Price Trend & Comparison
  const priceChartData = quotations.map(q => ({
    name: q.vendorName.split(' ')[0],
    'Quoted Price': q.unitPrice,
    'Market Avg': marketDataAvg(itemName()),
  }));

  function itemName() {
    return currentRequest?.itemName || 'Enterprise Laptops';
  }

  function marketDataAvg(item: string) {
    if (item.toLowerCase().includes('laptop')) return 1350;
    return (currentRequest?.budget || 750000) / (currentRequest?.quantity || 500) * 0.95;
  }

  // 3. Supplier Performance (Quality vs Warranty months)
  const performanceData = quotations.map(q => ({
    name: q.vendorName.split(' ')[0],
    'Quality Score': q.qualityScore,
    'Warranty months': q.warrantyMonths,
  }));

  // 4. Risk Level Distribution (Pie)
  const getRiskPieData = () => {
    if (!risks) return [
      { name: 'Low Risk', value: 3 },
      { name: 'Medium Risk', value: 2 },
      { name: 'High Risk', value: 0 },
    ];
    const low = risks.vendorRisks.filter(v => v.riskLevel === 'low').length;
    const med = risks.vendorRisks.filter(v => v.riskLevel === 'medium').length;
    const high = risks.vendorRisks.filter(v => v.riskLevel === 'high').length;
    return [
      { name: 'Low Risk', value: low },
      { name: 'Medium Risk', value: med },
      { name: 'High Risk', value: high },
    ].filter(r => r.value > 0);
  };
  const riskPieData = getRiskPieData();

  // 5. Delivery Performance (Days lead time)
  const deliveryData = quotations.map(q => ({
    name: q.vendorName.split(' ')[0],
    'Lead Time (Days)': q.deliveryDays,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    return (
      <div className="glass rounded-xl p-3 border border-[#2E1E47] bg-[#0F0C1B]/95 text-xs">
        <p className="text-sm font-semibold text-white mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-[#8E7CA3] mt-0.5">
            <span style={{ color: p.color || p.stroke || '#A855F7' }}>●</span> {p.name}: {typeof p.value === 'number' && p.value > 150 ? formatCurrency(p.value) : p.value}
          </p>
        ))}
      </div>
    );
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Page Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Procurement Agent Dashboard</h1>
          <p className="text-xs text-[#8E7CA3] mt-1">Autonomous reasoning overview, vendor benchmarks, and cost analysis</p>
        </div>
        <div className="flex items-center gap-3">
          {!isDemoMode && (
            <button
              onClick={handleRunDemo}
              disabled={demoRunning}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[rgba(168,85,247,0.12)] text-[#C084FC] text-xs font-semibold border border-[rgba(168,85,247,0.25)] hover:bg-[rgba(168,85,247,0.2)] transition-colors disabled:opacity-50 cursor-pointer"
            >
              {demoRunning ? <><Activity className="w-3.5 h-3.5 animate-spin" /> Analyzing...</> : <><Zap className="w-3.5 h-3.5 text-[#C084FC]" /> Run Sandbox Scenario</>}
            </button>
          )}
          <button
            onClick={() => navigate('/workflow')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#A855F7] to-[#3B82F6] text-white text-xs font-semibold hover:opacity-95 transition-opacity cursor-pointer shadow-lg shadow-[rgba(168,85,247,0.25)]"
          >
            <Play className="w-3.5 h-3.5" />
            Agent Pipeline
          </button>
        </div>
      </motion.div>

      {/* KPI Cards Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {kpis.map((kpi) => (
          <motion.div
            key={kpi.title}
            variants={itemVariants}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className={`glass rounded-2xl p-4 card-hover ${kpi.glow} relative overflow-hidden`}
          >
            <div className={`absolute -top-6 -right-6 w-16 h-16 rounded-full bg-gradient-to-br ${kpi.color} opacity-10 blur-xl`} />
            <div className="flex flex-col h-full justify-between gap-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-[#8E7CA3] uppercase tracking-wider">{kpi.title}</p>
                <div className={`p-1.5 rounded-lg bg-white/5 border border-white/10`}>
                  <kpi.icon className="w-3.5 h-3.5 text-[#C084FC]" />
                </div>
              </div>
              <div>
                <p className="text-base font-bold text-white truncate">{kpi.value}</p>
                <p className="text-[9px] text-[#00E676] mt-0.5 font-medium">{kpi.change}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. Vendor Comparison */}
        <motion.div variants={itemVariants} className="glass rounded-2xl p-5 flex flex-col justify-between min-h-[350px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Score Comparison</h3>
                <p className="text-[10px] text-[#8E7CA3] mt-0.5">Scoring weights across parameters</p>
              </div>
              <div className="p-1.5 rounded-lg bg-[rgba(168,85,247,0.1)]">
                <ChartIcon className="w-3.5 h-3.5 text-[#A855F7]" />
              </div>
            </div>
            {scoreChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={scoreChartData} barGap={1}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#251E3E" />
                  <XAxis dataKey="name" tick={{ fill: '#8E7CA3', fontSize: 10 }} axisLine={{ stroke: '#2E1E47' }} />
                  <YAxis tick={{ fill: '#8E7CA3', fontSize: 10 }} axisLine={{ stroke: '#2E1E47' }} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Price" fill="#3B82F6" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Quality" fill="#00E676" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Delivery" fill="#F59E0B" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Warranty" fill="#A855F7" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <NoDataView />
            )}
          </div>
        </motion.div>

        {/* 2. Price Trend */}
        <motion.div variants={itemVariants} className="glass rounded-2xl p-5 flex flex-col justify-between min-h-[350px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Price Comparison</h3>
                <p className="text-[10px] text-[#8E7CA3] mt-0.5">Quoted pricing vs market index</p>
              </div>
              <div className="p-1.5 rounded-lg bg-[rgba(59,130,246,0.1)]">
                <DollarSign className="w-3.5 h-3.5 text-[#3B82F6]" />
              </div>
            </div>
            {priceChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={230}>
                <LineChart data={priceChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#251E3E" />
                  <XAxis dataKey="name" tick={{ fill: '#8E7CA3', fontSize: 10 }} axisLine={{ stroke: '#2E1E47' }} />
                  <YAxis tick={{ fill: '#8E7CA3', fontSize: 10 }} axisLine={{ stroke: '#2E1E47' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="Quoted Price" stroke="#00E676" strokeWidth={2} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Market Avg" stroke="#A855F7" strokeWidth={2} strokeDasharray="5 5" />
                  <Legend wrapperStyle={{ fontSize: '9px', color: '#8E7CA3' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <NoDataView />
            )}
          </div>
        </motion.div>

        {/* 3. Supplier Performance */}
        <motion.div variants={itemVariants} className="glass rounded-2xl p-5 flex flex-col justify-between min-h-[350px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Quality vs Warranty</h3>
                <p className="text-[10px] text-[#8E7CA3] mt-0.5">Warranty support period vs product grade</p>
              </div>
              <div className="p-1.5 rounded-lg bg-[rgba(0,230,118,0.1)]">
                <Award className="w-3.5 h-3.5 text-[#00E676]" />
              </div>
            </div>
            {performanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#251E3E" />
                  <XAxis dataKey="name" tick={{ fill: '#8E7CA3', fontSize: 10 }} axisLine={{ stroke: '#2E1E47' }} />
                  <YAxis tick={{ fill: '#8E7CA3', fontSize: 10 }} axisLine={{ stroke: '#2E1E47' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Quality Score" fill="#A855F7" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Warranty months" fill="#3B82F6" radius={[2, 2, 0, 0]} />
                  <Legend wrapperStyle={{ fontSize: '9px' }} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <NoDataView />
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 4. Risk Distribution */}
        <motion.div variants={itemVariants} className="glass rounded-2xl p-5 flex flex-col justify-between min-h-[350px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Risk Levels</h3>
                <p className="text-[10px] text-[#8E7CA3] mt-0.5">Vendor exposure classification</p>
              </div>
              <div className="p-1.5 rounded-lg bg-[rgba(239,68,68,0.1)]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#EF4444]" />
              </div>
            </div>
            {riskPieData.length > 0 ? (
              <div className="flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={riskPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {riskPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2">
                  {riskPieData.map((entry, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="text-[10px] text-[#8E7CA3]">{entry.name} ({entry.value})</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <NoDataView />
            )}
          </div>
        </motion.div>

        {/* 5. Delivery Performance */}
        <motion.div variants={itemVariants} className="glass rounded-2xl p-5 flex flex-col justify-between min-h-[350px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Delivery Lead Time</h3>
                <p className="text-[10px] text-[#8E7CA3] mt-0.5">Shipment fulfillment speed in days</p>
              </div>
              <div className="p-1.5 rounded-lg bg-[rgba(245,158,11,0.1)]">
                <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
              </div>
            </div>
            {deliveryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={deliveryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#251E3E" />
                  <XAxis dataKey="name" tick={{ fill: '#8E7CA3', fontSize: 10 }} axisLine={{ stroke: '#2E1E47' }} />
                  <YAxis tick={{ fill: '#8E7CA3', fontSize: 10 }} axisLine={{ stroke: '#2E1E47' }} label={{ value: 'Days', angle: -90, position: 'insideLeft', fill: '#8E7CA3', fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Lead Time (Days)" fill="#F59E0B" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <NoDataView />
            )}
          </div>
        </motion.div>

        {/* Workflow Quick Status panel */}
        <motion.div variants={itemVariants} className="glass rounded-2xl p-5 flex flex-col justify-between min-h-[350px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Agent Pipeline</h3>
              <Zap className="w-3.5 h-3.5 text-[#3B82F6]" />
            </div>

            <div className="space-y-3.5">
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[rgba(0,230,118,0.06)] border border-[rgba(0,230,118,0.15)]">
                <CheckCircle2 className="w-4.5 h-4.5 text-[#00E676]" />
                <div>
                  <p className="text-xs font-semibold text-white">
                    {workflowRun?.status === 'completed' ? 'Evaluation Complete' : workflowRun?.status === 'running' ? 'Running evaluation...' : 'Awaiting Bids'}
                  </p>
                  <p className="text-[10px] text-[#8E7CA3]">
                    {workflowRun ? `${workflowRun.agents.filter(a => a.status === 'completed').length}/9 agents finished` : 'No active workspace'}
                  </p>
                </div>
              </div>

              {/* Progress items */}
              <div className="space-y-2">
                {workflowRun?.agents.slice(0, 4).map((agent, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      agent.status === 'completed' ? 'bg-[#00E676]' :
                      agent.status === 'running' ? 'bg-[#3B82F6] animate-pulse' :
                      'bg-[#2D3A50]'
                    }`} />
                    <span className="text-[10px] text-[#8E7CA3] flex-1 truncate">{agent.name.replace(' Agent', '')}</span>
                    <span className="text-[9px] text-[#64748B]">{agent.progress}%</span>
                  </div>
                )) || (
                  <div className="text-center py-6 text-[10px] text-[#8E7CA3]">
                    Upload a quotation to trigger agent scoring
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-[#2E1E47] space-y-2">
                <button
                  onClick={() => navigate('/new-procurement')}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[rgba(59,130,246,0.1)] text-[#3B82F6] text-xs font-semibold hover:bg-[rgba(59,130,246,0.15)] transition-colors cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  New RFQ Request
                </button>
                <button
                  onClick={() => navigate('/reports')}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] text-[#8E7CA3] text-xs font-semibold hover:bg-[rgba(255,255,255,0.06)] hover:text-white transition-colors cursor-pointer"
                >
                  View Executive Briefing →
                </button>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}

function NoDataView() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Activity className="w-8 h-8 text-[#4B5E78] mb-2 animate-pulse" />
      <p className="text-xs text-[#64748B]">Awaiting data analysis</p>
      <p className="text-[10px] text-[#4B5E78] mt-0.5">Please load a sandbox scenario or upload quotes</p>
    </div>
  );
}
