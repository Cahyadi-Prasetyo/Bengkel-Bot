import React from 'react';
import { useTranslation } from 'react-i18next';

const LoadingSpinner = ({ size = 'medium', text = null }) => {
  const { t } = useTranslation();
  
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className={`spinner ${sizeClasses[size]} mb-4`}></div>
      <p className="text-gray-600 text-sm animate-pulse">
        {text || t('common.loading')}
      </p>
    </div>
  );
};

export default LoadingSpinner;