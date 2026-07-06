import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Upload, Package, DollarSign, Calendar, FileText, Sparkles, Send,
  AlertCircle, CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateId } from '../lib/utils';
import type { ProcurementRequest } from '../types';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function NewProcurement() {
  const { setCurrentRequest } = useApp();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<{
    itemName: string;
    category: string;
    quantity: number | '';
    budget: number | '';
    currency: string;
    deliveryDeadline: string;
    qualityRequirement: string;
    specialRequirements: string;
    procurementCyclesPerYear: number | '';
  }>({
    itemName: '',
    category: 'IT Hardware',
    quantity: 500,
    budget: 750000,
    currency: 'USD',
    deliveryDeadline: '2025-09-30',
    qualityRequirement: '',
    specialRequirements: '',
    procurementCyclesPerYear: 4,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: (name === 'quantity' || name === 'budget' || name === 'procurementCyclesPerYear')
        ? (value === '' ? '' : Number(value))
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const request: ProcurementRequest = {
      ...form,
      quantity: Number(form.quantity) || 0,
      budget: Number(form.budget) || 0,
      procurementCyclesPerYear: Number(form.procurementCyclesPerYear) || 1,
      id: `PR-${Date.now()}`,
      attachments: [],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCurrentRequest(request);
    setSubmitted(true);
    setTimeout(() => navigate('/vendor-quotations'), 1500);
  };

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }} className="w-20 h-20 rounded-full bg-[rgba(16,185,129,0.1)] flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-[#10B981]" />
        </motion.div>
        <h2 className="text-xl font-bold text-white">Requirements Saved!</h2>
        <p className="text-sm text-[#94A3B8]">Redirecting to Vendor Quotation Upload...</p>
      </motion.div>
    );
  }

  const inputClass = "form-input interactive-input";
  const labelClass = "form-label";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
      <motion.div variants={itemVariants} initial="hidden" animate="visible">
        <h1 className="text-2xl font-bold text-white">Requirements & Budget</h1>
        <p className="text-sm text-[#94A3B8] mt-1">Define your procurement requirements — vendor quotations are uploaded separately</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Package className="w-4 h-4 text-[#2563EB]" />
            <h3 className="text-sm font-semibold text-white">Basic Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Item Name *</label>
              <input name="itemName" value={form.itemName} onChange={handleChange} placeholder="e.g. Enterprise Laptops" className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
                <option>IT Hardware</option>
                <option>Software</option>
                <option>Office Supplies</option>
                <option>Professional Services</option>
                <option>Raw Materials</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Quantity *</label>
              <input name="quantity" type="number" value={form.quantity} onChange={handleChange} className={inputClass} required min={1} />
            </div>
            <div>
              <label className={labelClass}>Procurement Cycles / Year</label>
              <input name="procurementCyclesPerYear" type="number" value={form.procurementCyclesPerYear} onChange={handleChange} className={inputClass} min={1} max={12} />
            </div>
          </div>
        </motion.div>

        {/* Budget & Timeline */}
        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <DollarSign className="w-4 h-4 text-[#10B981]" />
            <h3 className="text-sm font-semibold text-white">Budget & Timeline</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className={labelClass}>Budget *</label>
              <input name="budget" type="number" value={form.budget} onChange={handleChange} className={inputClass} required min={0} />
            </div>
            <div>
              <label className={labelClass}>Currency</label>
              <select name="currency" value={form.currency} onChange={handleChange} className={inputClass}>
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
                <option>INR</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Delivery Deadline *</label>
              <input name="deliveryDeadline" type="date" value={form.deliveryDeadline} onChange={handleChange} className={inputClass} required />
            </div>
          </div>
        </motion.div>

        {/* Requirements */}
        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <FileText className="w-4 h-4 text-[#F59E0B]" />
            <h3 className="text-sm font-semibold text-white">Requirements</h3>
          </div>
          <div className="space-y-5">
            <div>
              <label className={labelClass}>Quality Requirements</label>
              <textarea name="qualityRequirement" value={form.qualityRequirement} onChange={handleChange} rows={3} placeholder="Specify quality standards, certifications needed..." className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Special Requirements</label>
              <textarea name="specialRequirements" value={form.specialRequirements} onChange={handleChange} rows={3} placeholder="Any special conditions, compatibility needs..." className={inputClass} />
            </div>
          </div>
        </motion.div>

        {/* File Upload */}
        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Upload className="w-4 h-4 text-[#8B5CF6]" />
            <h3 className="text-sm font-semibold text-white">Attachments</h3>
          </div>
          <div className="border-2 border-dashed border-[#1E293B] rounded-xl p-8 text-center hover:border-[#2563EB] transition-colors cursor-pointer">
            <Upload className="w-8 h-8 text-[#64748B] mx-auto mb-3" />
            <p className="text-sm text-[#94A3B8]">Drag & drop files here or <span className="text-[#2563EB]">browse</span></p>
            <p className="text-xs text-[#64748B] mt-1">Supports PDF, XLSX, DOCX up to 10MB</p>
          </div>
        </motion.div>

        {/* Submit */}
        <motion.div variants={itemVariants} initial="hidden" animate="visible" className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>AI agents will automatically analyze your request</span>
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Send className="w-4 h-4" /> Submit & Run Analysis
          </button>
        </motion.div>
      </form>
    </motion.div>
  );
}
