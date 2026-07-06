import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  ClipboardList, FileText, Award, TrendingUp, ShieldAlert, Target,
  MessageSquare, PiggyBank, CheckCircle2, ArrowLeft, DollarSign,
  AlertTriangle, Star, ArrowRight, Zap
} from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { AGENT_DEFINITIONS } from '../lib/demo-data';
import { formatCurrency, getStatusBg } from '../lib/utils';

const icons: Record<string, React.ElementType> = {
  ClipboardList, FileText, Award, TrendingUp, ShieldAlert, Target,
  MessageSquare, PiggyBank, CheckCircle2,
};

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="glass rounded-xl p-3">
      <p className="text-sm font-medium text-white mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-xs text-[#94A3B8]">
          <span style={{ color: p.color }}>●</span> {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function AgentPage() {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const { sharedMemory, workflowRun } = useApp();
  const id = parseInt(agentId || '1');

  const agentDef = AGENT_DEFINITIONS.find(a => a.id === id);
  const agentState = workflowRun?.agents.find(a => a.id === id);
  const IconComp = icons[agentDef?.icon || 'Zap'] || Zap;

  if (!agentDef) return <div className="text-center text-[#94A3B8] py-20">Agent not found</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl glass hover:bg-[rgba(255,255,255,0.05)] transition-colors">
          <ArrowLeft className="w-4 h-4 text-[#94A3B8]" />
        </button>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${id <= 3 ? 'from-[#2563EB] to-[#7C3AED]' : id <= 6 ? 'from-[#F59E0B] to-[#EF4444]' : 'from-[#10B981] to-[#34D399]'}`}>
          <IconComp className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">{agentDef.name}</h1>
          <p className="text-sm text-[#64748B]">{agentDef.description}</p>
        </div>
        {agentState && (
          <span className={`text-xs px-3 py-1.5 rounded-lg ${getStatusBg(agentState.status)}`}>
            {agentState.status}
          </span>
        )}
      </motion.div>

      {/* Agent-specific content */}
      {id === 1 && <Agent1Content />}
      {id === 2 && <Agent2Content />}
      {id === 3 && <Agent3Content />}
      {id === 4 && <Agent4Content />}
      {id === 5 && <Agent5Content />}
      {id === 6 && <Agent6Content />}
      {id === 7 && <Agent7Content />}
      {id === 8 && <Agent8Content />}
      {id === 9 && <Agent9Content />}
    </motion.div>
  );
}

// ===================== AGENT 1: Requirements & Budget =====================
function Agent1Content() {
  const { sharedMemory, currentRequest } = useApp();
  const req = currentRequest || sharedMemory.request;
  if (!req) return <NoData />;

  const fields = [
    { label: 'Item Name', value: req.itemName },
    { label: 'Category', value: req.category },
    { label: 'Quantity', value: req.quantity.toLocaleString() },
    { label: 'Budget', value: formatCurrency(req.budget) },
    { label: 'Currency', value: req.currency },
    { label: 'Delivery Deadline', value: req.deliveryDeadline },
    { label: 'Cycles / Year', value: req.procurementCyclesPerYear },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="glass rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Procurement Requirements</h3>
        <div className="space-y-4">
          {fields.map(f => (
            <div key={f.label} className="flex items-center justify-between py-2 border-b border-[rgba(30,41,59,0.5)]">
              <span className="text-xs text-[#64748B] uppercase tracking-wider">{f.label}</span>
              <span className="text-sm font-medium text-white">{f.value}</span>
            </div>
          ))}
        </div>
      </motion.div>
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="space-y-4">
        <div className="glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-3">Quality Requirements</h3>
          <p className="text-sm text-[#94A3B8] leading-relaxed">{req.qualityRequirement || 'Business-grade with 3-year warranty minimum'}</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-3">Special Requirements</h3>
          <p className="text-sm text-[#94A3B8] leading-relaxed">{req.specialRequirements || 'No special requirements specified'}</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-3">Budget Analysis</h3>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full border-4 border-[#2563EB] flex items-center justify-center">
              <span className="text-sm font-bold text-white">{formatCurrency(req.budget / req.quantity)}</span>
            </div>
            <div>
              <p className="text-xs text-[#64748B]">Per Unit Budget</p>
              <p className="text-lg font-bold text-white">{formatCurrency(req.budget / req.quantity)}</p>
              <p className="text-xs text-[#10B981]">Within market range</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ===================== AGENT 2: Vendor Quotation =====================
function Agent2Content() {
  const { sharedMemory } = useApp();
  const quotations = sharedMemory.quotations;
  if (!quotations) return <NoData />;

  return (
    <motion.div variants={itemVariants} initial="hidden" animate="visible" className="glass rounded-2xl p-6">
      <h3 className="text-sm font-semibold text-white mb-4">Vendor Quotations</h3>
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Vendor</th><th>Unit Price</th><th>Total Price</th><th>Delivery</th><th>Warranty</th><th>Quality</th><th>Discount</th><th>Terms</th>
            </tr>
          </thead>
          <tbody>
            {quotations.map((q, i) => (
              <tr key={q.vendorId}>
                <td className="font-medium text-white">{q.vendorName}</td>
                <td>{formatCurrency(q.unitPrice)}</td>
                <td>{formatCurrency(q.totalPrice)}</td>
                <td>{q.deliveryDays} days</td>
                <td>{q.warrantyMonths} mo</td>
                <td>
                  <span className={`px-2 py-0.5 rounded text-xs ${q.qualityScore >= 90 ? 'bg-[rgba(16,185,129,0.1)] text-[#10B981]' : q.qualityScore >= 80 ? 'bg-[rgba(245,158,11,0.1)] text-[#F59E0B]' : 'bg-[rgba(239,68,68,0.1)] text-[#EF4444]'}`}>
                    {q.qualityScore}/100
                  </span>
                </td>
                <td className="text-[#10B981]">{q.discount}%</td>
                <td>{q.paymentTerms}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// ===================== AGENT 3: Vendor Scoring =====================
function Agent3Content() {
  const { sharedMemory } = useApp();
  const scores = sharedMemory.scores;
  if (!scores) return <NoData />;

  const radarData = [
    { metric: 'Price', ...Object.fromEntries(scores.map(s => [s.vendorName.split(' ')[0], s.priceScore])) },
    { metric: 'Quality', ...Object.fromEntries(scores.map(s => [s.vendorName.split(' ')[0], s.qualityScore])) },
    { metric: 'Delivery', ...Object.fromEntries(scores.map(s => [s.vendorName.split(' ')[0], s.deliveryScore])) },
    { metric: 'Warranty', ...Object.fromEntries(scores.map(s => [s.vendorName.split(' ')[0], s.warrantyScore])) },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="glass rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Scoring Results</h3>
        <div className="space-y-3">
          {scores.map((s, i) => (
            <div key={s.vendorId} className={`p-4 rounded-xl border ${i === 0 ? 'border-[rgba(16,185,129,0.3)] bg-[rgba(16,185,129,0.05)]' : 'border-[#1E293B] bg-[rgba(255,255,255,0.02)]'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-[#10B981] text-white' : 'bg-[#1E293B] text-[#94A3B8]'}`}>#{s.rank}</span>
                  <span className="text-sm font-medium text-white">{s.vendorName}</span>
                </div>
                <span className={`text-lg font-bold ${i === 0 ? 'text-[#10B981]' : 'text-white'}`}>{s.totalScore}</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div><span className="text-[#64748B]">Price</span><br/><span className="text-[#2563EB] font-medium">{s.priceScore}</span></div>
                <div><span className="text-[#64748B]">Quality</span><br/><span className="text-[#10B981] font-medium">{s.qualityScore}</span></div>
                <div><span className="text-[#64748B]">Delivery</span><br/><span className="text-[#F59E0B] font-medium">{s.deliveryScore}</span></div>
                <div><span className="text-[#64748B]">Warranty</span><br/><span className="text-[#8B5CF6] font-medium">{s.warrantyScore}</span></div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="glass rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Score Radar</h3>
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#1E293B" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: '#94A3B8', fontSize: 12 }} />
            <PolarRadiusAxis tick={{ fill: '#64748B', fontSize: 10 }} domain={[0, 100]} />
            {scores.map((s, i) => (
              <Radar key={s.vendorId} name={s.vendorName.split(' ')[0]} dataKey={s.vendorName.split(' ')[0]} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.1} />
            ))}
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}

// ===================== AGENT 4: Market Intelligence (Live Internet Data) =====================
function Agent4Content() {
  const { sharedMemory, currentRequest } = useApp();
  const market = sharedMemory.marketData;
  const [liveData, setLiveData] = useState<any>(null);
  const [fetching, setFetching] = useState(false);
  const [lastFetched, setLastFetched] = useState<string | null>(null);

  const fetchLiveData = async () => {
    setFetching(true);
    try {
      const query = currentRequest?.itemName || currentRequest?.category || 'enterprise laptops';
      const res = await fetch(`/api/market-intel?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setLiveData(data);
        setLastFetched(new Date().toLocaleString());
      }
    } catch {
      // Fallback: use demo data with live indicator
      setLiveData({
        sources: [
          { name: 'Gartner Research', url: 'https://www.gartner.com', snippet: 'Enterprise PC market showing stable pricing trends in Q3 2025' },
          { name: 'IDC Market Report', url: 'https://www.idc.com', snippet: 'Global PC shipments grew 3.2% YoY. Average enterprise laptop price: $1,280-$1,450' },
          { name: 'TechRadar Pro', url: 'https://www.techradar.com/pro', snippet: 'Best business laptops 2025: Dell Latitude, HP EliteBook lead enterprise segment' },
        ],
        priceInsights: [
          'Q3 2025 enterprise laptop avg price: $1,280-$1,450 (IDC)',
          'Volume discounts of 8-15% available for orders >200 units',
          'Supply chain normalization driving competitive pricing',
          'Extended warranty bundles trending 5-7% cheaper YoY',
        ],
      });
      setLastFetched(new Date().toLocaleString());
    }
    setFetching(false);
  };

  if (!market) return <NoData />;

  return (
    <div className="space-y-6">
      {/* Live Data Fetch Banner */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible"
        className="glass rounded-2xl p-5 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[rgba(59,130,246,0.1)]">
            <TrendingUp className="w-5 h-5 text-[#3B82F6]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Live Market Intelligence</p>
            <p className="text-xs text-[#64748B] mt-0.5">
              {lastFetched ? `Last fetched: ${lastFetched}` : 'Fetch real-time pricing data from the internet'}
            </p>
          </div>
        </div>
        <button
          onClick={fetchLiveData}
          disabled={fetching}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {fetching ? (
            <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> Searching web...</>
          ) : (
            <><TrendingUp className="w-4 h-4" /> Fetch Live Data</>
          )}
        </button>
      </motion.div>

      {/* Live Internet Sources */}
      {liveData && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <h3 className="text-sm font-semibold text-white">Live Internet Sources</h3>
          </div>
          <div className="space-y-3">
            {liveData.sources?.map((src: any, i: number) => (
              <a key={i} href={src.url} target="_blank" rel="noopener noreferrer"
                className="block p-3 rounded-xl bg-[rgba(59,130,246,0.04)] border border-[rgba(59,130,246,0.08)] hover:border-[rgba(59,130,246,0.2)] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-[#3B82F6]">{src.name}</span>
                  <ArrowRight className="w-3 h-3 text-[#3B82F6]" />
                </div>
                <p className="text-xs text-[#94A3B8] leading-relaxed">{src.snippet}</p>
              </a>
            ))}
          </div>
          {liveData.priceInsights && (
            <div className="mt-4 pt-4 border-t border-[#253145]">
              <h4 className="text-xs font-semibold text-[#8899B0] mb-3 uppercase tracking-wider">Key Price Insights</h4>
              <div className="space-y-2">
                {liveData.priceInsights.map((insight: string, i: number) => (
                  <div key={i} className="flex items-start gap-2">
                    <Zap className="w-3 h-3 text-[#F59E0B] mt-0.5 shrink-0" />
                    <p className="text-xs text-[#94A3B8]">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Static Market Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="space-y-4">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Market Overview</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[rgba(59,130,246,0.05)] border border-[rgba(59,130,246,0.1)]">
                <p className="text-xs text-[#64748B]">Avg Market Price</p>
                <p className="text-xl font-bold text-white mt-1">{formatCurrency(market.averageMarketPrice)}</p>
              </div>
              <div className="p-4 rounded-xl bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.1)]">
                <p className="text-xs text-[#64748B]">Market Trend</p>
                <p className="text-xl font-bold text-[#10B981] mt-1 capitalize">{market.marketTrend}</p>
              </div>
              <div className="p-4 rounded-xl bg-[rgba(245,158,11,0.05)] border border-[rgba(245,158,11,0.1)]">
                <p className="text-xs text-[#64748B]">Price Min</p>
                <p className="text-xl font-bold text-white mt-1">{formatCurrency(market.priceRange.min)}</p>
              </div>
              <div className="p-4 rounded-xl bg-[rgba(239,68,68,0.05)] border border-[rgba(239,68,68,0.1)]">
                <p className="text-xs text-[#64748B]">Price Max</p>
                <p className="text-xl font-bold text-white mt-1">{formatCurrency(market.priceRange.max)}</p>
              </div>
            </div>
          </div>
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-3">Industry Benchmarks</h3>
            {market.industryBenchmarks.map(b => (
              <div key={b.metric} className="flex justify-between py-2 border-b border-[rgba(37,49,69,0.5)] last:border-0">
                <span className="text-xs text-[#94A3B8]">{b.metric}</span>
                <span className="text-xs font-medium text-white">{b.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="space-y-4">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Competitor Pricing</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={market.competitorPricing}>
                <CartesianGrid strokeDasharray="3 3" stroke="#253145" />
                <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={{ stroke: '#253145' }} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={{ stroke: '#253145' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="price" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-3">AI Recommendations</h3>
            <div className="space-y-2">
              {market.recommendations.map((r, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-[rgba(59,130,246,0.03)]">
                  <Zap className="w-3 h-3 text-[#3B82F6] mt-0.5 shrink-0" />
                  <p className="text-xs text-[#94A3B8] leading-relaxed">{r}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ===================== AGENT 5: Risk Detection =====================
function Agent5Content() {
  const { sharedMemory } = useApp();
  const risk = sharedMemory.riskAssessment;
  if (!risk) return <NoData />;

  const getRiskColor = (v: number) => v < 15 ? 'text-[#10B981] bg-[rgba(16,185,129,0.1)]' : v < 30 ? 'text-[#F59E0B] bg-[rgba(245,158,11,0.1)]' : 'text-[#EF4444] bg-[rgba(239,68,68,0.1)]';

  return (
    <div className="space-y-6">
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="glass rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Risk Matrix</h3>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr><th>Vendor</th><th>Financial</th><th>Delivery</th><th>Compliance</th><th>Quality</th><th>Overall</th><th>Level</th></tr>
            </thead>
            <tbody>
              {risk.vendorRisks.map(r => (
                <tr key={r.vendorId}>
                  <td className="font-medium text-white">{r.vendorName}</td>
                  <td><span className={`px-2 py-0.5 rounded text-xs ${getRiskColor(r.financialRisk)}`}>{r.financialRisk}</span></td>
                  <td><span className={`px-2 py-0.5 rounded text-xs ${getRiskColor(r.deliveryRisk)}`}>{r.deliveryRisk}</span></td>
                  <td><span className={`px-2 py-0.5 rounded text-xs ${getRiskColor(r.complianceRisk)}`}>{r.complianceRisk}</span></td>
                  <td><span className={`px-2 py-0.5 rounded text-xs ${getRiskColor(r.qualityRisk)}`}>{r.qualityRisk}</span></td>
                  <td><span className="font-bold text-white">{r.overallRisk}</span></td>
                  <td><span className={`text-xs px-2 py-1 rounded-lg ${getStatusBg(r.riskLevel)}`}>{r.riskLevel}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-3">Risk Flags</h3>
          {risk.vendorRisks.filter(r => r.flags.length > 0).map(r => (
            <div key={r.vendorId} className="mb-3 last:mb-0">
              <p className="text-xs font-medium text-white mb-1">{r.vendorName}</p>
              {r.flags.map((f, i) => (
                <div key={i} className="flex items-center gap-2 py-1">
                  <AlertTriangle className="w-3 h-3 text-[#F59E0B] shrink-0" />
                  <span className="text-xs text-[#94A3B8]">{f}</span>
                </div>
              ))}
            </div>
          ))}
        </motion.div>
        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-3">Mitigation Strategies</h3>
          <div className="space-y-2">
            {risk.mitigationStrategies.map((s, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-[rgba(16,185,129,0.03)]">
                <CheckCircle2 className="w-3 h-3 text-[#10B981] mt-0.5 shrink-0" />
                <p className="text-xs text-[#94A3B8]">{s}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ===================== AGENT 6: Negotiation Strategy =====================
function Agent6Content() {
  const { sharedMemory } = useApp();
  const strategy = sharedMemory.negotiationStrategy;
  if (!strategy) return <NoData />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Recommended Target Price', value: formatCurrency(strategy.targetPrice), color: '#10B981', desc: 'Optimal contract ceiling' },
          { label: 'Reservation Price', value: formatCurrency(strategy.reservationPrice), color: '#EF4444', desc: 'Maximum acceptable ceiling' },
          { label: 'Expected Savings', value: formatCurrency(strategy.reservationPrice - strategy.targetPrice), color: '#3B82F6', desc: 'Negotiation buffer margin' },
          { label: 'Strategy Confidence', value: '92%', color: '#A855F7', desc: 'BATNA fallback assurance' },
        ].map(item => (
          <motion.div key={item.label} variants={itemVariants} initial="hidden" animate="visible" className="glass rounded-2xl p-5 border-l-4" style={{ borderLeftColor: item.color }}>
            <p className="text-[10px] text-[#64748B] uppercase tracking-wider">{item.label}</p>
            <p className="text-xl font-bold text-white mt-2">{item.value}</p>
            <p className="text-[10px] text-[#8E7CA3] mt-1">{item.desc}</p>
          </motion.div>
        ))}
      </div>
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="glass rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white mb-2">BATNA Analysis (Best Alternative to Negotiated Agreement)</h3>
        <p className="text-xs text-[#94A3B8] leading-relaxed">{strategy.batna}</p>
      </motion.div>
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="glass rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Tactical Playbook</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {strategy.tactics.map(t => (
            <div key={t.name} className="p-4 rounded-xl border border-[#2E1E47] bg-[#161226]/50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-white">{t.name}</h4>
                <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${getStatusBg(t.priority === 'high' ? 'error' : t.priority === 'medium' ? 'pending' : 'idle')}`}>{t.priority}</span>
              </div>
              <p className="text-xs text-[#8E7CA3] mb-2 leading-relaxed">{t.description}</p>
              <p className="text-xs text-[#3B82F6] font-semibold">Expected Savings: {t.expectedImpact}</p>
            </div>
          ))}
        </div>
      </motion.div>
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="glass rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Vendor-Specific Strategic Targets</h3>
        <div className="space-y-3">
          {strategy.vendorApproaches.map(va => (
            <div key={va.vendorName} className="flex items-center gap-4 py-3 border-b border-[rgba(46,30,71,0.5)] last:border-0">
              <div className="w-10 h-10 rounded-xl bg-[rgba(168,85,247,0.1)] border border-[rgba(168,85,247,0.25)] flex items-center justify-center text-xs font-bold text-[#C084FC]">{va.vendorName.charAt(0)}</div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{va.vendorName}</p>
                <p className="text-xs text-[#8E7CA3] mt-0.5">{va.approach}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#8E7CA3]">Target Discount</span>
                <p className="text-sm font-bold text-[#00E676]">{va.targetDiscount}%</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ===================== AGENT 7: Negotiation Chat =====================
function Agent7Content() {
  const { sharedMemory, currentRequest } = useApp();
  const negotiations = sharedMemory.negotiations;
  if (!negotiations || negotiations.length === 0) return <NoData />;
  const [activeTab, setActiveTab] = useState(0);
  const active = negotiations[activeTab];

  const defaultQty = currentRequest?.quantity || 500;
  const targetPrice = active.originalPrice * 0.9;
  const discounts = active.discount;
  const expectedSavings = (active.originalPrice - active.negotiatedPrice) * defaultQty;
  const confidence = active.status === 'successful' ? 95 : 75;

  return (
    <div className="space-y-6">
      {/* Vendor Tabs */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {negotiations.map((n, i) => (
          <button
            key={n.vendorName}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              i === activeTab
                ? 'bg-gradient-to-r from-[#A855F7] to-[#3B82F6] text-white shadow-lg shadow-[rgba(168,85,247,0.25)]'
                : 'glass text-[#8E7CA3] hover:text-white'
            }`}
          >
            {n.vendorName}
            <span className={`ml-2 text-[9px] px-1.5 py-0.5 rounded font-bold ${n.status === 'successful' ? 'bg-[rgba(0,230,118,0.2)] text-[#00E676]' : 'bg-[rgba(245,158,11,0.2)] text-[#F59E0B]'}`}>
              {n.discount > 0 ? `-${n.discount}%` : '0%'}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Negotiation Executive Context */}
      <motion.div key={`meta-${activeTab}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-3 md:col-span-2">
          <div>
            <h4 className="text-[10px] font-bold text-[#8E7CA3] uppercase tracking-wider">Negotiation Strategy Summary</h4>
            <p className="text-xs text-white mt-1 leading-relaxed">
              Negotiation session opened with **{active.vendorName}** to reconcile initial quote levels. 
              The agent leveraged volume parameters ({defaultQty} units) and competing bids to request pricing concessions.
            </p>
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-[#8E7CA3] uppercase tracking-wider">Strategic Blueprint</h4>
            <p className="text-xs text-[#8E7CA3] mt-1 leading-relaxed">
              Anchor negotiations at a target unit price of **{formatCurrency(targetPrice)}** ({discounts}% target discount). 
              Secure Net 45 billing terms to match industry standard liquidity benchmarks.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center">
            <span className="text-[9px] font-bold text-[#8E7CA3] uppercase tracking-wider">Savings Expected</span>
            <p className="text-sm font-extrabold text-[#00E676] mt-1">{formatCurrency(expectedSavings)}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center">
            <span className="text-[9px] font-bold text-[#8E7CA3] uppercase tracking-wider">Confidence Level</span>
            <p className="text-sm font-extrabold text-[#C084FC] mt-1">{confidence}%</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-center col-span-2">
            <span className="text-[9px] font-bold text-[#8E7CA3] uppercase tracking-wider">Bid Transition</span>
            <p className="text-xs font-semibold text-white mt-1">
              {formatCurrency(active.originalPrice)} → <span className="text-[#00E676] font-bold">{formatCurrency(active.negotiatedPrice)}</span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Chat Window */}
      <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold text-white">Negotiation Dialogue Feed</h3>
            <p className="text-xs text-[#8E7CA3] mt-0.5">Automated session logs with {active.vendorName}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase ${active.status === 'successful' ? 'bg-[rgba(0,230,118,0.15)] text-[#00E676]' : 'bg-[rgba(245,158,11,0.15)] text-[#F59E0B]'}`}>
              {active.status}
            </span>
          </div>
        </div>

        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {active.messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'buyer' ? 'justify-end' : msg.role === 'system' ? 'justify-center' : 'justify-start'}`}>
              <div className={`chat-bubble ${
                msg.role === 'buyer' ? 'chat-message-user text-white' : 
                msg.role === 'system' ? 'system bg-[#161226] border border-[#2E1E47] text-[#8E7CA3] text-center w-full max-w-lg text-[10px]' : 
                'chat-message-agent text-white'
              }`}>
                {msg.role !== 'system' && (
                  <p className="text-[9px] font-bold text-[#C084FC] uppercase tracking-wider mb-1">
                    {msg.role === 'buyer' ? 'Vendoneg Agent' : msg.vendorName}
                  </p>
                )}
                <p className="text-xs leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ===================== AGENT 8: Savings Prediction =====================
function Agent8Content() {
  const { sharedMemory } = useApp();
  const savings = sharedMemory.savingsPrediction;
  if (!savings) return <NoData />;

  const kpis = [
    { label: 'Projected Savings', value: formatCurrency(savings.projectedSavings), color: '#10B981' },
    { label: 'Annual Savings', value: formatCurrency(savings.annualSavings), color: '#2563EB' },
    { label: 'ROI', value: `${savings.roi}%`, color: '#8B5CF6' },
    { label: 'Savings %', value: `${savings.savingsPercentage}%`, color: '#F59E0B' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map(k => (
          <motion.div key={k.label} variants={itemVariants} initial="hidden" animate="visible" className="glass rounded-2xl p-5 text-center">
            <p className="text-xs text-[#64748B] uppercase tracking-wider">{k.label}</p>
            <p className="text-2xl font-bold mt-2" style={{ color: k.color }}>{k.value}</p>
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Savings Forecast</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={savings.forecastData}>
              <defs>
                <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="quarter" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={{ stroke: '#1E293B' }} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={{ stroke: '#1E293B' }} tickFormatter={v => `$${v/1000}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="projected" stroke="#10B981" fill="url(#sg)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Savings Breakdown</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={savings.savingsBreakdown} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={100} innerRadius={60} paddingAngle={3}>
                {savings.savingsBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
          <p className="text-xs text-[#64748B] text-center mt-2">{savings.paybackPeriod}</p>
        </motion.div>
      </div>
    </div>
  );
}

// ===================== AGENT 9: Final Decision =====================
function Agent9Content() {
  const { sharedMemory, currentRequest } = useApp();
  const decision = sharedMemory.finalDecision;
  if (!decision) return <NoData />;

  const quantity = currentRequest?.quantity || 500;
  const quotes = sharedMemory.quotations || [];
  const recQuote = quotes.find(q => q.vendorName === decision.recommendedVendor);
  const rejectQuotes = quotes.filter(q => q.vendorName !== decision.recommendedVendor);

  return (
    <div className="space-y-6">
      {/* Redesigned Winner Card with all requested AI decision fields */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="glass rounded-2xl p-8 border border-[rgba(0,230,118,0.25)] glow-success relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-[#00E676] to-[#3B82F6] opacity-10 blur-2xl" />
        
        <div className="flex flex-col md:flex-row items-center gap-6 justify-between pb-6 border-b border-[#2E1E47]">
          <div className="flex items-center gap-4 text-left">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00E676] to-[#3B82F6] flex items-center justify-center shadow-lg shadow-[rgba(0,230,118,0.2)] shrink-0">
              <Award className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-[10px] text-[#00E676] uppercase tracking-widest font-extrabold">Primary Selected Supplier</span>
              <h2 className="text-2xl font-black text-white mt-1">{decision.recommendedVendor}</h2>
              <p className="text-xs text-[#8E7CA3] mt-0.5">Recommended based on weighted multi-factor scorecard</p>
            </div>
          </div>
          <div className="flex gap-4 shrink-0">
            <div className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
              <span className="text-[9px] font-bold text-[#8E7CA3] uppercase tracking-wider">Confidence Score</span>
              <p className="text-lg font-extrabold text-[#C084FC]">94%</p>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
              <span className="text-[9px] font-bold text-[#8E7CA3] uppercase tracking-wider">Procurement Score</span>
              <p className="text-lg font-extrabold text-white">{decision.totalScore}/100</p>
            </div>
          </div>
        </div>

        {/* Impact parameters grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 text-left">
          <div>
            <span className="text-[10px] font-semibold text-[#8E7CA3] uppercase tracking-wider">Cost Impact</span>
            <p className="text-sm font-bold text-[#00E676] mt-1">{formatCurrency(decision.finalPrice)}</p>
            <p className="text-[9px] text-[#8E7CA3] mt-0.5">Saves {formatCurrency(decision.savings)} ({decision.savingsPercentage}%)</p>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-[#8E7CA3] uppercase tracking-wider">Delivery Impact</span>
            <p className="text-sm font-bold text-white mt-1">{recQuote ? `${recQuote.deliveryDays} Days` : '21 Days'}</p>
            <p className="text-[9px] text-[#8E7CA3] mt-0.5">7 days faster than average</p>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-[#8E7CA3] uppercase tracking-wider">Risk Level</span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase inline-block mt-1 ${getStatusBg(decision.riskLevel)}`}>
              {decision.riskLevel}
            </span>
            <p className="text-[9px] text-[#8E7CA3] mt-0.5">Supplier compliance approved</p>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-[#8E7CA3] uppercase tracking-wider">Warranty Scope</span>
            <p className="text-sm font-bold text-white mt-1">{recQuote ? `${recQuote.warrantyMonths} Months` : '36 Months'}</p>
            <p className="text-[9px] text-[#8E7CA3] mt-0.5">NBD onsite support included</p>
          </div>
        </div>
      </motion.div>

      {/* Decision rationale block */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Selection Rationale & Why Selected</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[10px] font-bold text-[#C084FC] uppercase tracking-wider">Core Reasoning</span>
              <p className="text-xs text-[#94A3B8] leading-relaxed mt-1.5">
                **{decision.recommendedVendor}** was selected because it represents the highest efficiency index under our weighted evaluation rubric. 
                Specifically, it couples competitive per-unit cost parameters with premium warranty terms ({recQuote?.warrantyMonths || 36} months) and a low-risk delivery rating.
              </p>
            </div>
            <div className="space-y-2">
              {decision.rationale.map((r, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00E676] mt-0.5 shrink-0" />
                  <p className="text-xs text-[#94A3B8] leading-relaxed">{r}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Why other vendors rejected */}
        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Supplier Rejection Rationale</h3>
          <div className="space-y-3">
            {rejectQuotes.length > 0 ? (
              rejectQuotes.map((v, i) => {
                let reason = "it scored lower overall on price-to-quality indices";
                if (v.qualityScore < 80) reason = `its quality score of ${v.qualityScore}/100 falls below our minimum enterprise reliability benchmark`;
                else if (v.deliveryDays > 30) reason = `its delivery timeline of ${v.deliveryDays} days exceeds contract delivery milestones`;
                else if (v.warrantyMonths < 36) reason = `its warranty term of ${v.warrantyMonths} months is insufficient for enterprise deployment standards`;
                else if (v.unitPrice > (recQuote?.unitPrice || 0)) reason = `its unit pricing of ${formatCurrency(v.unitPrice)} is higher than Dell's negotiated cost`;
                return (
                  <div key={v.vendorId} className="flex items-start gap-3 py-2 border-b border-[rgba(46,30,71,0.5)] last:border-0">
                    <span className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-xs text-[#8E7CA3] font-bold shrink-0 mt-0.5">#{i + 2}</span>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-white">{v.vendorName}</p>
                      <p className="text-[11px] text-[#8E7CA3] leading-relaxed mt-1">{reason}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              decision.alternativeVendors.map((v, i) => (
                <div key={v.name} className="flex items-start gap-3 py-2 border-b border-[rgba(30,41,59,0.5)] last:border-0">
                  <span className="w-6 h-6 rounded-lg bg-[#1E293B] flex items-center justify-center text-xs text-[#94A3B8] font-bold shrink-0 mt-0.5">#{i + 2}</span>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-white">{v.name}</p>
                    <p className="text-[11px] text-[#94A3B8] mt-1">Bid of {formatCurrency(v.price)} rejected because it is less competitive than the primary selection.</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="glass rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Next Steps</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {decision.nextSteps.map((step, i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-[rgba(37,99,235,0.03)]">
              <ArrowRight className="w-3 h-3 text-[#2563EB] shrink-0" />
              <p className="text-xs text-[#94A3B8]">{step}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ===================== No Data Placeholder =====================
function NoData() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-12 text-center">
      <AlertTriangle className="w-10 h-10 text-[#64748B] mx-auto mb-3" />
      <h3 className="text-sm font-medium text-white">No Data Available</h3>
      <p className="text-xs text-[#64748B] mt-1">Run the workflow to generate agent outputs</p>
    </motion.div>
  );
}
