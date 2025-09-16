import React, { useState, useEffect, useMemo } from 'react';

const XAIExplanation = ({ explanation }) => {
  const [activeTab, setActiveTab] = useState('summary');

  const tabs = useMemo(() => {
    if (!explanation) return [];
    return [
      {
        id: 'summary',
        label: 'Summary',
        icon: '📊',
        available: explanation.clinical_interpretation?.summary
      },
      {
        id: 'shap',
        label: 'SHAP Analysis',
        icon: '🔍',
        available: explanation.shap && explanation.shap.feature_contributions
      },
      {
        id: 'visual',
        label: 'Visual Explanations',
        icon: '📈',
        available: explanation.visualizations && Object.keys(explanation.visualizations).length > 0
      },
      {
        id: 'recommendations',
        label: 'Recommendations',
        icon: '💡',
        available: explanation.clinical_interpretation?.recommendations && explanation.clinical_interpretation.recommendations.length > 0
      }
    ].filter(t => t.available);
  }, [explanation]);

  useEffect(() => {
    if (tabs.length && !tabs.some(t => t.id === activeTab)) {
      setActiveTab(tabs[0].id);
    }
  }, [tabs]);

  // Handle null, undefined, or missing explanation data
  if (!explanation) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-gray-500">No explanation data available</p>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'summary':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">📊</span>
              Summary
            </h3>
            <p className="text-gray-700">{explanation.clinical_interpretation.summary}</p>
          </div>
        );

      case 'shap':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">🔍</span>
              SHAP Analysis
            </h3>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Feature Contributions:</h4>
                <div className="space-y-2">
                  {explanation.shap.feature_contributions.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">{feature.feature}</span>
                        <span className="text-sm text-gray-600 ml-2">({feature.value})</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          feature.impact === 'increases_risk' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {feature.impact === 'increases_risk' ? 'Increases Risk' : 'Decreases Risk'}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {(feature.contribution * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {explanation.shap.method && (
                <div className="text-sm text-gray-600 mt-4">
                  <p><strong>Method:</strong> {explanation.shap.method}</p>
                  {explanation.shap.base_value && (
                    <p><strong>Base Value:</strong> {explanation.shap.base_value.toFixed(3)}</p>
                  )}
                  {explanation.shap.prediction_value && (
                    <p><strong>Prediction Value:</strong> {explanation.shap.prediction_value.toFixed(3)}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 'visual':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">📈</span>
              Visual Explanations
            </h3>

            <div className="space-y-6">
              {/* Display HTML charts */}
              {explanation.visualizations.feature_importance_html && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Interactive Feature Analysis</h4>
                  <div
                    className="border rounded-lg p-4 bg-gray-50"
                    dangerouslySetInnerHTML={{
                      __html: explanation.visualizations.feature_importance_html
                    }}
                  />
                </div>
              )}

              {/* Display Plotly PNG images */}
              {explanation.visualizations.feature_importance && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Feature Importance Chart</h4>
                  <img
                    src={explanation.visualizations.feature_importance}
                    alt="Feature Importance Chart"
                    className="w-full h-auto rounded border shadow-sm"
                  />
                </div>
              )}

              {/* Display text visualization as fallback */}
              {explanation.visualizations.feature_importance_text && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Feature Analysis Summary</h4>
                  <div className="bg-gray-50 p-4 rounded border">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {explanation.visualizations.feature_importance_text}
                    </pre>
                  </div>
                </div>
              )}

              {/* Display any other visualizations */}
              {Object.entries(explanation.visualizations).map(([key, value]) => {
                if (!['feature_importance', 'feature_importance_html', 'feature_importance_text'].includes(key)) {
                  return (
                    <div key={key}>
                      <h4 className="font-medium text-gray-800 mb-2 capitalize">
                        {key.replace(/_/g, ' ')}
                      </h4>
                      {typeof value === 'string' && value.startsWith('data:image') ? (
                        <img
                          src={value}
                          alt={`${key} visualization`}
                          className="w-full h-auto rounded border shadow-sm"
                        />
                      ) : (
                        <div className="bg-gray-50 p-4 rounded border">
                          <pre className="text-sm text-gray-700">{JSON.stringify(value, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        );

      case 'recommendations':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">💡</span>
              Recommendations
            </h3>
            <ul className="list-disc list-inside space-y-1">
              {explanation.clinical_interpretation.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-gray-700">{rec}</li>
              ))}
            </ul>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Select a tab to view content</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-0" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {renderTabContent()}

        {/* Disclaimer - always show at bottom if available */}
        {explanation.clinical_interpretation?.disclaimer && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              <strong>Disclaimer:</strong> {explanation.clinical_interpretation.disclaimer}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default XAIExplanation;
