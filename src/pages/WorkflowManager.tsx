import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Play, Pause, RotateCcw, CheckCircle2, AlertCircle, Loader2, Clock,
  ChevronDown, ChevronUp, Zap, ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AGENT_DEFINITIONS, DEMO_REQUEST } from '../lib/demo-data';
import { getStatusBg } from '../lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function WorkflowManager() {
  const { workflowRun, startWorkflow, resetWorkflow, currentRequest, sharedMemory } = useApp();
  const [showLogs, setShowLogs] = useState(true);
  const navigate = useNavigate();

  const handleStart = () => {
    const req = currentRequest || DEMO_REQUEST;
    startWorkflow(req);
  };

  const agents = workflowRun?.agents || AGENT_DEFINITIONS.map(d => ({ ...d, status: 'idle' as const, progress: 0, retryCount: 0 }));
  const logs = workflowRun?.logs || [];

  const completedCount = agents.filter(a => a.status === 'completed').length;
  const overallProgress = agents.length > 0 ? (completedCount / agents.length) * 100 : 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-[#10B981]" />;
      case 'running': return <Loader2 className="w-4 h-4 text-[#2563EB] animate-spin" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-[#EF4444]" />;
      case 'retrying': return <RotateCcw className="w-4 h-4 text-[#F59E0B] animate-spin" />;
      default: return <Clock className="w-4 h-4 text-[#64748B]" />;
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Workflow Manager</h1>
          <p className="text-sm text-[#94A3B8] mt-1">Orchestrate 9 AI agents for procurement analysis</p>
        </div>
        <div className="flex items-center gap-3">
          {workflowRun?.status === 'running' ? (
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[rgba(245,158,11,0.1)] text-[#F59E0B] text-sm font-medium border border-[rgba(245,158,11,0.2)]">
              <Loader2 className="w-4 h-4 animate-spin" /> Running...
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Play className="w-4 h-4" /> Start Workflow
            </button>
          )}
          <button
            onClick={resetWorkflow}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass text-[#94A3B8] text-sm font-medium hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>
      </motion.div>

      {/* Overall Progress */}
      <motion.div variants={itemVariants} className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED]">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Pipeline Progress</h3>
              <p className="text-xs text-[#64748B]">{completedCount} of {agents.length} agents completed</p>
            </div>
          </div>
          <span className="text-lg font-bold text-white">{Math.round(overallProgress)}%</span>
        </div>
        <div className="w-full h-2 bg-[#1E293B] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#7C3AED]"
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Pipeline */}
        <div className="lg:col-span-2 space-y-3">
          {agents.map((agent, i) => (
            <motion.div
              key={agent.id}
              variants={itemVariants}
              className={`glass rounded-2xl p-4 card-hover cursor-pointer ${
                agent.status === 'running' ? 'border-[#2563EB] glow-primary' :
                agent.status === 'completed' ? 'border-[rgba(16,185,129,0.3)]' :
                agent.status === 'error' ? 'border-[rgba(239,68,68,0.3)]' : ''
              }`}
              onClick={() => navigate(`/agent/${agent.id}`)}
            >
              <div className="flex items-center gap-4">
                {/* Step Number */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                  agent.status === 'completed' ? 'bg-[rgba(16,185,129,0.1)] text-[#10B981]' :
                  agent.status === 'running' ? 'bg-[rgba(37,99,235,0.1)] text-[#2563EB]' :
                  agent.status === 'error' ? 'bg-[rgba(239,68,68,0.1)] text-[#EF4444]' :
                  agent.status === 'retrying' ? 'bg-[rgba(245,158,11,0.1)] text-[#F59E0B]' :
                  'bg-[rgba(100,116,139,0.1)] text-[#64748B]'
                }`}>
                  {agent.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                </div>

                {/* Agent Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-white truncate">{agent.name}</h4>
                    {agent.retryCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(245,158,11,0.1)] text-[#F59E0B] border border-[rgba(245,158,11,0.2)]">
                        Retry ×{agent.retryCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#64748B] truncate mt-0.5">{agent.description}</p>
                </div>

                {/* Status */}
                <div className="flex items-center gap-3 shrink-0">
                  {agent.status !== 'idle' && (
                    <div className="w-24">
                      <div className="w-full h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${
                            agent.status === 'completed' ? 'bg-[#10B981]' :
                            agent.status === 'error' ? 'bg-[#EF4444]' :
                            'bg-[#2563EB]'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${agent.progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-lg ${getStatusBg(agent.status)}`}>
                    {agent.status}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#2D3A50]" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Execution Log */}
        <motion.div variants={itemVariants} className="glass rounded-2xl p-4 h-fit lg:sticky lg:top-24">
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="w-full flex items-center justify-between mb-3"
          >
            <h3 className="text-sm font-semibold text-white">Execution Log</h3>
            {showLogs ? <ChevronUp className="w-4 h-4 text-[#64748B]" /> : <ChevronDown className="w-4 h-4 text-[#64748B]" />}
          </button>

          {showLogs && (
            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
              {logs.length === 0 ? (
                <p className="text-xs text-[#64748B] text-center py-8">Start the workflow to see logs</p>
              ) : (
                logs.map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-2 p-2 rounded-lg hover:bg-[rgba(255,255,255,0.02)]"
                  >
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                      log.level === 'success' ? 'bg-[#10B981]' :
                      log.level === 'warning' ? 'bg-[#F59E0B]' :
                      log.level === 'error' ? 'bg-[#EF4444]' :
                      'bg-[#2563EB]'
                    }`} />
                    <div className="min-w-0">
                      <p className={`text-[11px] leading-relaxed ${
                        log.level === 'success' ? 'text-[#10B981]' :
                        log.level === 'warning' ? 'text-[#F59E0B]' :
                        log.level === 'error' ? 'text-[#EF4444]' :
                        'text-[#94A3B8]'
                      }`}>
                        {log.message}
                      </p>
                      <p className="text-[9px] text-[#4A5568] mt-0.5">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
