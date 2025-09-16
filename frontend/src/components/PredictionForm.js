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

// XAI Prediction Result Component
const XAIPredictionResult = ({ result, resetForm }) => {
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

export default PredictionForm;
