import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Search, Star, MapPin, ShieldCheck, Users } from 'lucide-react';
import { DEMO_VENDORS } from '../lib/demo-data';
import { getStatusBg } from '../lib/utils';
import { useApp } from '../context/AppContext';
import type { Vendor } from '../types';

const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const logoColors = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

export default function VendorDirectory() {
  const [search, setSearch] = useState('');
  const { vendorQuotations, currentRequest } = useApp();

  // Map user-uploaded/manual quotations to Vendor objects
  const customVendors: Vendor[] = vendorQuotations.map((q) => {
    const existing = DEMO_VENDORS.find(v => v.name.toLowerCase() === q.vendorName.toLowerCase() || v.id === q.vendorId);
    const rating = Math.max(1, Math.min(5, parseFloat((q.qualityScore / 20).toFixed(1))));
    
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (q.qualityScore < 75 || q.deliveryDays > 30) riskLevel = 'high';
    else if (q.qualityScore < 85 || q.deliveryDays > 21) riskLevel = 'medium';

    return {
      id: q.vendorId,
      name: q.vendorName,
      category: currentRequest?.category || 'IT Hardware',
      rating: existing?.rating || rating,
      location: existing?.location || 'Remote / Online',
      contact: existing?.contact || 'Account Representative',
      email: existing?.email || `contact@${q.vendorName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'vendor'}.com`,
      yearsInBusiness: existing?.yearsInBusiness || 5,
      certifications: existing?.certifications || ['Standard Certified'],
      riskLevel: existing?.riskLevel || riskLevel,
      status: existing?.status || 'active',
      logo: existing?.logo || q.vendorName.substring(0, 2).toUpperCase(),
    };
  });

  // Merge lists by name (prefer customVendor/updated vendor details if uploaded)
  const allVendorsMap = new Map<string, Vendor>();
  DEMO_VENDORS.forEach(v => allVendorsMap.set(v.name.toLowerCase(), v));
  customVendors.forEach(v => allVendorsMap.set(v.name.toLowerCase(), v));

  const allVendors = Array.from(allVendorsMap.values());
  const vendors = allVendors.filter(v => v.name.toLowerCase().includes(search.toLowerCase()));

  const stats = [
    { label: 'Total Vendors', value: allVendors.length, icon: Building2, color: '#2563EB' },
    { label: 'Active', value: allVendors.filter(v => v.status === 'active').length, icon: ShieldCheck, color: '#10B981' },
    { label: 'Under Review', value: allVendors.filter(v => v.status === 'under_review').length, icon: Users, color: '#F59E0B' },
    { label: 'Avg Rating', value: allVendors.length > 0 ? (allVendors.reduce((a, v) => a + v.rating, 0) / allVendors.length).toFixed(1) : '0.0', icon: Star, color: '#8B5CF6' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white">Vendor Directory</h1><p className="text-sm text-[#94A3B8] mt-1">Manage and evaluate vendors</p></div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: i * 0.08 }} className="glass rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl" style={{ background: `${s.color}15` }}><s.icon className="w-5 h-5" style={{ color: s.color }} /></div>
              <div><p className="text-[10px] text-[#64748B] uppercase tracking-wider">{s.label}</p><p className="text-lg font-bold text-white">{s.value}</p></div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 glass rounded-xl px-4 py-3 max-w-md">
        <Search className="w-4 h-4 text-[#64748B]" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vendors..." className="bg-transparent text-sm text-white placeholder-[#64748B] outline-none w-full" />
      </div>

      {/* Vendor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vendors.map((vendor, i) => (
          <motion.div
            key={vendor.id}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -4 }}
            className="glass rounded-2xl p-5 card-hover"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white shrink-0" style={{ background: `${logoColors[i]}25`, color: logoColors[i] }}>
                {vendor.logo}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white truncate">{vendor.name}</h3>
                <p className="text-xs text-[#64748B]">{vendor.category}</p>
              </div>
              <span className={`text-[10px] px-2 py-1 rounded-lg ${getStatusBg(vendor.status)}`}>{vendor.status}</span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <Star className="w-3 h-3 text-[#F59E0B]" />
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <div key={n} className={`w-3 h-3 rounded-sm ${n <= Math.round(vendor.rating) ? 'bg-[#F59E0B]' : 'bg-[#1E293B]'}`} />
                  ))}
                  <span className="text-xs text-[#94A3B8] ml-1">{vendor.rating}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-[#64748B]" />
                <span className="text-xs text-[#94A3B8]">{vendor.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-3 h-3 text-[#64748B]" />
                <span className="text-xs text-[#94A3B8]">{vendor.yearsInBusiness} years in business</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3 h-3 text-[#64748B]" />
                <span className={`text-xs px-2 py-0.5 rounded ${getStatusBg(vendor.riskLevel)}`}>Risk: {vendor.riskLevel}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[rgba(30,41,59,0.5)]">
              <div className="flex flex-wrap gap-1.5">
                {vendor.certifications.map(c => (
                  <span key={c} className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(37,99,235,0.08)] text-[#2563EB] border border-[rgba(37,99,235,0.15)]">{c}</span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
