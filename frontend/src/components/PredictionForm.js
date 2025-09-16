import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import XAIExplanation from './XAIExplanation';

const PredictionForm = () => {
  const [formData, setFormData] = useState({
    Gender: '',
    Hemoglobin: '',
    MCH: '',
    MCHC: '',
    MCV: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [inputMethod, setInputMethod] = useState('form');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please select a valid CSV file');
      setFile(null);
    }
  };

  const validateForm = () => {
    const requiredFields = ['Gender', 'Hemoglobin', 'MCH', 'MCHC', 'MCV'];
    for (let field of requiredFields) {
      if (!formData[field]) {
        setError(`${field} is required`);
        return false;
      }
    }

    // Validate ranges - More realistic medical ranges
    const hemoglobin = parseFloat(formData.Hemoglobin);
    const mch = parseFloat(formData.MCH);
    const mchc = parseFloat(formData.MCHC);
    const mcv = parseFloat(formData.MCV);

    if (hemoglobin < 3 || hemoglobin > 25) {
      setError('Hemoglobin must be between 3.0 and 25.0 g/dL');
      return false;
    }
    if (mch < 10 || mch > 50) {
      setError('MCH must be between 10.0 and 50.0 pg');
      return false;
    }
    if (mchc < 20 || mchc > 45) {
      setError('MCHC must be between 20.0 and 45.0 g/dL');
      return false;
    }
    if (mcv < 50 || mcv > 130) {
      setError('MCV must be between 50.0 and 130.0 fL');
      return false;
    }

    return true;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    if (inputMethod === 'form') {
      if (!validateForm()) {
        setLoading(false);
        return;
      }

      try {
        const predictionData = {
          Gender: parseInt(formData.Gender),
          Hemoglobin: parseFloat(formData.Hemoglobin),
          MCH: parseFloat(formData.MCH),
          MCHC: parseFloat(formData.MCHC),
          MCV: parseFloat(formData.MCV)
        };

        const response = await api.makePrediction(predictionData);
        setResult(response.data);
      } catch (error) {
        setError(error.response?.data?.error || 'Prediction failed');
      }
    } else {
      if (!file) {
        setError('Please select a CSV file');
        setLoading(false);
        return;
      }

      try {
        const response = await api.makePredictionWithFile(file);
        setResult(response.data);
      } catch (error) {
        setError(error.response?.data?.error || 'Prediction failed');
      }
    }

    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      Gender: '',
      Hemoglobin: '',
      MCH: '',
      MCHC: '',
      MCV: ''
    });
    setFile(null);
    setResult(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Anemia Prediction with AI Explanations</h1>

          {!result ? (
            <div className="card">
              {/* Input Method Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How would you like to input your lab values?
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="form"
                      checked={inputMethod === 'form'}
                      onChange={(e) => setInputMethod(e.target.value)}
                      className="mr-2"
                    />
                    Manual Entry
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="file"
                      checked={inputMethod === 'file'}
                      onChange={(e) => setInputMethod(e.target.value)}
                      className="mr-2"
                    />
                    Upload CSV File
                  </label>
                </div>
              </div>

              <form onSubmit={handleFormSubmit}>
                {inputMethod === 'form' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="Gender"
                        value={formData.Gender}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="0">Female</option>
                        <option value="1">Male</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hemoglobin (g/dL) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        name="Hemoglobin"
                        value={formData.Hemoglobin}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="e.g., 12.5"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Normal range: 12-15.5 (women), 13.5-17.5 (men)</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        MCH (pg) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        name="MCH"
                        value={formData.MCH}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="e.g., 28.0"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Normal range: 27-32 pg</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        MCHC (g/dL) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        name="MCHC"
                        value={formData.MCHC}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="e.g., 33.5"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Normal range: 32-36 g/dL</p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        MCV (fL) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        name="MCV"
                        value={formData.MCV}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="e.g., 85.0"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Normal range: 80-100 fL</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload CSV File <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="form-input"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      CSV file should contain one row with columns: Gender, Hemoglobin, MCH, MCHC, MCV
                    </p>
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <p className="text-xs text-gray-600 font-medium">Example CSV format:</p>
                      <code className="text-xs">Gender,Hemoglobin,MCH,MCHC,MCV</code><br />
                      <code className="text-xs">1,10.5,25.0,30.0,75.0</code>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="alert-error mt-4">
                    {error}
                  </div>
                )}

                <div className="flex gap-4 mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary disabled:opacity-50"
                  >
                    {loading ? 'Analyzing...' : 'Run Prediction'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-secondary"
                  >
                    Clear Form
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Enhanced Prediction Result with XAI */}
              <XAIPredictionResult result={result} resetForm={resetForm} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// New XAI Prediction Result Component
const XAIPredictionResult = ({ result, resetForm }) => {
  const [activeTab, setActiveTab] = useState('summary');
  const navigate = useNavigate();

  const getRiskLevel = (probability) => {
    if (probability > 0.7) return { level: 'High', color: 'text-red-600', bgColor: 'bg-red-100' };
    if (probability > 0.3) return { level: 'Moderate', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { level: 'Low', color: 'text-green-600', bgColor: 'bg-green-100' };
  };

  const riskInfo = getRiskLevel(result.predicted_proba);

  return (
    <div className="space-y-6">
      {/* Main Prediction Result */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Prediction Result</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`p-4 rounded-lg ${riskInfo.bgColor}`}>
            <div className="text-center">
              <div className={`text-3xl font-bold ${riskInfo.color}`}>
                {result.predicted_label === 1 ? 'Anemic' : 'Not Anemic'}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Confidence: {(result.predicted_proba * 100).toFixed(1)}%
              </div>
              <div className={`text-sm font-medium mt-2 ${riskInfo.color}`}>
                Risk Level: {riskInfo.level}
              </div>
            </div>
          </div>

          <div className="col-span-2">
            <h3 className="font-semibold text-gray-900 mb-3">Clinical Summary</h3>
            {result.explanations?.clinical_interpretation && (
              <div className="text-sm text-gray-700">
                <p className="mb-2">{result.explanations.clinical_interpretation.summary}</p>
                {result.explanations.clinical_interpretation.key_factors?.length > 0 && (
                  <div className="mt-3">
                    <h4 className="font-medium text-gray-900">Key Contributing Factors:</h4>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      {result.explanations.clinical_interpretation.key_factors.map((factor, index) => (
                        <li key={index} className="text-xs">
                          <strong>{factor.feature}:</strong> {factor.interpretation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* XAI Visual Explanation */}
      <XAIExplanation explanation={result.explanations} />

      {/* XAI Explanation Tabs */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'summary', name: 'Summary', icon: '📊' },
              { id: 'shap', name: 'SHAP Analysis', icon: '🔍' },
              { id: 'visualizations', name: 'Visual Explanations', icon: '📈' },
              { id: 'recommendations', name: 'Recommendations', icon: '💡' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-1`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === 'summary' && (
            <FeatureContributionsTab result={result} />
          )}

          {activeTab === 'shap' && (
            <SHAPAnalysisTab result={result} />
          )}

          {activeTab === 'visualizations' && (
            <VisualizationsTab result={result} />
          )}

          {activeTab === 'recommendations' && (
            <RecommendationsTab result={result} />
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">What's Next?</h3>
        <div className="flex flex-wrap gap-4">
          <button onClick={resetForm} className="btn-primary">
            Run Another Test
          </button>
          <button onClick={() => navigate('/patient')} className="btn-secondary">
            Back to Dashboard
          </button>
          <button onClick={() => navigate('/patient/prescriptions')} className="btn-secondary">
            View Prescriptions
          </button>
        </div>

        <div className="mt-4 p-3 bg-yellow-50 rounded-md">
          <p className="text-yellow-800 text-sm">
            <strong>Important:</strong> This AI prediction with explanations is for informational purposes only.
            Always consult with your healthcare provider for proper diagnosis and treatment.
          </p>
        </div>
      </div>
    </div>
  );
};

// Feature Contributions Summary Tab
const FeatureContributionsTab = ({ result }) => {
  const shapData = result.explanations?.shap;

  if (!shapData) {
    return <div className="text-center text-gray-500">SHAP explanations not available</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Feature Contributions to Prediction</h3>

      <div className="grid gap-4">
        {shapData.feature_contributions?.map((feature, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="font-medium text-gray-900">{feature.feature}</div>
              <div className="text-sm text-gray-600">Value: {feature.value}</div>
            </div>

            <div className="flex items-center space-x-3">
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                feature.impact === 'increases_risk' 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {feature.impact === 'increases_risk' ? 'Increases Risk' : 'Decreases Risk'}
              </div>

              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    feature.impact === 'increases_risk' ? 'bg-red-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(Math.abs(feature.contribution) * 100, 100)}%` }}
                />
              </div>

              <div className="text-sm font-medium text-gray-900 w-16 text-right">
                {(feature.contribution * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// SHAP Analysis Tab
const SHAPAnalysisTab = ({ result }) => {
  const shapData = result.explanations?.shap;
  const limeData = result.explanations?.lime;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SHAP (SHapley Additive exPlanations)</h3>
        <p className="text-sm text-gray-600 mb-4">
          SHAP values show how each feature contributes to pushing the model output from the expected baseline
          to the current prediction. Positive values (red) increase anemia risk, negative values (blue) decrease it.
        </p>

        {shapData ? (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Base Value:</strong> {shapData.base_value?.toFixed(3)}
              </div>
              <div>
                <strong>Prediction Value:</strong> {shapData.prediction_value?.toFixed(3)}
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-medium text-gray-900 mb-2">Top Contributing Features:</h4>
              <div className="space-y-2">
                {shapData.top_features?.map((feature, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-white rounded">
                    <span className="font-medium">{feature.feature}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      feature.contribution > 0 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {feature.contribution > 0 ? '+' : ''}{(feature.contribution * 100).toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 p-4">SHAP analysis not available</div>
        )}
      </div>

      {limeData && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">LIME (Local Interpretable Model-agnostic Explanations)</h3>
          <p className="text-sm text-gray-600 mb-4">
            LIME provides local explanations by learning an interpretable model locally around the prediction.
          </p>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm mb-2">
              <strong>LIME Score:</strong> {limeData.score?.toFixed(3)}
            </div>

            <div className="space-y-2">
              {limeData.feature_contributions?.map((feature, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-white rounded">
                  <span className="font-medium">{feature.feature}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    feature.contribution > 0 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {(feature.contribution * 100).toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Visualizations Tab
const VisualizationsTab = ({ result }) => {
  const visualizations = result.explanations?.visualizations;

  if (!visualizations || Object.keys(visualizations).length === 0) {
    return (
      <div className="text-center text-gray-500 p-8">
        <div className="text-4xl mb-4">📊</div>
        <p>Visual explanations are being generated...</p>
        <p className="text-sm mt-2">Check back in a moment or refresh the page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">AI Explanation Visualizations</h3>

      {visualizations.force_plot && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">SHAP Force Plot</h4>
          <p className="text-sm text-gray-600">
            Shows how each feature pushes the prediction towards or away from anemia risk.
          </p>
          <div className="border rounded-lg p-4 bg-white">
            <img
              src={visualizations.force_plot}
              alt="SHAP Force Plot"
              className="w-full h-auto rounded"
            />
          </div>
        </div>
      )}

      {visualizations.feature_importance && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Feature Importance Chart</h4>
          <p className="text-sm text-gray-600">
            Absolute importance of each feature in the prediction.
          </p>
          <div className="border rounded-lg p-4 bg-white">
            <img
              src={visualizations.feature_importance}
              alt="Feature Importance"
              className="w-full h-auto rounded"
            />
          </div>
        </div>
      )}

      {visualizations.waterfall && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">SHAP Waterfall Chart</h4>
          <p className="text-sm text-gray-600">
            Shows the cumulative effect of features on the final prediction.
          </p>
          <div className="border rounded-lg p-4 bg-white">
            <img
              src={visualizations.waterfall}
              alt="SHAP Waterfall Chart"
              className="w-full h-auto rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Recommendations Tab
const RecommendationsTab = ({ result }) => {
  const interpretation = result.explanations?.clinical_interpretation;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Clinical Recommendations</h3>

        {interpretation?.recommendations?.length > 0 ? (
          <div className="space-y-3">
            {interpretation.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <p className="text-blue-800 text-sm">{recommendation}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No specific recommendations available.</p>
        )}
      </div>

      <div className="border-t pt-6">
        <h4 className="font-medium text-gray-900 mb-3">General Health Tips</h4>
        <div className="space-y-2 text-sm text-gray-700">
          <p>• Maintain a balanced diet rich in iron, vitamin B12, and folate</p>
          <p>• Include iron-rich foods like lean meat, spinach, lentils, and fortified cereals</p>
          <p>• Pair iron-rich foods with vitamin C sources for better absorption</p>
          <p>• Limit tea and coffee consumption with meals as they can inhibit iron absorption</p>
          <p>• Regular follow-up with healthcare providers for monitoring</p>
        </div>
      </div>

      {interpretation?.disclaimer && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-800 text-sm">
            <strong>Disclaimer:</strong> {interpretation.disclaimer}
          </p>
        </div>
      )}
    </div>
  );
};

export default PredictionForm;
