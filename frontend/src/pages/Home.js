import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { 
  Search, 
  Brain, 
  Globe, 
  History, 
  Wrench, 
  TrendingUp, 
  Users, 
  Award,
  ArrowRight,
  CheckCircle 
} from 'lucide-react';

const Home = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const features = [
    {
      icon: Brain,
      title: t('home.features.ai'),
      description: 'Advanced AI algorithms analyze symptoms and provide accurate diagnoses with confidence scores.',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      icon: Globe,
      title: t('home.features.global'),
      description: 'Real-time pricing from global suppliers with multi-currency support for cost-effective repairs.',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: History,
      title: t('home.features.history'),
      description: 'Track all diagnoses with detailed history and progress monitoring for better service.',
      color: 'bg-green-100 text-green-600',
    },
  ];

  const stats = [
    { label: 'Diagnoses Completed', value: '10,000+', icon: Search },
    { label: 'Workshop Partners', value: '500+', icon: Users },
    { label: 'Accuracy Rate', value: '95%', icon: Award },
    { label: 'Cost Savings', value: '30%', icon: TrendingUp },
  ];

  const benefits = [
    'Reduce diagnostic time by up to 70%',
    'Access to global spare parts database',
    'Multi-language support for international use',
    'AI-powered recommendations for complex issues',
    'Real-time cost estimation and budgeting',
    'Comprehensive repair history tracking',
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up">
              {t('home.title')}
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-4 animate-fade-in-up animation-delay-200">
              {t('home.subtitle')}
            </p>
            <p className="text-lg text-primary-200 mb-12 max-w-3xl mx-auto animate-fade-in-up animation-delay-400">
              {t('home.description')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-600">
              <Link
                to="/diagnosis"
                className="inline-flex items-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <Search className="w-5 h-5 mr-2" />
                {t('home.start')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              
              <Link
                to="/history"
                className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-primary-600 transition-all duration-300"
              >
                <History className="w-5 h-5 mr-2" />
                View History
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-md p-6 mb-12">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.name}!
              </h2>
              {user?.workshop_name && (
                <p className="text-gray-600">{user.workshop_name}</p>
              )}
              <p className="text-gray-500 mt-1">
                Ready to diagnose some motorcycles today?
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-6 text-center shadow-md card-hover">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-primary-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('home.features.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our advanced platform combines AI technology with global data to provide the most accurate and cost-effective motorcycle diagnostics.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-md card-hover text-center">
                <div className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center mx-auto mb-6`}>
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-2xl p-8 shadow-md">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Key Benefits for Your Workshop
              </h3>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center">
              <div className="bg-gradient-primary rounded-2xl p-8 text-white">
                <Wrench className="w-16 h-16 mx-auto mb-4" />
                <h4 className="text-xl font-bold mb-2">Professional Tools</h4>
                <p className="text-primary-100">
                  Everything you need for accurate motorcycle diagnosis and repair cost estimation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Begin your first motorcycle diagnosis and experience the power of AI-driven analysis.
          </p>
          <Link
            to="/diagnosis"
            className="inline-flex items-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Search className="w-5 h-5 mr-2" />
            {t('home.start')}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;