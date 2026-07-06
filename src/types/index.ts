// ============================================================================
// AI Procurement Copilot — Core Types & Interfaces
// ============================================================================

// --- Vendor Types ---
export interface Vendor {
  id: string;
  name: string;
  logo?: string;
  category: string;
  rating: number;
  location: string;
  contact: string;
  email: string;
  yearsInBusiness: number;
  certifications: string[];
  riskLevel: 'low' | 'medium' | 'high';
  status: 'active' | 'inactive' | 'under_review';
}

export interface VendorQuotation {
  vendorId: string;
  vendorName: string;
  unitPrice: number;
  totalPrice: number;
  deliveryDays: number;
  warrantyMonths: number;
  qualityScore: number;
  discount: number;
  paymentTerms: string;
}

export interface VendorScore {
  vendorId: string;
  vendorName: string;
  priceScore: number;
  qualityScore: number;
  deliveryScore: number;
  warrantyScore: number;
  totalScore: number;
  rank: number;
}

// --- Procurement Types ---
export interface ProcurementRequest {
  id: string;
  itemName: string;
  category: string;
  quantity: number;
  budget: number;
  currency: string;
  deliveryDeadline: string;
  qualityRequirement: string;
  specialRequirements: string;
  procurementCyclesPerYear: number;
  attachments: string[];
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// --- Agent Types ---
export type AgentStatus = 'idle' | 'running' | 'completed' | 'error' | 'retrying';

export interface AgentInfo {
  id: number;
  name: string;
  description: string;
  icon: string;
  status: AgentStatus;
  progress: number;
  startTime?: string;
  endTime?: string;
  retryCount: number;
  output?: Record<string, unknown>;
  error?: string;
}

export interface AgentLogEntry {
  timestamp: string;
  agentId: number;
  agentName: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
}

// --- Workflow Types ---
export type WorkflowStatus = 'idle' | 'running' | 'completed' | 'paused' | 'error';

export interface WorkflowRun {
  id: string;
  procurementRequestId: string;
  status: WorkflowStatus;
  currentAgentIndex: number;
  agents: AgentInfo[];
  logs: AgentLogEntry[];
  sharedMemory: SharedMemory;
  startedAt?: string;
  completedAt?: string;
}

export interface SharedMemory {
  request?: ProcurementRequest;
  vendors?: Vendor[];
  quotations?: VendorQuotation[];
  scores?: VendorScore[];
  marketData?: MarketIntelligence;
  riskAssessment?: RiskAssessment;
  negotiationStrategy?: NegotiationStrategy;
  negotiations?: NegotiationResult[];
  savingsPrediction?: SavingsPrediction;
  finalDecision?: FinalDecision;
}

// --- Agent Output Types ---
export interface MarketIntelligence {
  averageMarketPrice: number;
  priceRange: { min: number; max: number };
  marketTrend: 'increasing' | 'decreasing' | 'stable';
  competitorPricing: { name: string; price: number }[];
  industryBenchmarks: { metric: string; value: string }[];
  recommendations: string[];
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high';
  vendorRisks: VendorRisk[];
  mitigationStrategies: string[];
}

export interface VendorRisk {
  vendorId: string;
  vendorName: string;
  financialRisk: number;
  deliveryRisk: number;
  complianceRisk: number;
  qualityRisk: number;
  overallRisk: number;
  riskLevel: 'low' | 'medium' | 'high';
  flags: string[];
}

export interface NegotiationStrategy {
  batna: string;
  targetPrice: number;
  reservationPrice: number;
  tactics: NegotiationTactic[];
  vendorApproaches: { vendorName: string; approach: string; targetDiscount: number }[];
}

export interface NegotiationTactic {
  name: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  expectedImpact: string;
}

export interface NegotiationMessage {
  role: 'system' | 'buyer' | 'vendor';
  content: string;
  timestamp: string;
  vendorName?: string;
}

export interface NegotiationResult {
  vendorName: string;
  originalPrice: number;
  negotiatedPrice: number;
  discount: number;
  messages: NegotiationMessage[];
  status: 'successful' | 'partial' | 'failed';
}

export interface SavingsPrediction {
  currentBestPrice: number;
  projectedSavings: number;
  savingsPercentage: number;
  annualSavings: number;
  roi: number;
  paybackPeriod: string;
  savingsBreakdown: { category: string; amount: number }[];
  forecastData: { quarter: string; projected: number; actual?: number }[];
}

export interface FinalDecision {
  recommendedVendor: string;
  recommendedVendorId: string;
  totalScore: number;
  finalPrice: number;
  savings: number;
  savingsPercentage: number;
  riskLevel: 'low' | 'medium' | 'high';
  approvalStatus: 'approved' | 'pending' | 'rejected';
  rationale: string[];
  alternativeVendors: { name: string; score: number; price: number }[];
  nextSteps: string[];
}

// --- Dashboard Types ---
export interface KPICard {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'danger';
  prefix?: string;
  suffix?: string;
}

// --- Settings ---
export interface ScoringWeights {
  price: number;
  quality: number;
  delivery: number;
  warranty: number;
}

export interface AppSettings {
  scoringWeights: ScoringWeights;
  defaultCurrency: string;
  procurementCyclesPerYear: number;
  theme: 'dark' | 'light';
  notifications: boolean;
}

// --- Activity Feed ---
export interface ActivityItem {
  id: string;
  type: 'procurement' | 'vendor' | 'workflow' | 'system';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
}
