import type { AgentInfo, Vendor, VendorQuotation, VendorScore, MarketIntelligence, RiskAssessment, VendorRisk, NegotiationStrategy, NegotiationResult, NegotiationMessage, SavingsPrediction, FinalDecision, ProcurementRequest, ActivityItem } from '../types';

// ============================================================================
// Agent Definitions
// ============================================================================

export const AGENT_DEFINITIONS: Omit<AgentInfo, 'status' | 'progress' | 'retryCount' | 'output'>[] = [
  { id: 1, name: 'Requirements & Budget Agent', description: 'Analyzes procurement requirements, validates budget constraints, and identifies key specifications', icon: 'ClipboardList' },
  { id: 2, name: 'Vendor Quotation Agent', description: 'Collects and normalizes vendor quotations, pricing tiers, and delivery terms', icon: 'FileText' },
  { id: 3, name: 'Vendor Scoring Agent', description: 'Evaluates vendors using weighted scoring: Price 40%, Quality 30%, Delivery 20%, Warranty 10%', icon: 'Award' },
  { id: 4, name: 'Market Intelligence Agent', description: 'Gathers market benchmarks, competitor pricing, and industry trends', icon: 'TrendingUp' },
  { id: 5, name: 'Risk Detection Agent', description: 'Assesses vendor risks across financial, delivery, compliance, and quality dimensions', icon: 'ShieldAlert' },
  { id: 6, name: 'Negotiation Strategy Agent', description: 'Develops BATNA analysis, target prices, and negotiation tactics per vendor', icon: 'Target' },
  { id: 7, name: 'Negotiation Chat Agent', description: 'Simulates vendor negotiations with AI-powered dialogue and counter-offers', icon: 'MessageSquare' },
  { id: 8, name: 'Savings Prediction Agent', description: 'Projects cost savings, ROI calculations, and annual savings forecasts', icon: 'PiggyBank' },
  { id: 9, name: 'Final Procurement Decision Agent', description: 'Generates final recommendation with rationale and approval workflow', icon: 'CheckCircle2' },
];

// ============================================================================
// Demo Vendors
// ============================================================================

export const DEMO_VENDORS: Vendor[] = [
  { id: 'v1', name: 'Dell Technologies', category: 'IT Hardware', rating: 4.5, location: 'Austin, TX', contact: 'John Mitchell', email: 'enterprise@dell.com', yearsInBusiness: 40, certifications: ['ISO 9001', 'ISO 14001', 'EPEAT Gold'], riskLevel: 'low', status: 'active', logo: 'D' },
  { id: 'v2', name: 'HP Enterprise', category: 'IT Hardware', rating: 4.3, location: 'Palo Alto, CA', contact: 'Sarah Chen', email: 'procurement@hp.com', yearsInBusiness: 85, certifications: ['ISO 9001', 'ISO 27001', 'ENERGY STAR'], riskLevel: 'low', status: 'active', logo: 'H' },
  { id: 'v3', name: 'Lenovo Group', category: 'IT Hardware', rating: 4.1, location: 'Beijing, China', contact: 'Wei Zhang', email: 'business@lenovo.com', yearsInBusiness: 40, certifications: ['ISO 9001', 'TCO Certified'], riskLevel: 'medium', status: 'active', logo: 'L' },
  { id: 'v4', name: 'Acer Inc.', category: 'IT Hardware', rating: 3.8, location: 'Taipei, Taiwan', contact: 'Ming Liu', email: 'corporate@acer.com', yearsInBusiness: 48, certifications: ['ISO 9001', 'EPEAT Silver'], riskLevel: 'medium', status: 'active', logo: 'A' },
  { id: 'v5', name: 'ASUS Corporation', category: 'IT Hardware', rating: 4.0, location: 'Taipei, Taiwan', contact: 'Yuki Tanaka', email: 'b2b@asus.com', yearsInBusiness: 35, certifications: ['ISO 9001', 'ISO 14001'], riskLevel: 'low', status: 'active', logo: 'AS' },
];

// ============================================================================
// Demo Procurement Request
// ============================================================================

export const DEMO_REQUEST: ProcurementRequest = {
  id: 'PR-2025-001',
  itemName: 'Enterprise Laptops',
  category: 'IT Hardware',
  quantity: 500,
  budget: 750000,
  currency: 'USD',
  deliveryDeadline: '2025-09-30',
  qualityRequirement: 'Business-grade with 3-year warranty minimum, 16GB RAM, 512GB SSD, Intel i7 or equivalent',
  specialRequirements: 'Must support Windows 11 Pro, TPM 2.0, docking station compatibility. Need bulk deployment image support.',
  procurementCyclesPerYear: 4,
  attachments: [],
  status: 'active',
  createdAt: '2025-06-15T09:00:00Z',
  updatedAt: '2025-06-15T09:00:00Z',
};

// ============================================================================
// Demo Agent Outputs (pre-computed for instant dashboard population)
// ============================================================================

export const DEMO_QUOTATIONS: VendorQuotation[] = [
  { vendorId: 'v1', vendorName: 'Dell Technologies', unitPrice: 1350, totalPrice: 675000, deliveryDays: 21, warrantyMonths: 36, qualityScore: 92, discount: 5, paymentTerms: 'Net 45' },
  { vendorId: 'v2', vendorName: 'HP Enterprise', unitPrice: 1420, totalPrice: 710000, deliveryDays: 25, warrantyMonths: 36, qualityScore: 90, discount: 3, paymentTerms: 'Net 30' },
  { vendorId: 'v3', vendorName: 'Lenovo Group', unitPrice: 1280, totalPrice: 640000, deliveryDays: 30, warrantyMonths: 24, qualityScore: 85, discount: 8, paymentTerms: 'Net 60' },
  { vendorId: 'v4', vendorName: 'Acer Inc.', unitPrice: 1180, totalPrice: 590000, deliveryDays: 35, warrantyMonths: 24, qualityScore: 78, discount: 10, paymentTerms: 'Net 30' },
  { vendorId: 'v5', vendorName: 'ASUS Corporation', unitPrice: 1310, totalPrice: 655000, deliveryDays: 28, warrantyMonths: 36, qualityScore: 87, discount: 6, paymentTerms: 'Net 45' },
];

export const DEMO_SCORES: VendorScore[] = [
  { vendorId: 'v1', vendorName: 'Dell Technologies', priceScore: 82, qualityScore: 92, deliveryScore: 90, warrantyScore: 95, totalScore: 88.3, rank: 1 },
  { vendorId: 'v2', vendorName: 'HP Enterprise', priceScore: 75, qualityScore: 90, deliveryScore: 85, warrantyScore: 95, totalScore: 84.0, rank: 2 },
  { vendorId: 'v5', vendorName: 'ASUS Corporation', priceScore: 80, qualityScore: 87, deliveryScore: 80, warrantyScore: 95, totalScore: 84.0, rank: 3 },
  { vendorId: 'v3', vendorName: 'Lenovo Group', priceScore: 88, qualityScore: 85, deliveryScore: 75, warrantyScore: 70, totalScore: 82.5, rank: 4 },
  { vendorId: 'v4', vendorName: 'Acer Inc.', priceScore: 95, qualityScore: 78, deliveryScore: 65, warrantyScore: 70, totalScore: 80.5, rank: 5 },
];

export const DEMO_MARKET_INTELLIGENCE: MarketIntelligence = {
  averageMarketPrice: 1350,
  priceRange: { min: 1100, max: 1600 },
  marketTrend: 'stable',
  competitorPricing: [
    { name: 'Industry Average', price: 1350 },
    { name: 'Government Contract', price: 1250 },
    { name: 'Enterprise Bulk', price: 1200 },
    { name: 'Retail MSRP', price: 1599 },
  ],
  industryBenchmarks: [
    { metric: 'Average Delivery Time', value: '28 days' },
    { metric: 'Average Warranty', value: '36 months' },
    { metric: 'Bulk Discount Range', value: '5-15%' },
    { metric: 'Quality Defect Rate', value: '< 2%' },
  ],
  recommendations: [
    'Current pricing is within market range — room for negotiation on volume discounts',
    'Consider leveraging Q3 inventory clearance for better pricing',
    'Multi-year service agreements can reduce total cost of ownership by 12-18%',
    'Competitor analysis shows Dell and HP offer strongest enterprise support',
  ],
};

export const DEMO_RISK_ASSESSMENT: RiskAssessment = {
  overallRisk: 'low',
  vendorRisks: [
    { vendorId: 'v1', vendorName: 'Dell Technologies', financialRisk: 10, deliveryRisk: 15, complianceRisk: 5, qualityRisk: 8, overallRisk: 9.5, riskLevel: 'low', flags: [] },
    { vendorId: 'v2', vendorName: 'HP Enterprise', financialRisk: 8, deliveryRisk: 20, complianceRisk: 5, qualityRisk: 10, overallRisk: 10.8, riskLevel: 'low', flags: ['Slightly longer delivery timeline'] },
    { vendorId: 'v3', vendorName: 'Lenovo Group', financialRisk: 18, deliveryRisk: 35, complianceRisk: 22, qualityRisk: 15, overallRisk: 22.5, riskLevel: 'medium', flags: ['Supply chain dependency on Asia-Pacific', 'Geopolitical risk factor'] },
    { vendorId: 'v4', vendorName: 'Acer Inc.', financialRisk: 25, deliveryRisk: 40, complianceRisk: 18, qualityRisk: 28, overallRisk: 27.8, riskLevel: 'medium', flags: ['Higher defect rate reported', 'Limited enterprise support'] },
    { vendorId: 'v5', vendorName: 'ASUS Corporation', financialRisk: 12, deliveryRisk: 25, complianceRisk: 10, qualityRisk: 13, overallRisk: 15.0, riskLevel: 'low', flags: ['Limited US support infrastructure'] },
  ] as VendorRisk[],
  mitigationStrategies: [
    'Establish performance-based SLAs with penalty clauses',
    'Maintain dual-vendor strategy for critical procurement items',
    'Require quarterly compliance audits for medium-risk vendors',
    'Negotiate local inventory buffer to mitigate delivery risks',
  ],
};

export const DEMO_NEGOTIATION_STRATEGY: NegotiationStrategy = {
  batna: 'If negotiations fail, proceed with Lenovo as cost-effective alternative with acceptable quality trade-offs',
  targetPrice: 1200,
  reservationPrice: 1350,
  tactics: [
    { name: 'Volume Leverage', description: 'Emphasize 500-unit order with potential for recurring quarterly purchases', priority: 'high', expectedImpact: '8-12% discount' },
    { name: 'Competitive Bidding', description: 'Present competing vendor quotes to create pricing pressure', priority: 'high', expectedImpact: '5-8% additional discount' },
    { name: 'Bundle Services', description: 'Negotiate bundled warranty, deployment, and support packages', priority: 'medium', expectedImpact: '3-5% TCO reduction' },
    { name: 'Payment Terms', description: 'Offer faster payment in exchange for additional discount', priority: 'medium', expectedImpact: '2-3% discount' },
    { name: 'Long-term Partnership', description: 'Propose multi-year framework agreement for sustained pricing', priority: 'low', expectedImpact: '5-10% sustained discount' },
  ],
  vendorApproaches: [
    { vendorName: 'Dell Technologies', approach: 'Lead with volume leverage and competitive pricing pressure. Target 10% discount.', targetDiscount: 10 },
    { vendorName: 'HP Enterprise', approach: 'Focus on bundle services and long-term partnership. Target 8% discount.', targetDiscount: 8 },
    { vendorName: 'Lenovo Group', approach: 'Leverage aggressive pricing already offered. Push for warranty upgrade.', targetDiscount: 5 },
    { vendorName: 'ASUS Corporation', approach: 'Push for quality commitments and faster delivery timeline.', targetDiscount: 7 },
    { vendorName: 'Acer Inc.', approach: 'Use as price anchor. Negotiate enterprise support improvements.', targetDiscount: 3 },
  ],
};

export const DEMO_NEGOTIATIONS: NegotiationResult[] = [
  {
    vendorName: 'Dell Technologies',
    originalPrice: 1350,
    negotiatedPrice: 1215,
    discount: 10,
    status: 'successful',
    messages: [
      { role: 'system', content: 'Negotiation session started with Dell Technologies', timestamp: '2025-06-15T10:00:00Z' },
      { role: 'buyer', content: 'We are evaluating 500 enterprise laptops for our organization. Given the volume, we would expect significant pricing considerations. Our budget analysis indicates a target unit price of $1,200.', timestamp: '2025-06-15T10:01:00Z' },
      { role: 'vendor', content: 'Thank you for considering Dell. For 500 units of the Latitude 5540, our standard enterprise pricing would be $1,350 per unit. However, for this volume, I can offer a 5% discount bringing it to $1,282.50.', timestamp: '2025-06-15T10:02:00Z', vendorName: 'Dell Technologies' },
      { role: 'buyer', content: 'We appreciate the initial offer, but we have competitive quotes from HP and Lenovo in the $1,180-$1,280 range. Additionally, this is part of our quarterly procurement cycle — 4 cycles per year, approximately 2,000 units annually.', timestamp: '2025-06-15T10:03:00Z' },
      { role: 'vendor', content: 'Given the annual volume potential of 2,000 units, I can escalate this to our enterprise team. We can offer $1,215 per unit with a 3-year comprehensive warranty, next-business-day onsite support, and deployment image pre-loading at no additional cost.', timestamp: '2025-06-15T10:04:00Z', vendorName: 'Dell Technologies' },
      { role: 'buyer', content: 'The $1,215 with included deployment services is very competitive. We accept this offer contingent on the warranty terms and Net 45 payment terms.', timestamp: '2025-06-15T10:05:00Z' },
      { role: 'system', content: 'Deal closed: $1,215/unit — 10% discount achieved. Total savings: $67,500', timestamp: '2025-06-15T10:06:00Z' },
    ] as NegotiationMessage[],
  },
  {
    vendorName: 'HP Enterprise',
    originalPrice: 1420,
    negotiatedPrice: 1306,
    discount: 8,
    status: 'successful',
    messages: [
      { role: 'system', content: 'Negotiation session started with HP Enterprise', timestamp: '2025-06-15T10:10:00Z' },
      { role: 'buyer', content: 'HP, we need 500 enterprise laptops. Our budget targets $1,250/unit range. What can you offer for this volume?', timestamp: '2025-06-15T10:11:00Z' },
      { role: 'vendor', content: 'For 500 HP EliteBook units, our volume pricing is $1,378 per unit with standard 3-year warranty.', timestamp: '2025-06-15T10:12:00Z', vendorName: 'HP Enterprise' },
      { role: 'buyer', content: 'We have a more competitive offer from Dell at $1,215/unit with equivalent specifications and full deployment services included.', timestamp: '2025-06-15T10:13:00Z' },
      { role: 'vendor', content: 'To match the competitive landscape, we can offer $1,306 per unit including HP Care Pack with accidental damage protection and 4-hour onsite response. This represents an 8% discount.', timestamp: '2025-06-15T10:14:00Z', vendorName: 'HP Enterprise' },
      { role: 'buyer', content: 'We will include your bid in our final evaluation. The enhanced warranty terms are noted.', timestamp: '2025-06-15T10:15:00Z' },
      { role: 'system', content: 'Deal closed: $1,306/unit — 8% discount achieved. Total savings: $57,000', timestamp: '2025-06-15T10:16:00Z' },
    ] as NegotiationMessage[],
  },
  {
    vendorName: 'Lenovo Group',
    originalPrice: 1280,
    negotiatedPrice: 1216,
    discount: 5,
    status: 'successful',
    messages: [
      { role: 'system', content: 'Negotiation session started with Lenovo Group', timestamp: '2025-06-15T10:20:00Z' },
      { role: 'buyer', content: 'Lenovo, your initial quote of $1,280 is competitive. For 500 ThinkPad units, what additional value can you provide?', timestamp: '2025-06-15T10:21:00Z' },
      { role: 'vendor', content: 'We can offer $1,216/unit with an upgrade to 3-year depot warranty. We also include free asset tagging and BIOS configuration.', timestamp: '2025-06-15T10:22:00Z', vendorName: 'Lenovo Group' },
      { role: 'buyer', content: 'Accepted. Please confirm delivery within 28 days.', timestamp: '2025-06-15T10:23:00Z' },
      { role: 'system', content: 'Deal closed: $1,216/unit — 5% discount. Total savings: $32,000', timestamp: '2025-06-15T10:24:00Z' },
    ] as NegotiationMessage[],
  },
];

export const DEMO_SAVINGS: SavingsPrediction = {
  currentBestPrice: 1215,
  projectedSavings: 67500,
  savingsPercentage: 10,
  annualSavings: 270000,
  roi: 340,
  paybackPeriod: 'Immediate — savings realized on first order',
  savingsBreakdown: [
    { category: 'Volume Discount', amount: 33750 },
    { category: 'Competitive Bidding', amount: 16875 },
    { category: 'Bundled Services', amount: 10125 },
    { category: 'Payment Terms', amount: 6750 },
  ],
  forecastData: [
    { quarter: 'Q3 2025', projected: 67500 },
    { quarter: 'Q4 2025', projected: 72000 },
    { quarter: 'Q1 2026', projected: 68500 },
    { quarter: 'Q2 2026', projected: 75000 },
  ],
};

export const DEMO_DECISION: FinalDecision = {
  recommendedVendor: 'Dell Technologies',
  recommendedVendorId: 'v1',
  totalScore: 88.3,
  finalPrice: 607500,
  savings: 67500,
  savingsPercentage: 10,
  riskLevel: 'low',
  approvalStatus: 'approved',
  rationale: [
    'Highest overall score (88.3/100) across all evaluation criteria',
    'Best negotiated price of $1,215/unit — 10% below initial quote',
    'Comprehensive 3-year warranty with next-business-day onsite support',
    'Lowest risk profile among all evaluated vendors',
    'Includes deployment image pre-loading at no additional cost',
    'Strong track record in enterprise laptop deployments',
  ],
  alternativeVendors: [
    { name: 'HP Enterprise', score: 84.0, price: 653000 },
    { name: 'ASUS Corporation', score: 84.0, price: 655000 },
    { name: 'Lenovo Group', score: 82.5, price: 608000 },
  ],
  nextSteps: [
    'Issue Purchase Order to Dell Technologies',
    'Schedule deployment timeline review',
    'Initiate service level agreement finalization',
    'Configure deployment image specifications',
    'Set up asset management tracking',
  ],
};

export const DEMO_ACTIVITIES: ActivityItem[] = [
  { id: '1', type: 'workflow', title: 'Workflow Completed', description: 'All 9 agents completed analysis for PR-2025-001', timestamp: '2025-06-15T10:30:00Z', status: 'completed' },
  { id: '2', type: 'vendor', title: 'Vendor Negotiation', description: 'Dell Technologies — 10% discount achieved ($1,215/unit)', timestamp: '2025-06-15T10:06:00Z', status: 'completed' },
  { id: '3', type: 'procurement', title: 'New Request Created', description: 'Enterprise Laptops — 500 units — Budget: $750,000', timestamp: '2025-06-15T09:00:00Z', status: 'active' },
  { id: '4', type: 'system', title: 'Risk Assessment', description: 'Overall risk level: LOW — All vendors passed compliance checks', timestamp: '2025-06-15T09:45:00Z', status: 'completed' },
  { id: '5', type: 'vendor', title: 'HP Negotiation', description: 'HP Enterprise — 8% discount achieved ($1,306/unit)', timestamp: '2025-06-15T10:16:00Z', status: 'completed' },
];
