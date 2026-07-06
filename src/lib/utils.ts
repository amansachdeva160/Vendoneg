import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

let globalCurrency = 'USD';

export function setGlobalCurrency(currency: string) {
  globalCurrency = currency;
}

export function formatCurrency(amount: number, currency?: string): string {
  const finalCurrency = currency || globalCurrency;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: finalCurrency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toFixed(0);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'completed': case 'active': case 'approved': case 'low': case 'successful': return 'text-[#10B981]';
    case 'running': case 'pending': case 'medium': case 'partial': return 'text-[#F59E0B]';
    case 'error': case 'cancelled': case 'rejected': case 'high': case 'failed': return 'text-[#EF4444]';
    case 'retrying': return 'text-[#F59E0B]';
    default: return 'text-[#94A3B8]';
  }
}

export function getStatusBg(status: string): string {
  switch (status) {
    case 'completed': case 'active': case 'approved': case 'low': case 'successful': return 'bg-[rgba(16,185,129,0.1)] text-[#10B981] border border-[rgba(16,185,129,0.2)]';
    case 'running': case 'pending': case 'medium': case 'partial': return 'bg-[rgba(245,158,11,0.1)] text-[#F59E0B] border border-[rgba(245,158,11,0.2)]';
    case 'error': case 'cancelled': case 'rejected': case 'high': case 'failed': return 'bg-[rgba(239,68,68,0.1)] text-[#EF4444] border border-[rgba(239,68,68,0.2)]';
    case 'retrying': return 'bg-[rgba(245,158,11,0.1)] text-[#F59E0B] border border-[rgba(245,158,11,0.2)]';
    case 'idle': return 'bg-[rgba(100,116,139,0.1)] text-[#64748B] border border-[rgba(100,116,139,0.2)]';
    default: return 'bg-[rgba(100,116,139,0.1)] text-[#94A3B8] border border-[rgba(100,116,139,0.2)]';
  }
}
