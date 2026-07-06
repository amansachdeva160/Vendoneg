import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, MessageSquare, Bot, ArrowRight, Table2, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTable?: boolean;
}

export default function AICopilotPanel() {
  const { currentRequest, vendorQuotations, sharedMemory } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I am your AI Procurement Copilot. I have analyzed our supplier quotations and stand ready to assist you. Ask me to compare vendors, assess risks, analyze budget cuts, or prepare a negotiation strategy.",
      timestamp: new Date(),
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Listen to custom event to toggle the Copilot panel open/closed
  useEffect(() => {
    const handleToggle = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && typeof customEvent.detail.open === 'boolean') {
        setIsOpen(customEvent.detail.open);
      } else {
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('toggle-copilot', handleToggle);
    return () => window.removeEventListener('toggle-copilot', handleToggle);
  }, []);

  // Auto-scroll to the bottom of the chat list
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const defaultQuestions = [
    "Why did you choose the recommended vendor?",
    "Compare Dell vs HP Enterprise",
    "What if budget decreases 20%?",
    "Suggest negotiation strategy",
    "Explain procurement risks",
    "Summarize all quotations",
    "Generate procurement report summary",
  ];

  // Helper to generate smart simulated responses
  const getSmartResponse = (query: string): string => {
    const q = query.toLowerCase();
    const request = currentRequest || sharedMemory.request;
    const quotes = vendorQuotations.length > 0 ? vendorQuotations : (sharedMemory.quotations || []);
    const decision = sharedMemory.finalDecision;
    const risks = sharedMemory.riskAssessment;
    const strategy = sharedMemory.negotiationStrategy;
    const savingsPrediction = sharedMemory.savingsPrediction;

    const itemName = request?.itemName || 'Enterprise Laptops';
    const totalBudget = request?.budget || 750000;
    const quantity = request?.quantity || 500;

    // 1. Why recommended vendor selected
    if (q.includes('choose') || q.includes('select') || q.includes('recommend')) {
      if (!decision) {
        return "Based on my preliminary review of the requirements, we need to upload vendor quotations first. However, assuming standard pricing, Dell Technologies is typically selected due to its 36-month warranty and robust quality scores.";
      }
      const rec = decision.recommendedVendor;
      const score = decision.totalScore;
      const finalPrice = decision.finalPrice;
      const savings = decision.savings;
      const savingsPct = decision.savingsPercentage;

      // Why others rejected
      const rejects = quotes.filter(quote => quote.vendorName !== rec);
      const rejectReasons = rejects.map(r => {
        let reason = "it has lower overall scores";
        if (r.qualityScore < 80) reason = `its quality score (${r.qualityScore}/100) falls below business grade`;
        else if (r.deliveryDays > 30) reason = `delivery time (${r.deliveryDays} days) exceeds key timelines`;
        else if (r.warrantyMonths < 36) reason = `its warranty term (${r.warrantyMonths} months) does not match Dell's 3-year standard`;
        else if (r.unitPrice > (quotes.find(qd => qd.vendorName === rec)?.unitPrice || 0)) reason = `its unit price is less competitive`;
        return `• **${r.vendorName}** was rejected because ${reason}.`;
      }).join('\n');

      return `As an experienced procurement lead, I recommend selecting **${rec}** for our ${itemName} requirement.

Here is my professional assessment of this decision:
- **Selected Vendor**: **${rec}** (Rank #1, Procurement Score: **${score}/100**)
- **Cost Impact**: Contract total of **${formatCurrency(finalPrice)}** which saves us **${formatCurrency(savings)}** (**${savingsPct}%** under budget).
- **Delivery & Quality**: Delivery within ${quotes.find(qd => qd.vendorName === rec)?.deliveryDays || 21} days with a solid ${quotes.find(qd => qd.vendorName === rec)?.warrantyMonths || 36}-month warranty and ${quotes.find(qd => qd.vendorName === rec)?.qualityScore || 92}/100 quality rating.
- **Risk Level**: **${decision.riskLevel.toUpperCase()}**

**Rejection Rationale for Other Bids:**
${rejectReasons}

This represents the best balance of cost, delivery speed, and long-term support warranty. Let me know if you would like me to prepare the purchase contract.`;
    }

    // 2. Compare Vendor A vs Vendor B
    if (q.includes('compare') || q.includes('vs')) {
      if (quotes.length < 2) {
        return "I need at least two uploaded vendor quotations to perform a comparative analysis. Please upload quotations or load the demo scenario.";
      }
      // Look for vendor names in query
      let v1 = quotes[0];
      let v2 = quotes[1];

      quotes.forEach(quote => {
        if (q.includes(quote.vendorName.toLowerCase().split(' ')[0])) {
          if (!v1 || v1.vendorName === quotes[0].vendorName) {
            v1 = quote;
          } else {
            v2 = quote;
          }
        }
      });

      const savingsDiff = Math.abs(v1.totalPrice - v2.totalPrice);
      const betterPrice = v1.unitPrice < v2.unitPrice ? v1.vendorName : v2.vendorName;
      const betterQuality = v1.qualityScore > v2.qualityScore ? v1.vendorName : v2.vendorName;

      return `Here is my head-to-head comparison of **${v1.vendorName}** vs **${v2.vendorName}**:

| Criteria | ${v1.vendorName} | ${v2.vendorName} | Comparison |
| :--- | :--- | :--- | :--- |
| **Unit Price** | ${formatCurrency(v1.unitPrice)} | ${formatCurrency(v2.unitPrice)} | ${betterPrice} is cheaper |
| **Total Price** | ${formatCurrency(v1.totalPrice)} | ${formatCurrency(v2.totalPrice)} | Difference of ${formatCurrency(savingsDiff)} |
| **Delivery Time** | ${v1.deliveryDays} days | ${v2.deliveryDays} days | ${v1.deliveryDays < v2.deliveryDays ? v1.vendorName : v2.vendorName} is faster |
| **Warranty** | ${v1.warrantyMonths} months | ${v2.warrantyMonths} months | ${v1.warrantyMonths > v2.warrantyMonths ? v1.vendorName : v2.vendorName} offers longer coverage |
| **Quality Score** | ${v1.qualityScore}/100 | ${v2.qualityScore}/100 | ${betterQuality} has superior quality rating |
| **Payment Terms** | ${v1.paymentTerms} | ${v2.paymentTerms} | - |

**Professional Verdict**:
If cost is the absolute driver, **${betterPrice}** offers a direct price advantage. However, if reliability, quality, and lifetime support are critical for our operations, **${betterQuality}** represents the more robust option.`;
    }

    // 3. What if budget decreases 20%?
    if (q.includes('budget') || q.includes('20%') || q.includes('decrease')) {
      const limit = totalBudget * 0.8;
      const viable = quotes.filter(quote => quote.totalPrice <= limit);

      let summary = '';
      if (viable.length > 0) {
        summary = `The following suppliers are viable within this new **${formatCurrency(limit)}** limit:\n` +
          viable.map(v => `- **${v.vendorName}** (Total: ${formatCurrency(v.totalPrice)}, leaving ${formatCurrency(limit - v.totalPrice)} margin)`).join('\n') +
          `\n\nI recommend proceeding with **${viable[0].vendorName}** since it is compliant and fits comfortably within the restricted ceiling.`;
      } else {
        const closest = [...quotes].sort((a,b) => a.totalPrice - b.totalPrice)[0];
        summary = `Unfortunately, **no vendor bids currently fall under the new limit of ${formatCurrency(limit)}**.
The lowest overall bid is from **${closest.vendorName}** at **${formatCurrency(closest.totalPrice)}** (exceeding limit by ${formatCurrency(closest.totalPrice - limit)}).

**Recommended Strategy**:
I advise escalating negotiation sessions with **${closest.vendorName}** or **Dell Technologies** specifically targeting a 15-20% volume discount, using the revised budget limit as leverage, or reducing the order quantity from ${quantity} to ${Math.floor(limit / closest.unitPrice)} units.`;
      }

      return `If our budget decreases by **20%**, our new spending limit is **${formatCurrency(limit)}** (down from ${formatCurrency(totalBudget)}).

${summary}`;
    }

    // 4. Suggest negotiation strategy
    if (q.includes('negotiat') || q.includes('strategy') || q.includes('tactic')) {
      if (!strategy) {
        return "I need vendor quotes to suggest negotiation strategies. In general, we leverage volume commitments, showcase competing quotes, and request extended warranties.";
      }
      const tacticsList = strategy.tactics.map((t, idx) => `${idx + 1}. **${t.name}**: ${t.description} *(Expected Impact: ${t.expectedImpact})*`).join('\n');
      return `For the ${itemName} contract, I have formulated the following negotiation strategies based on current vendor offers:

- **BATNA (Best Alternative to Negotiated Agreement)**: ${strategy.batna}
- **Target Unit Price**: **${formatCurrency(strategy.targetPrice)}**
- **Reservation (Ceiling) Price**: **${formatCurrency(strategy.reservationPrice)}**

**Negotiation Tactics**:
${tacticsList}

**Vendor Approaches**:
${strategy.vendorApproaches.map(va => `- **${va.vendorName}**: ${va.approach}`).join('\n')}

I suggest opening negotiations immediately with Dell, using HP's warranty terms and Lenovo's lower pricing anchors as leverage.`;
    }

    // 5. Explain procurement risks
    if (q.includes('risk') || q.includes('alert') || q.includes('threat')) {
      if (!risks) {
        return "Currently, no risk assessment data is loaded. Generally, we analyze financial exposure, delivery delay rates, compliance certificates, and quality failure rates.";
      }
      const riskList = risks.vendorRisks.map(r => {
        const flagInfo = r.flags.length > 0 ? ` (Flags: ${r.flags.join(', ')})` : '';
        return `- **${r.vendorName}**: Risk Level: **${r.riskLevel.toUpperCase()}** (Score: ${r.overallRisk}/100)${flagInfo}`;
      }).join('\n');

      const mitigations = risks.mitigationStrategies.map(m => `- ${m}`).join('\n');

      return `Here is my risk assessment audit for our ${itemName} procurement:

**Vendor Risk Breakdown**:
${riskList}

**Recommended Risk Mitigation Actions**:
${mitigations}

We should prioritize vendors with 'Low' risk profiles or insert strict SLA clawback clauses into contracts with medium-risk suppliers.`;
    }

    // 6. Summarize quotation
    if (q.includes('summar') || q.includes('quote') || q.includes('quotation')) {
      if (quotes.length === 0) {
        return "No quotation data is available to summarize. Please upload quotation files first.";
      }
      const list = quotes.map(q => `- **${q.vendorName}**: ${formatCurrency(q.unitPrice)}/unit | Total: ${formatCurrency(q.totalPrice)} | Delivery: ${q.deliveryDays}d | Warranty: ${q.warrantyMonths}mo`).join('\n');
      const avg = quotes.reduce((s, q) => s + q.unitPrice, 0) / quotes.length;
      return `Here is my summary of the **${quotes.length}** quotation bids received for **${quantity}x ${itemName}**:

${list}

- **Average Price**: ${formatCurrency(avg)} / unit.
- **Budget Margin**: Our budget is ${formatCurrency(totalBudget)}. All bids fit within our initial budget limit.
- **Primary Recommendation**: Dell Technologies offers the best overall value index scoring.`;
    }

    // 7. Generate procurement report
    if (q.includes('report') || q.includes('final') || q.includes('recommendation')) {
      if (!decision) {
        return "Please upload quotes and execute the analysis workflow before requesting the final procurement report.";
      }
      return `### Executive Procurement Recommendation Report

**Requirement**: ${quantity}x ${itemName}
**Budget**: ${formatCurrency(totalBudget)}
**Recommended Supplier**: **${decision.recommendedVendor}** (Procurement Score: **${decision.totalScore}/100**)

**Financial Summary**:
- **Proposed Price**: **${formatCurrency(decision.finalPrice)}**
- **Direct Savings**: **${formatCurrency(decision.savings)}** (**${decision.savingsPercentage}%** relative to budget)
- **Estimated ROI**: **${savingsPrediction?.roi || 340}%**

**Risk Evaluation**:
- **Overall Rating**: **${decision.riskLevel.toUpperCase()}**
- Critical compliance checks and quality assurances have been validated.

**Key Selection Drivers**:
1. Dell achieved the highest score under our weighted formula (Price 40%, Quality 30%, Delivery 20%, Warranty 10%).
2. The negotiated price of ${formatCurrency(decision.finalPrice / quantity)} fits within our budget ceilings.
3. Included next-business-day onsite support mitigates operational hardware down-time risks.

Report generated on: ${new Date().toLocaleDateString()}. Ready for executive review.`;
    }

    // Fallback general procurement response
    return `Regarding our ${itemName} procurement project, here is my perspective:

We have received ${quotes.length} vendor responses. The budget is ${formatCurrency(totalBudget)} for ${quantity} units. 
Our primary focus is securing optimal volume pricing while ensuring that the suppliers satisfy our strict compliance and delivery guarantees.

If you have specific questions about vendor bidding, delivery risk metrics, or negotiation tactics, please let me know. I can also model budget-cut scenarios or generate structural comparison tables.`;
  };

  const handleSend = () => {
    if (!input.trim() || isThinking) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    // Simulated AI response delay with "Thinking..." effect
    setTimeout(() => {
      const responseText = getSmartResponse(userMessage.content);
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
      };
      setIsThinking(false);
      setMessages((prev) => [...prev, assistantMessage]);
    }, 1800);
  };

  const handleSuggestClick = (qText: string) => {
    if (isThinking) return;
    setInput(qText);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: "Hello! I am your AI Procurement Copilot. I have analyzed our supplier quotations and stand ready to assist you. Ask me to compare vendors, assess risks, analyze budget cuts, or prepare a negotiation strategy.",
        timestamp: new Date(),
      }
    ]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-0 right-0 h-screen w-full sm:w-[480px] bg-[#0D0B18] border-l border-[#2E1E47] shadow-2xl z-[999] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 h-[68px] border-b border-[#2E1E47] bg-[#161226]/85 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shadow-lg shadow-[rgba(168,85,247,0.2)]">
                <Bot className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  Vendoneg Copilot
                  <Sparkles className="w-3.5 h-3.5 text-[#C084FC] animate-pulse" />
                </h3>
                <span className="text-[10px] font-medium text-[#8E7CA3]">Professional Procurement Advisor</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                title="Clear Chat History"
                className="p-2 rounded-lg hover:bg-white/5 text-[#8E7CA3] hover:text-white transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-white/5 text-[#8E7CA3] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-[#0A0714]">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}>
                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-lg bg-[rgba(168,85,247,0.1)] border border-[rgba(168,85,247,0.2)] flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-[#C084FC]" />
                    </div>
                  )}
                  <div
                    className={`p-3.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-line ${
                      msg.role === 'user' ? 'chat-message-user text-white' : 'chat-message-agent text-[#F1F5F9]'
                    }`}
                  >
                    {/* Render table output beautifully if it contains markdown table */}
                    {msg.content.includes('|') ? (
                      <div className="overflow-x-auto max-w-full my-2">
                        <table className="min-w-full text-xs text-[#F1F5F9] border-collapse">
                          <thead>
                            <tr className="border-b border-[#2E1E47] bg-[#161226]">
                              {msg.content.split('\n')[2].split('|').filter(c => c.trim()).map((cell, idx) => (
                                <th key={idx} className="p-2 text-left font-semibold text-[#C084FC]">{cell.trim()}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {msg.content.split('\n').slice(4).filter(line => line.includes('|')).map((line, idx) => (
                              <tr key={idx} className="border-b border-[#2E1E47]/50 hover:bg-white/5">
                                {line.split('|').filter(c => c.trim()).map((cell, cIdx) => (
                                  <td key={cIdx} className="p-2 text-[#8E7CA3] font-medium">{cell.trim()}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {/* Display verdict after the table */}
                        {msg.content.includes('Professional Verdict') && (
                          <div className="mt-4 pt-2 border-t border-[#2E1E47]/50 text-xs">
                            <span className="text-[#C084FC] font-semibold">Verdict:</span>{" "}
                            {msg.content.split('Professional Verdict')[1].replace(/[:*\n]/g, '').trim()}
                          </div>
                        )}
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* AI Thinking Animation */}
            {isThinking && (
              <div className="flex justify-start w-full">
                <div className="flex gap-3 max-w-[85%]">
                  <div className="w-8 h-8 rounded-lg bg-[rgba(168,85,247,0.1)] border border-[rgba(168,85,247,0.2)] flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-[#C084FC]" />
                  </div>
                  <div className="chat-message-agent p-3.5 rounded-2xl flex items-center gap-3">
                    <span className="text-[11px] text-[#8E7CA3] font-semibold animate-pulse">AI Copilot is analyzing quotation data...</span>
                    <div className="flex gap-1">
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions */}
          <div className="px-5 py-3 border-t border-[#2E1E47] bg-[#161226]/40 flex gap-2 overflow-x-auto custom-scrollbar shrink-0">
            {defaultQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestClick(q)}
                className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-medium text-[#8E7CA3] hover:text-white hover:border-[#C084FC]/40 whitespace-nowrap transition-colors cursor-pointer shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input field */}
          <div className="p-4 bg-[#161226]/85 border-t border-[#2E1E47] shrink-0">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me about vendor scores, comparisons, budget modifications..."
                className="flex-1 bg-[#0A0714] border border-[#2E1E47] rounded-xl px-4 py-3 text-xs text-white placeholder-[#8E7CA3] focus:outline-none focus:border-[#C084FC] transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isThinking}
                className="p-3 rounded-xl bg-gradient-to-r from-[#A855F7] to-[#3B82F6] text-white hover:opacity-90 disabled:opacity-40 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
