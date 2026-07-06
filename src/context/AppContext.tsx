import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import type {
  ProcurementRequest, WorkflowRun, SharedMemory, AgentInfo,
  AgentLogEntry, AgentStatus, AppSettings, VendorQuotation,
  VendorScore, MarketIntelligence, RiskAssessment, NegotiationStrategy,
  NegotiationResult, SavingsPrediction, FinalDecision
} from '../types';
import {
  AGENT_DEFINITIONS, DEMO_REQUEST, DEMO_VENDORS, DEMO_QUOTATIONS,
  DEMO_SCORES, DEMO_MARKET_INTELLIGENCE, DEMO_RISK_ASSESSMENT,
  DEMO_NEGOTIATION_STRATEGY, DEMO_NEGOTIATIONS, DEMO_SAVINGS,
  DEMO_DECISION, DEMO_ACTIVITIES
} from '../lib/demo-data';
import { generateId, delay, formatCurrency, setGlobalCurrency } from '../lib/utils';

interface AppContextType {
  // Procurement
  currentRequest: ProcurementRequest | null;
  setCurrentRequest: (req: ProcurementRequest | null) => void;

  // Quotations
  vendorQuotations: VendorQuotation[];
  setVendorQuotations: React.Dispatch<React.SetStateAction<VendorQuotation[]>>;

  // Workflow
  workflowRun: WorkflowRun | null;
  startWorkflow: (request: ProcurementRequest) => Promise<void>;
  resetWorkflow: () => void;

  // Shared Memory (agent outputs)
  sharedMemory: SharedMemory;

  // Settings
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;

  // Demo state
  isDemoMode: boolean;
  loadDemoData: () => void;

  // Activities
  activities: typeof DEMO_ACTIVITIES;
}

const defaultSettings: AppSettings = {
  scoringWeights: { price: 40, quality: 30, delivery: 20, warranty: 10 },
  defaultCurrency: 'USD',
  procurementCyclesPerYear: 4,
  theme: 'dark',
  notifications: true,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentRequest, setCurrentRequest] = useState<ProcurementRequest | null>(null);
  const [vendorQuotations, setVendorQuotations] = useState<VendorQuotation[]>([]);
  const [workflowRun, setWorkflowRun] = useState<WorkflowRun | null>(null);
  const [sharedMemory, setSharedMemory] = useState<SharedMemory>({});
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [activities] = useState(DEMO_ACTIVITIES);
  const abortRef = useRef(false);

  // Sync currency changes with global currency formatter in utils.ts
  React.useEffect(() => {
    const cur = currentRequest?.currency || settings.defaultCurrency || 'USD';
    setGlobalCurrency(cur);
  }, [currentRequest?.currency, settings.defaultCurrency]);

  const loadDemoData = useCallback(() => {
    setCurrentRequest(DEMO_REQUEST);
    setVendorQuotations(DEMO_QUOTATIONS);
    setSharedMemory({
      request: DEMO_REQUEST,
      vendors: DEMO_VENDORS,
      quotations: DEMO_QUOTATIONS,
      scores: DEMO_SCORES,
      marketData: DEMO_MARKET_INTELLIGENCE,
      riskAssessment: DEMO_RISK_ASSESSMENT,
      negotiationStrategy: DEMO_NEGOTIATION_STRATEGY,
      negotiations: DEMO_NEGOTIATIONS,
      savingsPrediction: DEMO_SAVINGS,
      finalDecision: DEMO_DECISION,
    });
    setIsDemoMode(true);

    // Create a completed workflow run
    const agents: AgentInfo[] = AGENT_DEFINITIONS.map((def) => ({
      ...def,
      status: 'completed' as AgentStatus,
      progress: 100,
      retryCount: def.id === 4 ? 1 : 0,
    }));

    setWorkflowRun({
      id: generateId(),
      procurementRequestId: DEMO_REQUEST.id,
      status: 'completed',
      currentAgentIndex: 8,
      agents,
      logs: generateDemoLogs(),
      sharedMemory: {},
      startedAt: '2025-06-15T09:00:00Z',
      completedAt: '2025-06-15T10:30:00Z',
    });
  }, []);

  const resetWorkflow = useCallback(() => {
    abortRef.current = true;
    setWorkflowRun(null);
    setSharedMemory({});
    setIsDemoMode(false);
    setVendorQuotations([]);
    setCurrentRequest(null);
  }, []);

  const startWorkflow = useCallback(async (request: ProcurementRequest) => {
    abortRef.current = false;
    setCurrentRequest(request);

    const agents: AgentInfo[] = AGENT_DEFINITIONS.map((def) => ({
      ...def,
      status: 'idle' as AgentStatus,
      progress: 0,
      retryCount: 0,
    }));

    const newRun: WorkflowRun = {
      id: generateId(),
      procurementRequestId: request.id,
      status: 'running',
      currentAgentIndex: 0,
      agents,
      logs: [],
      sharedMemory: {},
      startedAt: new Date().toISOString(),
    };

    setWorkflowRun(newRun);

    // ─── DYNAMIC AGENT OUTPUT GENERATOR ───
    // If no custom quotations exist, generate realistic ones based on budget & quantity
    const actualQuotations = vendorQuotations.length > 0
      ? vendorQuotations
      : [
          { vendorId: 'v1', vendorName: 'Dell Technologies', unitPrice: Math.round((request.budget / request.quantity) * 0.9), totalPrice: Math.round((request.budget / request.quantity) * 0.9) * request.quantity, deliveryDays: 21, warrantyMonths: 36, qualityScore: 92, discount: 5, paymentTerms: 'Net 45' },
          { vendorId: 'v2', vendorName: 'HP Enterprise', unitPrice: Math.round((request.budget / request.quantity) * 0.95), totalPrice: Math.round((request.budget / request.quantity) * 0.95) * request.quantity, deliveryDays: 25, warrantyMonths: 36, qualityScore: 90, discount: 3, paymentTerms: 'Net 30' },
          { vendorId: 'v3', vendorName: 'Lenovo Group', unitPrice: Math.round((request.budget / request.quantity) * 0.85), totalPrice: Math.round((request.budget / request.quantity) * 0.85) * request.quantity, deliveryDays: 30, warrantyMonths: 24, qualityScore: 85, discount: 8, paymentTerms: 'Net 60' },
          { vendorId: 'v4', vendorName: 'Acer Inc.', unitPrice: Math.round((request.budget / request.quantity) * 0.78), totalPrice: Math.round((request.budget / request.quantity) * 0.78) * request.quantity, deliveryDays: 35, warrantyMonths: 24, qualityScore: 78, discount: 10, paymentTerms: 'Net 30' },
          { vendorId: 'v5', vendorName: 'ASUS Corporation', unitPrice: Math.round((request.budget / request.quantity) * 0.87), totalPrice: Math.round((request.budget / request.quantity) * 0.87) * request.quantity, deliveryDays: 28, warrantyMonths: 36, qualityScore: 87, discount: 6, paymentTerms: 'Net 45' }
        ];

    // Compute scores dynamically
    const weights = settings.scoringWeights;
    const minPrice = Math.min(...actualQuotations.map(q => q.unitPrice));
    const minDelivery = Math.min(...actualQuotations.map(q => q.deliveryDays));
    const maxWarranty = Math.max(...actualQuotations.map(q => q.warrantyMonths));

    const scores: VendorScore[] = actualQuotations.map(q => {
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
    scores.sort((a, b) => b.totalScore - a.totalScore);
    scores.forEach((s, idx) => { s.rank = idx + 1; });

    // Compute Market Intelligence
    const avgUnitPrice = Math.round(actualQuotations.reduce((sum, q) => sum + q.unitPrice, 0) / actualQuotations.length);
    const marketData: MarketIntelligence = {
      averageMarketPrice: avgUnitPrice,
      priceRange: { min: Math.round(minPrice * 0.9), max: Math.round(avgUnitPrice * 1.25) },
      marketTrend: 'stable',
      competitorPricing: [
        { name: 'Industry Average', price: avgUnitPrice },
        { name: 'Government Contract', price: Math.round(avgUnitPrice * 0.92) },
        { name: 'Enterprise Bulk', price: Math.round(minPrice * 0.98) },
        { name: 'Retail MSRP', price: Math.round(avgUnitPrice * 1.3) },
      ],
      industryBenchmarks: [
        { metric: 'Average Delivery Time', value: `${Math.round(actualQuotations.reduce((sum, q) => sum + q.deliveryDays, 0) / actualQuotations.length)} days` },
        { metric: 'Average Warranty', value: `${Math.round(actualQuotations.reduce((sum, q) => sum + q.warrantyMonths, 0) / actualQuotations.length)} months` },
        { metric: 'Bulk Discount Range', value: '5-15%' },
        { metric: 'Quality Defect Rate', value: '< 2%' },
      ],
      recommendations: [
        `Current pricing for ${request.itemName} is within expected market thresholds.`,
        'Room for negotiation on volume discounts exists for primary vendors.',
        'Leverage warranty term matching to reduce lifetime support fees.',
      ],
    };

    // Compute Risk Assessment
    const recommendedVendor = scores[0];
    const overallRisk = recommendedVendor.qualityScore < 80 ? 'medium' : 'low';
    const vendorRisks = actualQuotations.map(q => {
      const score = scores.find(s => s.vendorName === q.vendorName);
      const overallRiskVal = Math.round((100 - (score?.totalScore || 80)) * 0.3 * 10) / 10;
      return {
        vendorId: q.vendorId,
        vendorName: q.vendorName,
        financialRisk: q.unitPrice > minPrice * 1.2 ? 20 : 10,
        deliveryRisk: q.deliveryDays > minDelivery * 1.2 ? 25 : 15,
        complianceRisk: 5,
        qualityRisk: 100 - q.qualityScore,
        overallRisk: overallRiskVal,
        riskLevel: (overallRiskVal > 15 ? 'medium' : 'low') as 'low' | 'medium' | 'high',
        flags: q.deliveryDays > 30 ? ['Longer delivery timeline'] : [],
      };
    });
    const riskAssessment: RiskAssessment = {
      overallRisk: overallRisk as 'low' | 'medium' | 'high',
      vendorRisks,
      mitigationStrategies: [
        `Establish performance-based SLA terms tied to "${request.qualityRequirement || 'standard quality'}" for ${request.itemName || 'procured items'}.`,
        `Pre-qualify backup vendors in the ${request.category || 'General'} category to ensure continuity if the primary supplier fails.`,
        `Enforce delivery milestone tracking against the ${request.deliveryDeadline || 'agreed'} deadline with penalty clauses for delays.`,
        `Lock in unit pricing for ${request.procurementCyclesPerYear || 4} procurement cycles to hedge against market volatility.`,
      ],
    };

    // Compute Strategy — dynamically based on actual procurement requirements
    const bestQuote = actualQuotations.find(q => q.vendorName === recommendedVendor.vendorName) || actualQuotations[0];
    const secondBestQuote = actualQuotations.find(q => q.vendorName === scores[1]?.vendorName) || actualQuotations[1] || bestQuote;
    const targetPrice = Math.round(bestQuote.unitPrice * 0.9);
    const reservationPrice = bestQuote.unitPrice;

    const itemLabel = request.itemName || 'goods';
    const qty = request.quantity || 1;
    const qualityReq = request.qualityRequirement || 'standard quality';
    const deadline = request.deliveryDeadline || 'the requested timeline';
    const category = request.category || 'General';
    const specialReq = request.specialRequirements || '';
    const cycles = request.procurementCyclesPerYear || settings.procurementCyclesPerYear || 4;
    const budgetPerUnit = request.budget > 0 && request.quantity > 0 ? Math.round(request.budget / request.quantity) : bestQuote.unitPrice;

    // Build dynamic tactics array based on what requirements exist
    const dynamicTactics: { name: string; description: string; priority: 'high' | 'medium' | 'low'; expectedImpact: string }[] = [
      {
        name: `Volume Leverage on ${itemLabel}`,
        description: `Leverage the bulk order of ${qty.toLocaleString()} units of "${itemLabel}" across ${cycles} procurement cycles/year to negotiate volume-tier pricing from ${recommendedVendor.vendorName}. Annual volume: ${(qty * cycles).toLocaleString()} units.`,
        priority: 'high',
        expectedImpact: `${Math.min(Math.round((qty / 100) * 2), 15)}% price reduction`,
      },
      {
        name: 'Quality & Compliance Alignment',
        description: `Enforce strict compliance with requirement: "${qualityReq}". Any deviation from ${category} standards should be grounds for unit cost offsets or penalty clauses.`,
        priority: 'high',
        expectedImpact: 'SLA-backed warranty guarantees',
      },
      {
        name: 'Delivery Timeline Commitments',
        description: `Use the delivery deadline of ${deadline} as a negotiation lever. Demand liquidated damages or rebate clauses if ${recommendedVendor.vendorName} fails to meet the shipping schedule for ${itemLabel}.`,
        priority: 'medium',
        expectedImpact: 'Reduced supply chain risk',
      },
      {
        name: 'Competitive Bid Pressure',
        description: `Present ${secondBestQuote.vendorName}'s competitive quote of ${formatCurrency(secondBestQuote.unitPrice)}/unit to ${recommendedVendor.vendorName} to pressure a price match or improvement on ${itemLabel}.`,
        priority: 'high',
        expectedImpact: `${formatCurrency(bestQuote.unitPrice - targetPrice)}/unit savings`,
      },
    ];

    // Add special requirements tactic if user provided them
    if (specialReq.trim().length > 0) {
      dynamicTactics.push({
        name: 'Special Requirements Negotiation',
        description: `Use the following custom specifications as leverage: "${specialReq}". Vendors who can meet these requirements earn preferred status; those who cannot face steeper discount demands.`,
        priority: 'medium',
        expectedImpact: 'Value-added compliance',
      });
    }

    // Add budget ceiling tactic
    if (request.budget > 0) {
      dynamicTactics.push({
        name: 'Budget Ceiling Enforcement',
        description: `Our approved budget ceiling is ${formatCurrency(request.budget)} for ${qty.toLocaleString()} units (${formatCurrency(budgetPerUnit)}/unit). Any proposal exceeding this triggers an automatic escalation to alternate suppliers.`,
        priority: 'medium',
        expectedImpact: `Cap at ${formatCurrency(budgetPerUnit)}/unit`,
      });
    }

    const negotiationStrategy: NegotiationStrategy = {
      batna: `If negotiations with ${recommendedVendor.vendorName} stall, pivot to ${secondBestQuote.vendorName} as the fallback supplier. Their quote of ${formatCurrency(secondBestQuote.unitPrice)}/unit (${formatCurrency(secondBestQuote.totalPrice)} total) for "${itemLabel}" in ${category} has been pre-validated against our quality criteria: "${qualityReq}". Delivery capability within ${deadline} has been confirmed.`,
      targetPrice,
      reservationPrice,
      tactics: dynamicTactics,
      vendorApproaches: actualQuotations.map(q => ({
        vendorName: q.vendorName,
        approach: `Target ${formatCurrency(Math.round(q.unitPrice * 0.9))}/unit for ${itemLabel} (${Math.round(((q.unitPrice - q.unitPrice * 0.9) / q.unitPrice) * 100)}% below current quote)`,
        targetDiscount: Math.round(((q.unitPrice - q.unitPrice * 0.9) / q.unitPrice) * 100),
      })),
    };

    // Compute Negotiations Dialogues
    const negotiations: NegotiationResult[] = actualQuotations.map(q => {
      const isWinner = q.vendorName === recommendedVendor.vendorName;
      const negotiatedPrice = isWinner ? Math.round(q.unitPrice * 0.9) : q.unitPrice;
      const discount = isWinner ? 10 : 0;
      return {
        vendorName: q.vendorName,
        originalPrice: q.unitPrice,
        negotiatedPrice,
        discount,
        status: isWinner ? 'successful' : 'partial',
        messages: [
          { role: 'system', content: `Negotiation session started with ${q.vendorName}`, timestamp: new Date().toISOString() },
          { role: 'buyer', content: `We reviewed your quote of ${formatCurrency(q.unitPrice)}. Can you offer a volume discount of 10%?`, timestamp: new Date().toISOString() },
          { role: 'vendor', content: isWinner ? `We accept your proposal. We can lower the unit price to ${formatCurrency(negotiatedPrice)}.` : `Our current quote is our best offers.`, timestamp: new Date().toISOString() }
        ]
      };
    });

    // Compute Savings
    const winnerNegotiation = negotiations.find(n => n.vendorName === recommendedVendor.vendorName) || negotiations[0];
    const projectedSavings = (request.budget - (winnerNegotiation.negotiatedPrice * request.quantity));
    const savingsPercentage = Math.round((projectedSavings / request.budget) * 100);
    const annualSavings = projectedSavings * settings.procurementCyclesPerYear;
    const roi = Math.round((projectedSavings / (winnerNegotiation.negotiatedPrice * request.quantity)) * 100);

    const savingsPrediction: SavingsPrediction = {
      currentBestPrice: winnerNegotiation.negotiatedPrice,
      projectedSavings,
      savingsPercentage,
      annualSavings,
      roi,
      paybackPeriod: 'Immediate',
      savingsBreakdown: [
        { category: 'Negotiated Discount', amount: projectedSavings },
      ],
      forecastData: [
        { quarter: 'Q3 2025', projected: Math.round(projectedSavings * 0.25) },
        { quarter: 'Q4 2025', projected: Math.round(projectedSavings * 0.25) },
        { quarter: 'Q1 2026', projected: Math.round(projectedSavings * 0.25) },
        { quarter: 'Q2 2026', projected: Math.round(projectedSavings * 0.25) },
      ],
    };

    // Compute Decision
    const finalDecision: FinalDecision = {
      recommendedVendor: recommendedVendor.vendorName,
      recommendedVendorId: recommendedVendor.vendorId,
      totalScore: recommendedVendor.totalScore,
      finalPrice: winnerNegotiation.negotiatedPrice * request.quantity,
      savings: projectedSavings,
      savingsPercentage,
      riskLevel: overallRisk as 'low' | 'medium' | 'high',
      approvalStatus: 'approved',
      rationale: [
        `Achieved highest total score (${recommendedVendor.totalScore}/100).`,
        `Direct price reduction to ${formatCurrency(winnerNegotiation.negotiatedPrice)} fits within budget limits.`,
        `Low risk profile and robust technical capabilities.`,
      ],
      alternativeVendors: scores.slice(1, 3).map(s => {
        const q = actualQuotations.find(quote => quote.vendorName === s.vendorName) || actualQuotations[0];
        return { name: s.vendorName, score: s.totalScore, price: q.totalPrice };
      }),
      nextSteps: [
        `Issue formal purchase contract to ${recommendedVendor.vendorName}`,
        'Define service integration timeline',
      ],
    };

    const finalOutputs = [
      { request },
      { quotations: actualQuotations },
      { scores },
      { marketData },
      { riskAssessment },
      { negotiationStrategy },
      { negotiations },
      { savingsPrediction },
      { finalDecision },
    ];

    setSharedMemory({
      request,
      vendors: DEMO_VENDORS,
    });

    for (let i = 0; i < 9; i++) {
      if (abortRef.current) break;

      // Set agent to running
      setWorkflowRun(prev => {
        if (!prev) return prev;
        const updatedAgents = [...prev.agents];
        updatedAgents[i] = { ...updatedAgents[i], status: 'running', progress: 0, startTime: new Date().toISOString() };
        const log: AgentLogEntry = {
          timestamp: new Date().toISOString(),
          agentId: i + 1,
          agentName: AGENT_DEFINITIONS[i].name,
          level: 'info',
          message: `Starting ${AGENT_DEFINITIONS[i].name}...`,
        };
        return { ...prev, agents: updatedAgents, currentAgentIndex: i, logs: [...prev.logs, log] };
      });

      // Simulate progress
      for (let p = 0; p <= 100; p += 20) {
        if (abortRef.current) break;
        await delay(150 + Math.random() * 200);
        setWorkflowRun(prev => {
          if (!prev) return prev;
          const updatedAgents = [...prev.agents];
          updatedAgents[i] = { ...updatedAgents[i], progress: Math.min(p, 100) };
          return { ...prev, agents: updatedAgents };
        });
      }

      // Simulate retry for agent 4 (Market Intelligence)
      if (i === 3) {
        setWorkflowRun(prev => {
          if (!prev) return prev;
          const updatedAgents = [...prev.agents];
          updatedAgents[i] = { ...updatedAgents[i], status: 'retrying', retryCount: 1, progress: 60 };
          const log: AgentLogEntry = {
            timestamp: new Date().toISOString(),
            agentId: 4,
            agentName: 'Market Intelligence Agent',
            level: 'warning',
            message: 'Transient API error — retrying (attempt 1/2)...',
          };
          return { ...prev, agents: updatedAgents, logs: [...prev.logs, log] };
        });
        await delay(500);
        for (let p = 60; p <= 100; p += 20) {
          await delay(100);
          setWorkflowRun(prev => {
            if (!prev) return prev;
            const updatedAgents = [...prev.agents];
            updatedAgents[i] = { ...updatedAgents[i], progress: p, status: 'running' };
            return { ...prev, agents: updatedAgents };
          });
        }
      }

      // Mark agent as completed
      setWorkflowRun(prev => {
        if (!prev) return prev;
        const updatedAgents = [...prev.agents];
        updatedAgents[i] = { ...updatedAgents[i], status: 'completed', progress: 100, endTime: new Date().toISOString() };
        const log: AgentLogEntry = {
          timestamp: new Date().toISOString(),
          agentId: i + 1,
          agentName: AGENT_DEFINITIONS[i].name,
          level: 'success',
          message: `${AGENT_DEFINITIONS[i].name} completed successfully`,
        };
        return { ...prev, agents: updatedAgents, logs: [...prev.logs, log] };
      });

      // Update shared memory
      setSharedMemory(prev => ({ ...prev, ...finalOutputs[i] }));
    }

    // Mark workflow as completed
    if (!abortRef.current) {
      setWorkflowRun(prev => prev ? { ...prev, status: 'completed', completedAt: new Date().toISOString() } : prev);
      setIsDemoMode(true);
    }
  }, [vendorQuotations, settings.scoringWeights, settings.procurementCyclesPerYear]);

  const updateSettings = useCallback((partial: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  }, []);

  return (
    <AppContext.Provider value={{
      currentRequest, setCurrentRequest,
      vendorQuotations, setVendorQuotations,
      workflowRun, startWorkflow, resetWorkflow,
      sharedMemory, settings, updateSettings,
      isDemoMode, loadDemoData, activities,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

// Helper to generate demo logs
function generateDemoLogs(): AgentLogEntry[] {
  return AGENT_DEFINITIONS.flatMap((def) => [
    { timestamp: new Date().toISOString(), agentId: def.id, agentName: def.name, level: 'info' as const, message: `Starting ${def.name}...` },
    ...(def.id === 4 ? [{ timestamp: new Date().toISOString(), agentId: 4, agentName: 'Market Intelligence Agent', level: 'warning' as const, message: 'Transient API error — retrying (attempt 1/2)...' }] : []),
    { timestamp: new Date().toISOString(), agentId: def.id, agentName: def.name, level: 'success' as const, message: `${def.name} completed successfully` },
  ]);
}
