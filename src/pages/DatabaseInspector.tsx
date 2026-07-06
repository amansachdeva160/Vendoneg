import { useState } from 'react';
import { motion } from 'framer-motion';
import { Table2, Rows3, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DEMO_VENDORS, DEMO_QUOTATIONS, DEMO_SCORES, DEMO_REQUEST } from '../lib/demo-data';

const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

interface TableDef {
  name: string;
  columns: string[];
  rows: Record<string, any>[];
}

export default function DatabaseInspector() {
  const { sharedMemory, workflowRun, currentRequest, vendorQuotations, settings } = useApp();
  const [activeTab, setActiveTab] = useState(0);

  // 1. Dynamic Request Table
  const req = currentRequest || DEMO_REQUEST;
  const requestsRow = [{
    id: req.id,
    item_name: req.itemName,
    category: req.category,
    quantity: req.quantity,
    budget: req.budget,
    currency: req.currency || 'USD',
    status: req.status,
    created_at: new Date(req.createdAt).toLocaleString()
  }];

  // 2. Dynamic Vendors List
  const customVendors = vendorQuotations.map((q) => {
    const existing = DEMO_VENDORS.find(v => v.name.toLowerCase() === q.vendorName.toLowerCase() || v.id === q.vendorId);
    const rating = Math.max(1, Math.min(5, parseFloat((q.qualityScore / 20).toFixed(1))));
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (q.qualityScore < 75 || q.deliveryDays > 30) riskLevel = 'high';
    else if (q.qualityScore < 85 || q.deliveryDays > 21) riskLevel = 'medium';

    return {
      id: q.vendorId,
      name: q.vendorName,
      category: req.category,
      rating,
      location: existing?.location || 'Remote / Online',
      risk_level: riskLevel,
      status: 'active'
    };
  });

  const allVendorsMap = new Map<string, any>();
  DEMO_VENDORS.forEach(v => allVendorsMap.set(v.name.toLowerCase(), { id: v.id, name: v.name, category: v.category, rating: v.rating, location: v.location, risk_level: v.riskLevel, status: v.status }));
  customVendors.forEach(v => allVendorsMap.set(v.name.toLowerCase(), v));
  const vendorsRows = Array.from(allVendorsMap.values());

  // 3. Dynamic Quotations Table
  const actualQuotations = vendorQuotations.length > 0 ? vendorQuotations : (sharedMemory.quotations || DEMO_QUOTATIONS);
  const quotationsRows = actualQuotations.map(q => ({
    vendor_id: q.vendorId,
    vendor_name: q.vendorName,
    unit_price: q.unitPrice,
    total_price: q.totalPrice,
    delivery_days: q.deliveryDays,
    warranty_months: q.warrantyMonths,
    discount: `${q.discount}%`
  }));

  // 4. Dynamic Scoring Table
  let actualScores = sharedMemory.scores;
  if (!actualScores && vendorQuotations.length > 0) {
    const weights = settings.scoringWeights;
    const minPrice = Math.min(...actualQuotations.map(q => q.unitPrice));
    const minDelivery = Math.min(...actualQuotations.map(q => q.deliveryDays));
    const maxWarranty = Math.max(...actualQuotations.map(q => q.warrantyMonths));

    const computed = actualQuotations.map(q => {
      const priceScore = Math.round((minPrice / q.unitPrice) * 100);
      const qualityScore = q.qualityScore;
      const deliveryScore = Math.round((minDelivery / q.deliveryDays) * 100);
      const warrantyScore = maxWarranty > 0 ? Math.round((q.warrantyMonths / maxWarranty) * 100) : 100;
      const totalScore = Math.round(
        ((priceScore * weights.price +
          qualityScore * weights.quality +
          deliveryScore * weights.delivery +
          warrantyScore * weights.warranty) / 100) * 10
      ) / 10;

      return {
        vendorId: q.vendorId,
        vendorName: q.vendorName,
        priceScore,
        qualityScore,
        deliveryScore,
        warrantyScore,
        totalScore,
        rank: 1,
      };
    });
    computed.sort((a, b) => b.totalScore - a.totalScore);
    computed.forEach((s, idx) => { s.rank = idx + 1; });
    actualScores = computed;
  } else if (!actualScores) {
    actualScores = DEMO_SCORES;
  }

  const scoresRows = actualScores.map(s => ({
    vendor_id: s.vendorId,
    vendor_name: s.vendorName,
    price_score: s.priceScore,
    quality_score: s.qualityScore,
    delivery_score: s.deliveryScore,
    warranty_score: s.warrantyScore,
    total_score: s.totalScore,
    rank: s.rank
  }));

  // 5. Workflow Logs Table
  const logsRows = (workflowRun?.logs || []).map(l => ({
    timestamp: new Date(l.timestamp).toLocaleString(),
    agent_id: l.agentId,
    agent_name: l.agentName,
    level: l.level,
    message: l.message
  }));

  const tables: TableDef[] = [
    {
      name: 'procurement_requests',
      columns: ['id', 'item_name', 'category', 'quantity', 'budget', 'currency', 'status', 'created_at'],
      rows: requestsRow,
    },
    {
      name: 'vendors',
      columns: ['id', 'name', 'category', 'rating', 'location', 'risk_level', 'status'],
      rows: vendorsRows,
    },
    {
      name: 'vendor_quotations',
      columns: ['vendor_id', 'vendor_name', 'unit_price', 'total_price', 'delivery_days', 'warranty_months', 'discount'],
      rows: quotationsRows,
    },
    {
      name: 'vendor_scores',
      columns: ['vendor_id', 'vendor_name', 'price_score', 'quality_score', 'delivery_score', 'warranty_score', 'total_score', 'rank'],
      rows: scoresRows,
    },
    {
      name: 'workflow_logs',
      columns: ['timestamp', 'agent_id', 'agent_name', 'level', 'message'],
      rows: logsRows,
    },
  ];

  const active = tables[activeTab];

  const handleExport = () => {
    const header = active.columns.join(',');
    const rows = active.rows.map(r => active.columns.map(c => JSON.stringify(r[c] ?? '')).join(','));
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${active.name}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Database Inspector</h1><p className="text-sm text-[#94A3B8] mt-1">Browse procurement data tables</p></div>
        <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass text-[#94A3B8] text-sm hover:text-white transition-colors">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {tables.map((t, i) => (
          <motion.div key={t.name} variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: i * 0.05 }} className="glass rounded-xl p-4 text-center">
            <p className="text-xs text-[#64748B] truncate">{t.name}</p>
            <p className="text-lg font-bold text-white mt-1">{t.rows.length}</p>
            <p className="text-[10px] text-[#64748B]">rows</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {tables.map((t, i) => (
          <button
            key={t.name}
            onClick={() => setActiveTab(i)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              i === activeTab ? 'bg-[#2563EB] text-white' : 'glass text-[#94A3B8] hover:text-white'
            }`}
          >
            <Table2 className="w-3.5 h-3.5" />
            {t.name}
          </button>
        ))}
      </div>

      {/* Table */}
      <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl p-4 overflow-hidden">
        {/* Schema */}
        <div className="mb-4 p-3 rounded-xl bg-[#0F1629] border border-[#1E293B]">
          <p className="text-xs text-[#64748B] mb-1">Schema: <span className="text-[#2563EB] font-mono">{active.name}</span></p>
          <p className="text-[11px] text-[#64748B] font-mono">{active.columns.join(' | ')}</p>
        </div>

        {/* Data */}
        <div className="overflow-x-auto">
          {active.rows.length === 0 ? (
            <div className="text-center py-12">
              <Rows3 className="w-8 h-8 text-[#64748B] mx-auto mb-2" />
              <p className="text-sm text-[#94A3B8]">No data in this table</p>
              <p className="text-xs text-[#64748B]">Run the workflow to populate data</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  {active.columns.map(c => <th key={c}>{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {active.rows.map((row, i) => (
                  <tr key={i}>
                    {active.columns.map(c => (
                      <td key={c} className="font-mono text-xs">{String(row[c] ?? '')}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
