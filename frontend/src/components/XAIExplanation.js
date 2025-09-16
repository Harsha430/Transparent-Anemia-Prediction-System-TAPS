import React from 'react';

const XAIExplanation = ({ explanation }) => {
  // Handle null, undefined, or missing explanation data
  if (!explanation) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-gray-500">No explanation data available</p>
      </div>
    );
  }

  // Check if we have SHAP data
  if (explanation.shap && explanation.shap.feature_contributions) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Model Explanation</h3>

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
  }

  // Check if we have visualizations
  if (explanation.visualizations && Object.keys(explanation.visualizations).length > 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Visual Explanations</h3>
        <div className="space-y-4">
          {Object.entries(explanation.visualizations).map(([key, imageData]) => (
            <div key={key}>
              <h4 className="font-medium text-gray-800 mb-2 capitalize">
                {key.replace(/_/g, ' ')}
              </h4>
              <img
                src={imageData}
                alt={`${key} visualization`}
                className="w-full h-auto rounded border"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Check if we have clinical interpretation
  if (explanation.clinical_interpretation) {
    const clinical = explanation.clinical_interpretation;
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Clinical Interpretation</h3>

        {clinical.summary && (
          <div className="mb-4">
            <p className="text-gray-700">{clinical.summary}</p>
          </div>
        )}

        {clinical.recommendations && clinical.recommendations.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium text-gray-800 mb-2">Recommendations:</h4>
            <ul className="list-disc list-inside space-y-1">
              {clinical.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-gray-700">{rec}</li>
              ))}
            </ul>
          </div>
        )}

        {clinical.disclaimer && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-yellow-800 text-sm">
              <strong>Disclaimer:</strong> {clinical.disclaimer}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Fallback for any other explanation format
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Explanation Data</h3>
      <pre className="text-sm text-gray-600 overflow-auto">
        {JSON.stringify(explanation, null, 2)}
      </pre>
    </div>
  );
};

export default XAIExplanation;
