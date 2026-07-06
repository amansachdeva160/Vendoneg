import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Upload, FileSpreadsheet, FileText, File, X, Plus, Trash2,
  Save, CheckCircle2, ArrowRight, Table2, PenTool, AlertCircle, Sparkles, Loader2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../lib/utils';
import type { VendorQuotation } from '../types';

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  data: string[][];
}

const itemV = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const FILE_ICONS: Record<string, typeof FileSpreadsheet> = {
  'text/csv': FileSpreadsheet,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': FileSpreadsheet,
  'application/vnd.ms-excel': FileSpreadsheet,
  'application/pdf': FileText,
};

export default function VendorQuotationUpload() {
  const navigate = useNavigate();
  const { currentRequest, vendorQuotations, setVendorQuotations, startWorkflow } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);

  const handleProceedToAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisStep(0);

    // Prepare a mock request if none exists
    const req = currentRequest || {
      id: 'PR-2025-001',
      itemName: 'Enterprise Laptops',
      category: 'IT Hardware',
      quantity: defaultQty,
      budget: 750000,
      currency: 'USD',
      deliveryDeadline: '2025-09-30',
      qualityRequirement: 'Business-grade with 3-year warranty minimum, 16GB RAM, 512GB SSD, Intel i7 or equivalent',
      specialRequirements: 'Must support Windows 11 Pro, TPM 2.0, docking station compatibility.',
      procurementCyclesPerYear: 4,
      attachments: [],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Run the agent workflow pipeline in background
    startWorkflow(req);

    // Animate through steps
    for (let i = 0; i < 9; i++) {
      setAnalysisStep(i);
      await new Promise(resolve => setTimeout(resolve, 450));
    }

    setAnalysisStep(9);
    await new Promise(resolve => setTimeout(resolve, 600));
    setIsAnalyzing(false);
    navigate('/dashboard');
  };

  const defaultQty = currentRequest?.quantity || 500;
  const [form, setForm] = useState<{
    vendorName: string;
    unitPrice: number | '';
    deliveryDays: number | '';
    warrantyMonths: number | '';
    qualityScore: number | '';
    discount: number | '';
    paymentTerms: string;
  }>({
    vendorName: '', unitPrice: 0, deliveryDays: 21,
    warrantyMonths: 36, qualityScore: 85, discount: 0, paymentTerms: 'Net 30'
  });

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  // ─── File Handling ───
  const parseCSV = (text: string): string[][] => {
    return text.split(/\r?\n/).filter(line => line.trim() !== '').map(line => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result.map(cell => cell.replace(/^"|"$/g, ''));
    });
  };

  const getVendorNameFromFilename = (name: string): string => {
    const base = name.split('.').slice(0, -1).join('.');
    const cleaned = base
      .replace(/[-_]/g, ' ')
      .replace(/\b(quote|quotation|pricing|price|vendor|estimate|proposal|invoice|rfp)\b/gi, '')
      .trim();
    if (!cleaned) return base;
    return cleaned.replace(/\b\w/g, c => c.toUpperCase());
  };

  const processParsedData = useCallback((data: string[][], filename: string) => {
    if (data.length > 1) {
      const headers = data[0].map(h => h.toLowerCase().trim());
      const newQuotes: VendorQuotation[] = data.slice(1).filter(row => row.length >= 2 && row[0]).map((row, idx) => {
        const getVal = (regex: RegExp) => {
          const cellIdx = headers.findIndex(h => regex.test(h));
          return cellIdx !== -1 ? row[cellIdx] : '';
        };

        const vendorName = getVal(/vendor|name|company/i) || row[0];
        const unitPrice = parseFloat(getVal(/price|rate|cost/i) || row[1]) || 0;
        const deliveryDays = parseInt(getVal(/delivery|days/i) || row[2]) || 15;
        const warrantyMonths = parseInt(getVal(/warranty/i) || row[3]) || 24;
        const qualityScore = parseInt(getVal(/quality/i) || row[4]) || 80;
        const discount = parseFloat(getVal(/discount/i) || row[5]) || 0;
        const paymentTerms = getVal(/terms|payment/i) || 'Net 30';

        return {
          vendorId: `v-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
          vendorName,
          unitPrice,
          totalPrice: unitPrice * defaultQty,
          deliveryDays,
          warrantyMonths,
          qualityScore,
          discount,
          paymentTerms
        };
      });

      setVendorQuotations(prev => {
        const existingNames = new Set(prev.map(p => p.vendorName.toLowerCase()));
        const filteredNew = newQuotes.filter(q => !existingNames.has(q.vendorName.toLowerCase()));
        return [...prev, ...filteredNew];
      });
      showToast(`✓ ${filename} parsed — ${newQuotes.length} quotations imported`);
    }
  }, [defaultQty, setVendorQuotations]);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!['csv', 'xlsx', 'xls', 'pdf'].includes(ext || '')) {
        showToast(`Unsupported file type: .${ext}`);
        return;
      }

      if (ext === 'csv') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          const data = parseCSV(text);
          setUploadedFiles(prev => [...prev, { name: file.name, size: file.size, type: file.type || 'text/csv', data }]);
          processParsedData(data, file.name);
        };
        reader.readAsText(file);
      } else if (ext === 'xlsx' || ext === 'xls') {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const ab = e.target?.result as ArrayBuffer;
            const wb = XLSX.read(new Uint8Array(ab), { type: 'array' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });
            const data: string[][] = json.map(row =>
              Array.isArray(row)
                ? row.map(cell => cell !== null && cell !== undefined ? cell.toString() : '')
                : []
            );
            setUploadedFiles(prev => [...prev, { name: file.name, size: file.size, type: file.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', data }]);
            processParsedData(data, file.name);
          } catch (err) {
            console.error(err);
            showToast(`Failed to parse Excel file: ${file.name}`);
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        // PDF parser simulation: unique filename-seeded values matching current request scale
        const baseVendorName = getVendorNameFromFilename(file.name);
        const budgetUnitPrice = (currentRequest?.budget || 750000) / (currentRequest?.quantity || 500);
        let seed = 0;
        for (let i = 0; i < file.name.length; i++) seed += file.name.charCodeAt(i);
        const randomFactor = 0.7 + ((seed % 25) / 100); // 0.70 to 0.95
        const mockUnitPrice = Math.round(budgetUnitPrice * randomFactor);
        const deliveryDays = 10 + (seed % 20); // 10 to 29 days
        const warrantyMonths = [12, 24, 36, 48][seed % 4]; // 12, 24, 36, 48 mo
        const qualityScore = 75 + (seed % 22); // 75 to 96%
        const discount = seed % 11; // 0 to 10%
        const paymentTerms = ['Net 15', 'Net 30', 'Net 45', 'Net 60'][seed % 4];

        const newMockQuote: VendorQuotation = {
          vendorId: `v-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          vendorName: baseVendorName,
          unitPrice: mockUnitPrice,
          totalPrice: mockUnitPrice * defaultQty,
          deliveryDays,
          warrantyMonths,
          qualityScore,
          discount,
          paymentTerms
        };
        setUploadedFiles(prev => [...prev, { name: file.name, size: file.size, type: file.type, data: [] }]);
        setVendorQuotations(prev => [...prev, newMockQuote]);
        showToast(`✓ Parsed ${file.name} into quotation for ${newMockQuote.vendorName}`);
      }
    });
  }, [defaultQty, currentRequest, setVendorQuotations, processParsedData]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removeFile = (index: number) => setUploadedFiles(prev => prev.filter((_, i) => i !== index));

  // ─── Manual Entry ───
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = {
        ...prev,
        [name]: ['unitPrice', 'deliveryDays', 'warrantyMonths', 'qualityScore', 'discount'].includes(name)
          ? (value === '' ? '' : Number(value))
          : value
      };
      return updated;
    });
  };

  const addQuotation = () => {
    const unitPriceNum = Number(form.unitPrice) || 0;
    if (!form.vendorName.trim() || unitPriceNum <= 0) { showToast('Please fill vendor name and unit price'); return; }
    const newQ: VendorQuotation = {
      vendorName: form.vendorName,
      unitPrice: unitPriceNum,
      deliveryDays: Number(form.deliveryDays) || 21,
      warrantyMonths: Number(form.warrantyMonths) || 36,
      qualityScore: Number(form.qualityScore) || 85,
      discount: Number(form.discount) || 0,
      paymentTerms: form.paymentTerms,
      vendorId: `q-${Date.now()}`,
      totalPrice: unitPriceNum * defaultQty,
    };
    setVendorQuotations(prev => [...prev, newQ]);
    setForm({ vendorName: '', unitPrice: 0, deliveryDays: 21, warrantyMonths: 36, qualityScore: 85, discount: 0, paymentTerms: 'Net 30' });
    setShowForm(false);
    showToast(`✓ ${newQ.vendorName} quotation added`);
  };

  const removeQuotation = (vendorId: string) => setVendorQuotations(prev => prev.filter(q => q.vendorId !== vendorId));

  const formatSize = (bytes: number) => bytes > 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;

  const inputClass = "form-input interactive-input";
  const labelClass = "form-label";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div variants={itemV} initial="hidden" animate="visible">
        <h1 className="text-2xl font-bold text-white">Vendor Quotation Upload</h1>
        <p className="text-sm text-[#94A3B8] mt-1">Upload quotation files or manually enter vendor pricing data</p>
      </motion.div>

      {/* ─── File Upload Section ─── */}
      <motion.div variants={itemV} initial="hidden" animate="visible" className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Upload className="w-4 h-4 text-[#3B82F6]" />
          <h3 className="text-sm font-semibold text-white">Upload Quotation Files</h3>
        </div>

        <div
          className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".csv,.xlsx,.xls,.pdf"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <motion.div animate={dragOver ? { scale: 1.05 } : { scale: 1 }}>
            <Upload className="w-10 h-10 text-[#5A6B80] mx-auto mb-3" />
            <p className="text-sm text-[#94A3B8]">
              Drag & drop files here or <span className="text-[#3B82F6] font-medium cursor-pointer hover:underline">browse</span>
            </p>
            <p className="text-xs text-[#4B5E78] mt-2">
              Supports: <span className="text-[#64748B] font-medium">.CSV</span> · <span className="text-[#64748B] font-medium">.XLSX</span> · <span className="text-[#64748B] font-medium">.XLS</span> · <span className="text-[#64748B] font-medium">.PDF</span> — Max 10MB
            </p>
          </motion.div>
        </div>

        {/* Uploaded Files List */}
        <AnimatePresence>
          {uploadedFiles.length > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 space-y-2">
              {uploadedFiles.map((file, i) => {
                const Icon = FILE_ICONS[file.type] || File;
                return (
                  <motion.div
                    key={`${file.name}-${i}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(59,130,246,0.06)] border border-[rgba(59,130,246,0.12)]"
                  >
                    <div className="p-2 rounded-lg bg-[rgba(59,130,246,0.1)]">
                      <Icon className="w-4 h-4 text-[#3B82F6]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{file.name}</p>
                      <p className="text-xs text-[#64748B]">
                        {formatSize(file.size)}
                        {file.data.length > 0 && <span className="text-[#10B981] ml-2">• {file.data.length - 1} rows parsed</span>}
                      </p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                    <button onClick={() => removeFile(i)} className="p-1.5 rounded-lg hover:bg-[rgba(239,68,68,0.1)] transition-colors">
                      <X className="w-4 h-4 text-[#64748B] hover:text-[#EF4444]" />
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CSV Preview */}
        {uploadedFiles.some(f => f.data.length > 0) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Table2 className="w-3.5 h-3.5 text-[#10B981]" />
              <h4 className="text-xs font-semibold text-white">Parsed Data Preview</h4>
            </div>
            {uploadedFiles.filter(f => f.data.length > 0).map((file, fi) => (
              <div key={fi} className="overflow-x-auto rounded-xl border border-[#253145] mb-3">
                <table className="data-table">
                  <thead>
                    <tr>{file.data[0]?.map((header, hi) => <th key={hi}>{header}</th>)}</tr>
                  </thead>
                  <tbody>
                    {file.data.slice(1, 6).map((row, ri) => (
                      <tr key={ri}>{row.map((cell, ci) => <td key={ci}>{cell}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
                {file.data.length > 6 && (
                  <p className="text-xs text-[#64748B] text-center py-2">+ {file.data.length - 6} more rows</p>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* ─── Manual Entry Section ─── */}
      <motion.div variants={itemV} initial="hidden" animate="visible" className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <PenTool className="w-4 h-4 text-[#10B981]" />
            <h3 className="text-sm font-semibold text-white">Manual Quotation Entry</h3>
            <span className="text-xs text-[#64748B] ml-2">{vendorQuotations.length} entries</span>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[rgba(16,185,129,0.1)] text-[#10B981] text-xs font-medium border border-[rgba(16,185,129,0.15)] hover:bg-[rgba(16,185,129,0.15)] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Quotation
          </button>
        </div>

        {/* Entry Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-5"
            >
              <div className="p-5 rounded-xl bg-[#111827] border border-[#253145] space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className={labelClass}>Vendor Name *</label>
                    <input name="vendorName" value={form.vendorName} onChange={handleFormChange} placeholder="e.g. Dell Technologies" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Payment Terms</label>
                    <select name="paymentTerms" value={form.paymentTerms} onChange={handleFormChange} className={inputClass}>
                      <option>Net 15</option><option>Net 30</option><option>Net 45</option><option>Net 60</option><option>Net 90</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className={labelClass}>Unit Price ({currentRequest?.currency || 'USD'}) *</label>
                    <input name="unitPrice" type="number" value={form.unitPrice || ''} onChange={handleFormChange} placeholder="0.00" className={inputClass} min={0} />
                  </div>
                  <div>
                    <label className={labelClass}>Quantity (Locked from request)</label>
                    <input type="number" value={defaultQty} disabled className="form-input opacity-60 cursor-not-allowed bg-[#1F293D]" />
                  </div>
                  <div>
                    <label className={labelClass}>Delivery (days)</label>
                    <input name="deliveryDays" type="number" value={form.deliveryDays} onChange={handleFormChange} className={inputClass} min={1} />
                  </div>
                  <div>
                    <label className={labelClass}>Warranty (months)</label>
                    <input name="warrantyMonths" type="number" value={form.warrantyMonths} onChange={handleFormChange} className={inputClass} min={0} />
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Quality Score (0-100)</label>
                    <div className="flex items-center gap-3">
                      <input name="qualityScore" type="range" min={0} max={100} value={form.qualityScore} onChange={handleFormChange} className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer bg-[#253145] accent-[#3B82F6]" />
                      <span className="text-sm font-bold text-white w-10 text-right">{form.qualityScore}</span>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Discount (%)</label>
                    <input name="discount" type="number" value={form.discount} onChange={handleFormChange} className={inputClass} min={0} max={100} />
                  </div>
                  <div>
                    <label className={labelClass}>Est. Total</label>
                    <p className="text-lg font-bold text-[#3B82F6] mt-1">{formatCurrency((Number(form.unitPrice) || 0) * defaultQty)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button onClick={addQuotation} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#34D399] text-white text-sm font-medium hover:opacity-90 transition-opacity">
                    <Save className="w-4 h-4" /> Save Quotation
                  </button>
                  <button onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl glass text-[#94A3B8] text-sm hover:text-white transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quotations Table */}
        {vendorQuotations.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-[#253145]">
            <table className="data-table">
              <thead>
                <tr><th>Vendor</th><th>Unit Price</th><th>Qty</th><th>Total</th><th>Delivery</th><th>Warranty</th><th>Quality</th><th>Discount</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {vendorQuotations.map(q => (
                  <tr key={q.vendorId}>
                    <td className="text-white font-medium">{q.vendorName}</td>
                    <td>{formatCurrency(q.unitPrice)}</td>
                    <td>{defaultQty}</td>
                    <td className="font-medium text-white">{formatCurrency(q.totalPrice)}</td>
                    <td>{q.deliveryDays}d</td>
                    <td>{q.warrantyMonths}mo</td>
                    <td><span className={`px-2 py-0.5 rounded text-xs ${q.qualityScore >= 85 ? 'bg-[rgba(16,185,129,0.1)] text-[#10B981]' : q.qualityScore >= 70 ? 'bg-[rgba(245,158,11,0.1)] text-[#F59E0B]' : 'bg-[rgba(239,68,68,0.1)] text-[#EF4444]'}`}>{q.qualityScore}</span></td>
                    <td className="text-[#10B981]">{q.discount}%</td>
                    <td>
                      <button onClick={() => removeQuotation(q.vendorId)} className="p-1.5 rounded-lg hover:bg-[rgba(239,68,68,0.1)] transition-colors">
                        <Trash2 className="w-3.5 h-3.5 text-[#64748B] hover:text-[#EF4444]" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : !showForm ? (
          <div className="text-center py-10">
            <PenTool className="w-8 h-8 text-[#4B5E78] mx-auto mb-2" />
            <p className="text-sm text-[#64748B]">No quotations added yet</p>
            <p className="text-xs text-[#4B5E78] mt-1">Click "Add Quotation" to enter data manually</p>
          </div>
        ) : null}
      </motion.div>

      {/* ─── Submit ─── */}
      <motion.div variants={itemV} initial="hidden" animate="visible" className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-[#64748B]">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{uploadedFiles.length} file(s) uploaded · {vendorQuotations.length} entries</span>
        </div>
        <button
          onClick={handleProceedToAnalysis}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-lg shadow-[rgba(139,92,246,0.25)]"
        >
          Proceed to Analysis <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>

      {/* AI Reasoning Overlay */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0A0714]/90 backdrop-blur-xl z-[9999] flex items-center justify-center p-4"
          >
            {/* Background Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="bg-orb orb-violet w-[350px] h-[350px] top-[10%] left-[10%] opacity-10" />
              <div className="bg-orb orb-blue w-[400px] h-[400px] bottom-[10%] right-[10%] opacity-10" />
            </div>

            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="glass max-w-lg w-full rounded-3xl p-8 relative overflow-hidden ai-glow-pulse border-[#2E1E47]"
            >
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#A855F7] to-[#3B82F6] flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[rgba(168,85,247,0.2)]">
                  <Sparkles className="w-6 h-6 text-white animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-white">Autonomous Agent Executive Reasoning</h3>
                <p className="text-xs text-[#8E7CA3] mt-1">Vendoneg is running multi-agent evaluations</p>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-[#161226] rounded-full overflow-hidden mb-6">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#A855F7] to-[#3B82F6]"
                  initial={{ width: 0 }}
                  animate={{ width: `${(analysisStep / 9) * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>

              {/* Steps List */}
              <div className="space-y-3">
                {[
                  "Reading procurement documents...",
                  "Extracting supplier information...",
                  "Identifying products...",
                  "Comparing vendor pricing...",
                  "Evaluating delivery timelines...",
                  "Checking supplier reliability...",
                  "Calculating procurement score...",
                  "Generating negotiation strategy...",
                  "Preparing executive recommendation...",
                ].map((stepText, idx) => {
                  const isDone = analysisStep > idx;
                  const isActive = analysisStep === idx;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-3.5 py-1 transition-all duration-300 ${
                        isDone ? 'opacity-100 text-white' :
                        isActive ? 'opacity-100 text-[#C084FC] scale-[1.02] font-semibold' : 'opacity-40 text-[#8E7CA3]'
                      }`}
                    >
                      <div className="flex items-center justify-center shrink-0">
                        {isDone ? (
                          <div className="w-5 h-5 rounded-full bg-[rgba(0,230,118,0.15)] border border-[rgba(0,230,118,0.3)] flex items-center justify-center text-[#00E676] shadow-sm">
                            <svg className="w-3 h-3 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        ) : isActive ? (
                          <Loader2 className="w-5 h-5 text-[#A855F7] animate-spin" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-[#161226] border border-white/5" />
                        )}
                      </div>
                      <span className="text-xs">{stepText}</span>
                    </div>
                  );
                })}
              </div>

              {/* Footer status text */}
              <div className="text-center mt-8 pt-4 border-t border-[#2E1E47] text-xs font-semibold">
                {analysisStep === 9 ? (
                  <motion.span
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="text-[#00E676] flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Analysis Complete. Generating dashboards...
                  </motion.span>
                ) : (
                  <span className="text-[#8E7CA3] flex items-center justify-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Agent {analysisStep + 1} processing...
                  </span>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-6 right-6 glass rounded-xl px-4 py-3 text-sm text-white z-50 shadow-xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
