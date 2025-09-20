import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { diagnosisAPI } from '../services/api';
import toast from 'react-hot-toast';
import { 
  Search, 
  Brain, 
  DollarSign, 
  Wrench, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  Loader2,
  Calendar,
  Settings
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const Diagnosis = () => {
  const { t, i18n } = useTranslation();
  const [symptoms, setSymptoms] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [motorcycleModel, setMotorcycleModel] = useState('');
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSymptoms, setLoadingSymptoms] = useState(true);
  const [diagnosisResult, setDiagnosisResult] = useState(null);

  // Load symptoms on component mount
  useEffect(() => {
    loadSymptoms();
  }, [i18n.language]);

  const loadSymptoms = async () => {
    try {
      setLoadingSymptoms(true);
      const response = await diagnosisAPI.getSymptoms(i18n.language);
      setSymptoms(response.data);
    } catch (error) {
      console.error('Failed to load symptoms:', error);
      toast.error('Failed to load symptoms');
    } finally {
      setLoadingSymptoms(false);
    }
  };

  const handleSymptomChange = (symptomId) => {
    setSelectedSymptoms(prev => {
      if (prev.includes(symptomId)) {
        return prev.filter(id => id !== symptomId);
      } else {
        return [...prev, symptomId];
      }
    });
  };

  const handleDiagnosis = async () => {
    if (selectedSymptoms.length === 0) {
      toast.error('Please select at least one symptom');
      return;
    }

    setLoading(true);
    try {
      const diagnosisData = {
        symptoms: selectedSymptoms,
        motorcycle_model: motorcycleModel || null,
        year: year ? parseInt(year) : null,
        language: i18n.language,
      };

      const response = await diagnosisAPI.createDiagnosis(diagnosisData);
      setDiagnosisResult(response.data);
      
      // Scroll to results
      setTimeout(() => {
        document.getElementById('diagnosis-results')?.scrollIntoView({ 
          behavior: 'smooth' 
        });
      }, 100);
      
      toast.success('Diagnosis completed successfully!');
    } catch (error) {
      console.error('Diagnosis failed:', error);
      toast.error('Diagnosis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getConfidenceColor = (score) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceText = (score) => {
    if (score >= 0.8) return 'High Confidence';
    if (score >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  if (loadingSymptoms) {
    return <LoadingSpinner text="Loading symptoms..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('diagnosis.title')}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('diagnosis.select')}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Diagnosis Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
              {/* Form Inputs */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('diagnosis.model')}
                  </label>
                  <div className="relative">
                    <Settings className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      className="form-input pl-10"
                      placeholder="Honda Vario, Yamaha NMAX, etc."
                      value={motorcycleModel}
                      onChange={(e) => setMotorcycleModel(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('diagnosis.year')}
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      className="form-input pl-10"
                      placeholder="2020"
                      min="2000"
                      max={new Date().getFullYear()}
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Symptoms Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Select Symptoms ({selectedSymptoms.length} selected)
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {symptoms.map((symptom) => (
                    <label
                      key={symptom.id}
                      className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        selectedSymptoms.includes(symptom.id)
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="form-checkbox mr-3"
                        checked={selectedSymptoms.includes(symptom.id)}
                        onChange={() => handleSymptomChange(symptom.id)}
                      />
                      <div>
                        <div className="font-medium text-gray-900">{symptom.name}</div>
                        <div className="text-sm text-gray-500 capitalize">{symptom.category}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Analyze Button */}
              <button
                onClick={handleDiagnosis}
                disabled={selectedSymptoms.length === 0 || loading}
                className="w-full btn-primary py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Brain className="w-5 h-5 mr-2" />
                    {t('diagnosis.analyze')}
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-1">
            {diagnosisResult ? (
              <div id="diagnosis-results" className="bg-white rounded-2xl shadow-md p-6 sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <CheckCircle2 className="w-6 h-6 text-green-500 mr-2" />
                  {t('diagnosis.results')}
                </h3>

                {/* Confidence Score */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {t('diagnosis.confidence')}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(diagnosisResult.confidence_score)}`}>
                      {getConfidenceText(diagnosisResult.confidence_score)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${diagnosisResult.confidence_score * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-sm text-gray-500 mt-1">
                    {Math.round(diagnosisResult.confidence_score * 100)}%
                  </div>
                </div>

                {/* Estimated Cost */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <DollarSign className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-900">
                      {t('diagnosis.estimated_cost')}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-blue-900">
                    {formatCurrency(diagnosisResult.estimated_cost)}
                  </div>
                </div>

                {/* Diagnosis Results */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <AlertCircle className="w-4 h-4 text-orange-500 mr-2" />
                    Identified Issues
                  </h4>
                  <div className="space-y-2">
                    {diagnosisResult.diagnosis.map((diagnosis, index) => (
                      <div key={index} className="p-3 bg-orange-50 rounded-lg text-sm text-orange-800">
                        {diagnosis}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Spare Parts */}
                {diagnosisResult.spare_parts && diagnosisResult.spare_parts.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Wrench className="w-4 h-4 text-green-500 mr-2" />
                      {t('diagnosis.spare_parts')}
                    </h4>
                    <div className="space-y-2">
                      {diagnosisResult.spare_parts.map((part, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                          <div>
                            <div className="font-medium text-green-900">{part.name}</div>
                            <div className="text-sm text-green-600 capitalize">{part.category}</div>
                          </div>
                          <div className="text-green-900 font-semibold">
                            {formatCurrency(part.average_price)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {diagnosisResult.recommendations && diagnosisResult.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <TrendingUp className="w-4 h-4 text-purple-500 mr-2" />
                      {t('diagnosis.recommendations')}
                    </h4>
                    <div className="space-y-2">
                      {diagnosisResult.recommendations.map((recommendation, index) => (
                        <div key={index} className="p-3 bg-purple-50 rounded-lg text-sm text-purple-800">
                          {recommendation}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-md p-6 text-center">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Ready for Diagnosis
                </h3>
                <p className="text-gray-600">
                  Select symptoms and click "Analyze" to get your motorcycle diagnosis results.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Diagnosis;