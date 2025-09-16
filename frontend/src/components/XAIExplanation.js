import React, { useState, useEffect, useMemo } from 'react';

const XAIExplanation = ({ explanation }) => {
  const [activeTab, setActiveTab] = useState('summary');

  const tabs = useMemo(() => {
    if (!explanation) return [];
    return [
      { id: 'summary', label: 'Summary', icon: '📊', available: explanation.clinical_interpretation?.summary },
      { id: 'shap', label: 'SHAP', icon: '🔍', available: explanation.shap && explanation.shap.feature_contributions },
      { id: 'visual', label: 'Visuals', icon: '📈', available: explanation.visualizations && Object.keys(explanation.visualizations).length > 0 },
      { id: 'recommendations', label: 'Actions', icon: '💡', available: explanation.clinical_interpretation?.recommendations && explanation.clinical_interpretation.recommendations.length > 0 }
    ].filter(t => t.available);
  }, [explanation]);

  useEffect(() => { if (tabs.length && !tabs.some(t => t.id === activeTab)) setActiveTab(tabs[0].id); }, [tabs, activeTab]);

  if (!explanation) {
    return (
      <div className="card surface-accent">
        <p className="text-sm text-gray-600 dark:text-gray-400">No explanation data available.</p>
      </div>
    );
  }

  const Pill = ({ children, tone = 'brand' }) => {
    const map = { brand: 'bg-brand-100 text-brand-700 dark:bg-brand-700/40 dark:text-brand-100', accent: 'bg-accent-100 text-accent-700 dark:bg-accent-700/40 dark:text-accent-100', info: 'bg-teal-100 text-teal-700 dark:bg-teal-600/40 dark:text-teal-100' };
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${map[tone] || map.brand}`}>{children}</span>;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'summary':
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wide uppercase text-brand-600 dark:text-brand-300 flex items-center gap-2"><span>📊</span>Overview</h3>
            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{explanation.clinical_interpretation.summary}</p>
            {explanation.clinical_interpretation.key_factors?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold tracking-wide uppercase text-brand-600 dark:text-brand-300">Key Factors</h4>
                <ul className="grid sm:grid-cols-2 gap-2">
                  {explanation.clinical_interpretation.key_factors.map((factor, i) => (
                    <li key={i} className="p-3 rounded-lg bg-brand-50/60 dark:bg-brand-700/20 border border-brand-600/10 dark:border-brand-400/10 text-xs text-gray-700 dark:text-gray-300 flex flex-col gap-1">
                      <span className="font-semibold text-brand-700 dark:text-brand-200">{factor.feature}</span>
                      <span>{factor.interpretation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      case 'shap':
        return (
          <div className="space-y-5">
            <h3 className="text-sm font-semibold tracking-wide uppercase text-brand-600 dark:text-brand-300 flex items-center gap-2"><span>🔍</span>SHAP Feature Impact</h3>
            <div className="space-y-3">
              {explanation.shap.feature_contributions.map((f, i) => (
                <div key={i} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-white/70 dark:bg-slate-950/40 border border-brand-600/10 dark:border-brand-400/10">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-brand-800 dark:text-brand-100">{f.feature} <span className="text-xs text-gray-500 dark:text-gray-400">({f.value})</span></div>
                    <div className="mt-1 h-1.5 w-full bg-brand-100 dark:bg-brand-700/30 rounded overflow-hidden">
                      <div className={`${f.impact==='increases_risk' ? 'bg-accent-500' : 'bg-teal-500'} h-full`} style={{ width: `${Math.min(100, Math.abs(f.contribution)*100)}%` }} />
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Pill tone={f.impact==='increases_risk' ? 'accent' : 'info'}>{f.impact === 'increases_risk' ? 'Increases' : 'Reduces'}</Pill>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{(f.contribution*100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
            {explanation.shap.method && (
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p><span className="font-medium text-brand-700 dark:text-brand-200">Method:</span> {explanation.shap.method}</p>
                {explanation.shap.base_value && <p><span className="font-medium">Base:</span> {explanation.shap.base_value.toFixed(3)}</p>}
                {explanation.shap.prediction_value && <p><span className="font-medium">Prediction:</span> {explanation.shap.prediction_value.toFixed(3)}</p>}
              </div>
            )}
          </div>
        );
      case 'visual':
        return (
          <div className="space-y-6">
            <h3 className="text-sm font-semibold tracking-wide uppercase text-brand-600 dark:text-brand-300 flex items-center gap-2"><span>📈</span>Visual Explanations</h3>
            {explanation.visualizations.feature_importance_html && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold tracking-wide uppercase text-brand-600 dark:text-brand-300">Interactive Feature Analysis</h4>
                <div className="rounded-lg border border-brand-600/10 dark:border-brand-400/10 overflow-hidden bg-white dark:bg-slate-950" dangerouslySetInnerHTML={{ __html: explanation.visualizations.feature_importance_html }} />
              </div>
            )}
            {explanation.visualizations.feature_importance && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold tracking-wide uppercase text-brand-600 dark:text-brand-300">Feature Importance Chart</h4>
                <img src={explanation.visualizations.feature_importance} alt="Feature Importance Chart" className="w-full h-auto rounded-lg border border-brand-600/10 dark:border-brand-400/10 shadow-soft" />
              </div>
            )}
            {explanation.visualizations.feature_importance_text && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold tracking-wide uppercase text-brand-600 dark:text-brand-300">Feature Analysis Summary</h4>
                <div className="rounded-lg bg-brand-50/70 dark:bg-brand-700/20 border border-brand-600/10 dark:border-brand-400/10 p-4">
                  <pre className="text-[11px] leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{explanation.visualizations.feature_importance_text}</pre>
                </div>
              </div>
            )}
            {Object.entries(explanation.visualizations).map(([key, value]) => {
              if (!['feature_importance','feature_importance_html','feature_importance_text'].includes(key)) {
                return (
                  <div key={key} className="space-y-2">
                    <h4 className="text-xs font-semibold tracking-wide uppercase text-brand-600 dark:text-brand-300">{key.replace(/_/g,' ')}</h4>
                    {typeof value === 'string' && value.startsWith('data:image') ? (
                      <img src={value} alt={`${key} visualization`} className="w-full h-auto rounded-lg border border-brand-600/10 dark:border-brand-400/10 shadow-soft" />
                    ) : (
                      <div className="rounded-lg bg-brand-50/70 dark:bg-brand-700/20 border border-brand-600/10 dark:border-brand-400/10 p-4">
                        <pre className="text-[11px] leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            })}
          </div>
        );
      case 'recommendations':
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wide uppercase text-brand-600 dark:text-brand-300 flex items-center gap-2"><span>💡</span>Recommendations</h3>
            <ul className="grid sm:grid-cols-2 gap-3">
              {explanation.clinical_interpretation.recommendations.map((rec, i) => (
                <li key={i} className="p-3 rounded-lg bg-white/70 dark:bg-slate-950/40 border border-brand-600/10 dark:border-brand-400/10 text-sm text-gray-700 dark:text-gray-300 flex gap-2"><span className="text-brand-500">•</span><span>{rec}</span></li>
              ))}
            </ul>
          </div>
        );
      default:
        return <p className="text-sm text-gray-500 dark:text-gray-400">Select a tab.</p>;
    }
  };

  return (
    <div className="card">
      <div className="flex flex-wrap gap-2 border-b border-brand-600/10 dark:border-brand-400/10 mb-6">
        {tabs.map(tab => {
          const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-2 rounded-t-md text-sm font-medium transition-colors ${active ? 'bg-gradient-to-br from-brand-600 to-brand-700 text-white shadow-soft' : 'text-gray-600 dark:text-gray-300 hover:text-brand-700 dark:hover:text-brand-200'}`}
              >
                <span className="mr-1">{tab.icon}</span>{tab.label}
                {active && <span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-accent-400 to-transparent" />}
              </button>
            );
        })}
      </div>
      <div className="space-y-6">
        {renderTabContent()}
        {explanation.clinical_interpretation?.disclaimer && (
          <div className="p-4 rounded-md bg-yellow-50 dark:bg-yellow-600/20 border border-yellow-200 dark:border-yellow-500/30 text-xs text-yellow-800 dark:text-yellow-100">
            <strong>Disclaimer:</strong> {explanation.clinical_interpretation.disclaimer}
          </div>
        )}
      </div>
    </div>
  );
};

export default XAIExplanation;
