import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Mail, 
  Building, 
  Phone, 
  Save, 
  Edit3, 
  CheckCircle,
  Globe,
  Settings
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { t, i18n } = useTranslation();
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    workshop_name: user?.workshop_name || '',
    phone: user?.phone || '',
  });

  const languages = [
    { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setEditing(false);
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Profile update failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      workshop_name: user?.workshop_name || '',
      phone: user?.phone || '',
    });
    setEditing(false);
  };

  const changeLanguage = (languageCode) => {
    i18n.changeLanguage(languageCode);
    toast.success(`Language changed to ${languages.find(l => l.code === languageCode)?.name}`);
  };

  const formatMemberSince = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
            <User className="w-8 h-8 mr-3 text-primary-600" />
            {t('profile.title')}
          </h1>
          <p className="text-lg text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              {/* Profile Header */}
              <div className="bg-gradient-primary p-6 text-white">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{user?.name}</h2>
                    <p className="text-primary-100">{user?.email}</p>
                    {user?.workshop_name && (
                      <p className="text-primary-200 text-sm mt-1">{user.workshop_name}</p>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-primary-100">
                    Member since {formatMemberSince(user?.created_at)}
                  </div>
                  <button
                    onClick={() => setEditing(!editing)}
                    className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>{editing ? 'Cancel' : t('profile.update')}</span>
                  </button>
                </div>
              </div>

              {/* Profile Form */}
              <div className="p-6">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    {/* Name */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          disabled={!editing}
                          className={`form-input pl-10 ${!editing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                          value={formData.name}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    {/* Email (read-only) */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="email"
                          type="email"
                          disabled
                          className="form-input pl-10 bg-gray-50 cursor-not-allowed"
                          value={user?.email}
                        />
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Email cannot be changed. Contact support if needed.
                      </p>
                    </div>

                    {/* Workshop Name */}
                    <div>
                      <label htmlFor="workshop_name" className="block text-sm font-medium text-gray-700 mb-2">
                        Workshop Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Building className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="workshop_name"
                          name="workshop_name"
                          type="text"
                          disabled={!editing}
                          className={`form-input pl-10 ${!editing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                          value={formData.workshop_name}
                          onChange={handleChange}
                          placeholder="Enter your workshop name"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          disabled={!editing}
                          className={`form-input pl-10 ${!editing ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+62 812 3456 7890"
                        />
                      </div>
                    </div>

                    {/* Save Button */}
                    {editing && (
                      <div className="flex space-x-3">
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <div className="flex items-center justify-center">
                              <div className="spinner w-5 h-5 mr-2"></div>
                              Saving...
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              <Save className="w-5 h-5 mr-2" />
                              {t('profile.save')}
                            </div>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="flex-1 btn-secondary py-3"
                        >
                          {t('common.cancel')}
                        </button>
                      </div>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            {/* Language Settings */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Globe className="w-5 h-5 mr-2 text-primary-600" />
                Language Settings
              </h3>
              <div className="space-y-2">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => changeLanguage(language.code)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                      i18n.language === language.code
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{language.flag}</span>
                      <span className="font-medium">{language.name}</span>
                    </div>
                    {i18n.language === language.code && (
                      <CheckCircle className="w-5 h-5 text-primary-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Account Stats */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-primary-600" />
                Account Statistics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Account Status</span>
                  <span className="flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Active
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Member Since</span>
                  <span className="text-gray-900">
                    {formatMemberSince(user?.created_at)}
                  </span>
                </div>
                <div className="pt-4 border-t">
                  <div className="text-sm text-gray-500">
                    Need help? Contact our support team for assistance with your account.
                  </div>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Security Notice
              </h3>
              <p className="text-blue-700 text-sm">
                Your account is protected with secure authentication. 
                Always keep your login credentials safe and never share them with others.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;