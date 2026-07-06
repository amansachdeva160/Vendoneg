import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Sliders, Globe, Bell, Moon, Save, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function SettingsPage() {
  const { settings, updateSettings } = useApp();
  const [saved, setSaved] = useState(false);
  const [weights, setWeights] = useState(settings.scoringWeights);
  const [cycles, setCycles] = useState(settings.procurementCyclesPerYear);
  const [currency, setCurrency] = useState(settings.defaultCurrency);
  const [notifications, setNotifications] = useState(settings.notifications);

  const totalWeight = weights.price + weights.quality + weights.delivery + weights.warranty;

  const handleSave = () => {
    updateSettings({ scoringWeights: weights, procurementCyclesPerYear: cycles, defaultCurrency: currency, notifications });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleWeightChange = (key: keyof typeof weights, val: number) => {
    setWeights(prev => ({ ...prev, [key]: val }));
  };

  const sliderClass = "w-full h-1.5 rounded-full appearance-none cursor-pointer bg-[#1E293B] accent-[#2563EB]";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Settings</h1><p className="text-sm text-[#94A3B8] mt-1">Configure your procurement platform</p></div>

      {/* Scoring Weights */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Sliders className="w-4 h-4 text-[#2563EB]" />
          <h3 className="text-sm font-semibold text-white">Scoring Weights</h3>
          <span className={`ml-auto text-xs px-2 py-0.5 rounded ${totalWeight === 100 ? 'bg-[rgba(16,185,129,0.1)] text-[#10B981]' : 'bg-[rgba(239,68,68,0.1)] text-[#EF4444]'}`}>
            Total: {totalWeight}%
          </span>
        </div>
        <div className="space-y-5">
          {([['price', 'Price', '#2563EB'], ['quality', 'Quality', '#10B981'], ['delivery', 'Delivery', '#F59E0B'], ['warranty', 'Warranty', '#8B5CF6']] as const).map(([key, label, color]) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-[#94A3B8]">{label}</label>
                <span className="text-sm font-bold" style={{ color }}>{weights[key]}%</span>
              </div>
              <input
                type="range" min={0} max={100} value={weights[key]}
                onChange={e => handleWeightChange(key, Number(e.target.value))}
                className={sliderClass}
              />
            </div>
          ))}
        </div>
      </motion.div>

      {/* General */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Globe className="w-4 h-4 text-[#10B981]" />
          <h3 className="text-sm font-semibold text-white">General</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs text-[#94A3B8] mb-1.5">Default Currency</label>
            <select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full bg-[#0F1629] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#2563EB]">
              <option>USD</option><option>EUR</option><option>GBP</option><option>INR</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#94A3B8] mb-1.5">Procurement Cycles / Year</label>
            <input type="number" value={cycles} onChange={e => setCycles(Number(e.target.value))} min={1} max={12} className="w-full bg-[#0F1629] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#2563EB]" />
          </div>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#F59E0B]" />
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
          </div>
          <button
            onClick={() => setNotifications(!notifications)}
            className={`w-11 h-6 rounded-full transition-all relative ${notifications ? 'bg-[#2563EB]' : 'bg-[#1E293B]'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notifications ? 'left-6' : 'left-1'}`} />
          </button>
        </div>
        <p className="text-xs text-[#64748B] mt-2">Receive notifications for workflow completions and procurement updates</p>
      </motion.div>

      {/* Theme */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <Moon className="w-4 h-4 text-[#8B5CF6]" />
          <h3 className="text-sm font-semibold text-white">Theme</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-[#2563EB] text-white text-sm font-medium">Dark Mode</div>
          <div className="px-4 py-2 rounded-xl glass text-[#64748B] text-sm cursor-not-allowed">Light Mode (Coming Soon)</div>
        </div>
      </motion.div>

      {/* Save */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="flex justify-end">
        <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] text-white text-sm font-semibold hover:opacity-90 transition-opacity">
          {saved ? <><Check className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Settings</>}
        </button>
      </motion.div>
    </motion.div>
  );
}
