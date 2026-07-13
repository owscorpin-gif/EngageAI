import React from 'react';
import { CreditCard, Zap, Check, ArrowRight } from 'lucide-react';

export const BillingPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-slide-in">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading font-extrabold text-3xl tracking-tight text-slate-900 dark:text-white">
          Billing & Subscription
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base">
          Manage your plan and usage limits.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="glass-panel border-2 border-primary-500/50 rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 bg-gradient-to-bl from-primary-500 to-accent-500 text-white font-bold text-xs rounded-bl-2xl">
            CURRENT PLAN
          </div>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-primary-500/10 text-primary-500 rounded-xl">
              <Zap className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Pro Creator</h2>
              <p className="text-slate-500 font-medium">$29/month</p>
            </div>
          </div>
          <ul className="space-y-4 mb-8">
            {['Unlimited Video Analysis', 'Advanced Decision Engine', 'Priority Live Chat AI', 'Custom AI Personality Learning'].map((feature, idx) => (
              <li key={idx} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                <Check className="w-5 h-5 text-emerald-500" />
                {feature}
              </li>
            ))}
          </ul>
          <button className="w-full py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
            Manage Subscription <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="glass-panel border border-slate-200/80 dark:border-slate-800/60 rounded-3xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl">
              <CreditCard className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Payment Method</h2>
              <p className="text-slate-500 font-medium">Visa ending in 4242</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 mb-6 flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Next billing date</p>
              <p className="text-sm text-slate-500">August 7, 2026</p>
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">$29.00</span>
          </div>
          <button className="w-full py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            Update Payment Details
          </button>
        </div>
      </div>
    </div>
  );
};
