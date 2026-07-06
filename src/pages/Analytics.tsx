import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, PieChart as PieChartIcon, Activity } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, PieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../lib/utils';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="glass rounded-xl p-3">
      <p className="text-sm font-medium text-white mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-xs text-[#94A3B8]"><span style={{ color: p.color }}>●</span> {p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const { sharedMemory } = useApp();

  const scores = sharedMemory.scores || [];
  const savings = sharedMemory.savingsPrediction;
  const risks = sharedMemory.riskAssessment;

  const scoreData = scores.map(s => ({
    name: s.vendorName.split(' ')[0],
    Price: s.priceScore, Quality: s.qualityScore, Delivery: s.deliveryScore, Warranty: s.warrantyScore,
  }));

  const savingsForecast = savings?.forecastData || [];
  const savingsBreakdown = savings?.savingsBreakdown || [];

  const riskRadar = [
    { metric: 'Financial', ...Object.fromEntries((risks?.vendorRisks || []).map(r => [r.vendorName.split(' ')[0], r.financialRisk])) },
    { metric: 'Delivery', ...Object.fromEntries((risks?.vendorRisks || []).map(r => [r.vendorName.split(' ')[0], r.deliveryRisk])) },
    { metric: 'Compliance', ...Object.fromEntries((risks?.vendorRisks || []).map(r => [r.vendorName.split(' ')[0], r.complianceRisk])) },
    { metric: 'Quality', ...Object.fromEntries((risks?.vendorRisks || []).map(r => [r.vendorName.split(' ')[0], r.qualityRisk])) },
  ];

  const stats = [
    { label: 'Total Vendors', value: '5', icon: BarChart3, color: '#2563EB' },
    { label: 'Avg Score', value: scores.length ? (scores.reduce((a, s) => a + s.totalScore, 0) / scores.length).toFixed(1) : '0', icon: TrendingUp, color: '#10B981' },
    { label: 'Total Savings', value: formatCurrency(savings?.projectedSavings || 0), icon: PieChartIcon, color: '#F59E0B' },
    { label: 'Risk Level', value: (risks?.overallRisk || 'N/A').toUpperCase(), icon: Activity, color: '#8B5CF6' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Analytics</h1><p className="text-sm text-[#94A3B8] mt-1">Procurement insights & visualizations</p></div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: i * 0.1 }} className="glass rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl" style={{ background: `${s.color}15` }}><s.icon className="w-5 h-5" style={{ color: s.color }} /></div>
              <div><p className="text-[10px] text-[#64748B] uppercase tracking-wider">{s.label}</p><p className="text-lg font-bold text-white">{s.value}</p></div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Vendor Score Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={scoreData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={{ stroke: '#1E293B' }} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={{ stroke: '#1E293B' }} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} /><Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="Price" fill="#2563EB" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Quality" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Delivery" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Warranty" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Savings Forecast</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={savingsForecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="quarter" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={{ stroke: '#1E293B' }} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={{ stroke: '#1E293B' }} tickFormatter={v => `$${v/1000}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="projected" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Savings Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={savingsBreakdown} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={100} innerRadius={55} paddingAngle={3}>
                {savingsBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} /><Legend wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Risk Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={riskRadar}>
              <PolarGrid stroke="#1E293B" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <PolarRadiusAxis tick={{ fill: '#64748B', fontSize: 10 }} domain={[0, 50]} />
              {(risks?.vendorRisks || []).slice(0, 5).map((r, i) => (
                <Radar key={r.vendorId} name={r.vendorName.split(' ')[0]} dataKey={r.vendorName.split(' ')[0]} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.1} />
              ))}
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </motion.div>
  );
}
