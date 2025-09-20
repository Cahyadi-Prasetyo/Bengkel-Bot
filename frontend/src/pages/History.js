import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { diagnosisAPI } from '../services/api';
import toast from 'react-hot-toast';
import { 
  History as HistoryIcon, 
  Calendar, 
  DollarSign, 
  Eye,
  Search,
  AlertCircle,
  Wrench,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Filter
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const History = () => {
  const { t } = useTranslation();
  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filterBy, setFilterBy] = useState('all');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await diagnosisAPI.getHistory(50, 0); // Load more items
      setDiagnoses(response.data);
    } catch (error) {
      console.error('Failed to load history:', error);
      toast.error('Failed to load diagnosis history');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (diagnosisId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(diagnosisId)) {
      newExpanded.delete(diagnosisId);
    } else {
      newExpanded.add(diagnosisId);
    }
    setExpandedItems(newExpanded);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getConfidenceColor = (score) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceText = (score) => {
    if (score >= 0.8) return 'High';
    if (score >= 0.6) return 'Medium';
    return 'Low';
  };

  // Filter and sort diagnoses
  const filteredAndSortedDiagnoses = diagnoses
    .filter(diagnosis => {
      const matchesSearch = diagnosis.diagnosis.some(d => 
        d.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (filterBy === 'high_cost') return diagnosis.estimated_cost > 1000000;
      if (filterBy === 'low_confidence') return diagnosis.confidence_score < 0.6;
      if (filterBy === 'recent') {
        const diagnosisDate = new Date(diagnosis.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return diagnosisDate >= weekAgo;
      }
      
      return matchesSearch || searchTerm === '';
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      if (sortBy === 'cost') {
        return b.estimated_cost - a.estimated_cost;
      }
      if (sortBy === 'confidence') {
        return b.confidence_score - a.confidence_score;
      }
      return 0;
    });

  if (loading) {
    return <LoadingSpinner text="Loading diagnosis history..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
            <HistoryIcon className="w-8 h-8 mr-3 text-primary-600" />
            {t('history.title')}
          </h1>
          <p className="text-lg text-gray-600">
            Track all your motorcycle diagnoses and repair history
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Search */}
            <div className="relative flex-1 md:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search diagnoses..."
                className="form-input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <select
                className="form-input"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date">Sort by Date</option>
                <option value="cost">Sort by Cost</option>
                <option value="confidence">Sort by Confidence</option>
              </select>

              <select
                className="form-input"
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
              >
                <option value="all">All Diagnoses</option>
                <option value="recent">Recent (7 days)</option>
                <option value="high_cost">High Cost (>1M IDR)</option>
                <option value="low_confidence">Low Confidence</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{diagnoses.length}</div>
              <div className="text-sm text-gray-600">Total Diagnoses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(
                  diagnoses.reduce((sum, d) => sum + d.estimated_cost, 0) / diagnoses.length || 0
                )}
              </div>
              <div className="text-sm text-gray-600">Avg. Cost</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(
                  (diagnoses.reduce((sum, d) => sum + d.confidence_score, 0) / diagnoses.length || 0) * 100
                )}%
              </div>
              <div className="text-sm text-gray-600">Avg. Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {diagnoses.filter(d => {
                  const date = new Date(d.created_at);
                  const monthAgo = new Date();
                  monthAgo.setMonth(monthAgo.getMonth() - 1);
                  return date >= monthAgo;
                }).length}
              </div>
              <div className="text-sm text-gray-600">This Month</div>
            </div>
          </div>
        </div>

        {/* Diagnosis History List */}
        {filteredAndSortedDiagnoses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <HistoryIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || filterBy !== 'all' ? 'No results found' : t('history.empty')}
            </h3>
            <p className="text-gray-600">
              {searchTerm || filterBy !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Start diagnosing motorcycles to build your history'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedDiagnoses.map((diagnosis) => (
              <div key={diagnosis.id} className="bg-white rounded-2xl shadow-md overflow-hidden">
                {/* Header */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900">
                          Diagnosis #{diagnosis.id.slice(-8)}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(diagnosis.created_at)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {/* Confidence Score */}
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getConfidenceColor(diagnosis.confidence_score)}`}>
                        {getConfidenceText(diagnosis.confidence_score)} Confidence
                      </div>
                      
                      {/* Cost */}
                      <div className="text-right">
                        <div className="flex items-center text-lg font-bold text-gray-900">
                          <DollarSign className="w-5 h-5 text-green-600 mr-1" />
                          {formatCurrency(diagnosis.estimated_cost)}
                        </div>
                      </div>
                      
                      {/* Expand Button */}
                      <button
                        onClick={() => toggleExpanded(diagnosis.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                      >
                        {expandedItems.has(diagnosis.id) ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Quick Summary */}
                  <div className="flex flex-wrap gap-2">
                    {diagnosis.symptoms.slice(0, 3).map((symptom, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {symptom}
                      </span>
                    ))}
                    {diagnosis.symptoms.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        +{diagnosis.symptoms.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedItems.has(diagnosis.id) && (
                  <div className="border-t bg-gray-50 p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Left Column */}
                      <div className="space-y-4">
                        {/* All Symptoms */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                            <AlertCircle className="w-4 h-4 text-orange-500 mr-2" />
                            All Symptoms ({diagnosis.symptoms.length})
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {diagnosis.symptoms.map((symptom, index) => (
                              <span key={index} className="px-2 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">
                                {symptom}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Diagnosis Results */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">
                            Identified Issues
                          </h4>
                          <div className="space-y-2">
                            {diagnosis.diagnosis.map((result, index) => (
                              <div key={index} className="p-3 bg-white rounded-lg border text-sm">
                                {result}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-4">
                        {/* Spare Parts */}
                        {diagnosis.spare_parts && diagnosis.spare_parts.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                              <Wrench className="w-4 h-4 text-green-500 mr-2" />
                              Required Spare Parts
                            </h4>
                            <div className="space-y-2">
                              {diagnosis.spare_parts.map((part, index) => (
                                <div key={index} className="flex justify-between items-center p-3 bg-white rounded-lg border">
                                  <div>
                                    <div className="font-medium text-gray-900">{part.name}</div>
                                    <div className="text-sm text-gray-500 capitalize">{part.category}</div>
                                  </div>
                                  <div className="text-green-600 font-semibold">
                                    {formatCurrency(part.average_price)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Recommendations */}
                        {diagnosis.recommendations && diagnosis.recommendations.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                              <TrendingUp className="w-4 h-4 text-purple-500 mr-2" />
                              Recommendations
                            </h4>
                            <div className="space-y-2">
                              {diagnosis.recommendations.map((recommendation, index) => (
                                <div key={index} className="p-3 bg-purple-50 rounded-lg text-sm text-purple-800">
                                  {recommendation}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;