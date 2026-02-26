import React from 'react';
import { ProbabilityInsight } from '../types';

interface InsightsProps {
  insights: ProbabilityInsight[];
}

export const Insights: React.FC<InsightsProps> = ({ insights }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden shadow-sm">
      <div className="absolute -right-4 -bottom-8 w-24 h-24 bg-secondary/10 rounded-full blur-xl"></div>
      <h3 className="text-slate-700 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
        <span className="material-symbols-outlined text-base">analytics</span>
        Probability Insights
      </h3>
      
      <div className="space-y-5">
        {insights.length === 0 ? (
             <div className="text-slate-400 text-sm py-2">No insights available yet.</div>
        ) : (
            insights.map((insight, idx) => {
                let colorClass = 'bg-slate-400';
                let textClass = 'text-slate-500';
                
                if (insight.type === 'high') {
                    colorClass = 'bg-primary'; // Green
                    textClass = 'text-primary';
                } else if (insight.type === 'possible') {
                    colorClass = 'bg-secondary'; // Yellow
                    textClass = 'text-secondary';
                }

                return (
                    <div key={idx}>
                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                        <span>{insight.label}</span>
                        <span className={textClass}>{insight.value} ({insight.probability}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                            className={`h-full ${colorClass} transition-all duration-1000 ease-out`} 
                            style={{ width: `${insight.probability}%` }}
                        ></div>
                    </div>
                    </div>
                );
            })
        )}
      </div>
    </div>
  );
};
