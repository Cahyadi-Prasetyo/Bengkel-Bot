import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  Search, 
  History, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Globe 
} from 'lucide-react';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  const navigation = [
    { name: t('nav.home'), href: '/home', icon: Home, current: location.pathname === '/home' },
    { name: t('nav.diagnosis'), href: '/diagnosis', icon: Search, current: location.pathname === '/diagnosis' },
    { name: t('nav.history'), href: '/history', icon: History, current: location.pathname === '/history' },
    { name: t('nav.profile'), href: '/profile', icon: User, current: location.pathname === '/profile' },
  ];

  const languages = [
    { code: 'id', name: 'Indonesia', flag: '🇮🇩' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const changeLanguage = (languageCode) => {
    i18n.changeLanguage(languageCode);
    setIsLanguageMenuOpen(false);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <nav className="bg-white shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/home" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <span className="text-xl font-bold text-gradient">BengkelBot Pro</span>
              </Link>
            </div>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      item.current
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-4">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              >
                <Globe className="w-4 h-4" />
                <span>{currentLanguage.flag}</span>
                <span>{currentLanguage.name}</span>
              </button>
              
              {isLanguageMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => changeLanguage(language.code)}
                      className={`${
                        i18n.language === language.code
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-700'
                      } flex items-center space-x-3 px-4 py-2 text-sm w-full text-left hover:bg-gray-100 transition-colors duration-200`}
                    >
                      <span>{language.flag}</span>
                      <span>{language.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-gray-900">{user?.name}</span>
                {user?.workshop_name && (
                  <span className="text-xs text-gray-500">{user.workshop_name}</span>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('nav.logout')}</span>
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    item.current
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  } flex items-center px-3 py-2 border-l-4 text-base font-medium transition-colors duration-200`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </div>
          
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-5">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{user?.name}</div>
                <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                {user?.workshop_name && (
                  <div className="text-sm text-gray-500">{user.workshop_name}</div>
                )}
              </div>
            </div>
            
            <div className="mt-3 px-2 space-y-1">
              {/* Language options */}
              <div className="px-3 py-2">
                <div className="text-sm font-medium text-gray-500 mb-2">{t('diagnosis.language')}</div>
                <div className="grid grid-cols-3 gap-2">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => changeLanguage(language.code)}
                      className={`${
                        i18n.language === language.code
                          ? 'bg-primary-100 text-primary-700 border-primary-200'
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                      } flex items-center justify-center space-x-1 px-2 py-1 text-xs border rounded transition-colors duration-200`}
                    >
                      <span>{language.flag}</span>
                      <span>{language.code.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
              >
                <LogOut className="w-5 h-5 mr-3" />
                {t('nav.logout')}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;