import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, Upload, MessageSquare, Shield, Activity, Sparkles, Cpu } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { loadDemoData, isDemoMode } = useApp();

  // Helper to open the global Copilot panel by dispatching a custom event
  const toggleCopilot = () => {
    window.dispatchEvent(new CustomEvent('toggle-copilot', { detail: { open: true } }));
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)] flex flex-col items-center justify-center overflow-hidden px-4 py-12">
      {/* Dynamic Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{
            x: [0, 80, -40, 0],
            y: [0, -60, 40, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="bg-orb orb-violet w-[500px] h-[500px] top-[-10%] left-[-10%]"
        />
        <motion.div
          animate={{
            x: [0, -100, 50, 0],
            y: [0, 80, -60, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="bg-orb orb-blue w-[600px] h-[600px] bottom-[-20%] right-[-10%]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#0A0714_80%)]" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-4xl text-center space-y-8"
      >
        {/* Glow AI Badge */}
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(168,85,247,0.1)] border border-[rgba(168,85,247,0.25)] text-xs text-[#C084FC] font-semibold tracking-wider uppercase mb-2 shadow-lg shadow-[rgba(168,85,247,0.05)]"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-[#A855F7]" />
          <span>Autonomous Agent Mode Active</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-none"
        >
          Meet <span className="bg-gradient-to-r from-[#C084FC] via-[#A855F7] to-[#3B82F6] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(168,85,247,0.2)]">Vendoneg</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="text-lg sm:text-2xl text-[#8E7CA3] max-w-2xl mx-auto font-medium"
        >
          Your Autonomous Procurement Intelligence Agent
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/new-procurement')}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-[#A855F7] to-[#3B82F6] text-white text-base font-semibold shadow-lg shadow-[rgba(168,85,247,0.35)] hover:shadow-[rgba(168,85,247,0.5)] transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-white" />
            Start Analysis
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/vendor-quotations')}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl glass border-purple-500/20 hover:border-purple-500/40 text-white text-base font-semibold hover:bg-white/5 transition-all cursor-pointer"
          >
            <Upload className="w-5 h-5 text-[#C084FC]" />
            Upload RFQ
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={toggleCopilot}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-[rgba(168,85,247,0.12)] border border-[rgba(168,85,247,0.25)] text-[#C084FC] hover:bg-[rgba(168,85,247,0.2)] text-base font-semibold transition-all cursor-pointer"
          >
            <MessageSquare className="w-5 h-5 text-[#C084FC]" />
            Talk to AI
          </motion.button>
        </motion.div>

        {/* Feature Highlights Grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 max-w-4xl mx-auto"
        >
          {[
            {
              icon: Cpu,
              title: "Autonomous Agent Engine",
              desc: "Simulates cognitive extraction, pricing benchmarks, risk assessment, and decision making automatically.",
              color: "from-purple-500/10 to-indigo-500/5",
              borderColor: "border-purple-500/20"
            },
            {
              icon: Activity,
              title: "Live Market Intelligence",
              desc: "Searches the web in real-time to benchmark pricing against industry indices and competitor pricing models.",
              color: "from-blue-500/10 to-purple-500/5",
              borderColor: "border-blue-500/20"
            },
            {
              icon: Shield,
              title: "Negotiation & Risks",
              desc: "Maintains high-confidence negotiation strategies and monitors financial, delivery, compliance, and quality risks.",
              color: "from-[#00E676]/10 to-blue-500/5",
              borderColor: "border-[#00E676]/20"
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5, borderColor: "rgba(168, 85, 247, 0.4)" }}
              className={`p-6 rounded-2xl glass-subtle border ${feature.borderColor} bg-gradient-to-b ${feature.color} text-left flex flex-col h-full`}
            >
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 w-fit mb-4">
                <feature.icon className="w-5 h-5 text-[#C084FC]" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-xs text-[#8E7CA3] leading-relaxed flex-1">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Demo trigger notice */}
        {!isDemoMode && (
          <motion.div variants={itemVariants} className="pt-8 text-center">
            <span className="text-xs text-[#8E7CA3]">
              Need sandbox data to test immediately?{" "}
              <button
                onClick={loadDemoData}
                className="text-[#C084FC] hover:text-[#A855F7] font-semibold underline hover:no-underline cursor-pointer"
              >
                Load Complete Demo Scenario
              </button>
            </span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
