import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navigation
      'nav.home': 'Home',
      'nav.diagnosis': 'Diagnosis',
      'nav.history': 'History',
      'nav.profile': 'Profile',
      'nav.logout': 'Logout',
      
      // Auth
      'auth.login': 'Login',
      'auth.register': 'Register',
      'auth.email': 'Email',
      'auth.password': 'Password',
      'auth.name': 'Full Name',
      'auth.workshop': 'Workshop Name',
      'auth.phone': 'Phone Number',
      'auth.login.button': 'Sign In',
      'auth.register.button': 'Create Account',
      
      // Home
      'home.title': 'BengkelBot Pro',
      'home.subtitle': 'Advanced Motorcycle Diagnosis System',
      'home.description': 'Get professional motorcycle diagnosis with AI-powered recommendations and global spare parts pricing.',
      'home.start': 'Start Diagnosis',
      'home.features.title': 'Why Choose BengkelBot Pro?',
      'home.features.ai': 'AI-Powered Diagnosis',
      'home.features.global': 'Global Spare Parts Pricing',
      'home.features.multilingual': 'Multi-Language Support',
      'home.features.history': 'Diagnosis History',
      
      // Diagnosis
      'diagnosis.title': 'Motorcycle Diagnosis',
      'diagnosis.select': 'Select the symptoms your motorcycle is experiencing',
      'diagnosis.language': 'Language',
      'diagnosis.model': 'Motorcycle Model (Optional)',
      'diagnosis.year': 'Year (Optional)',
      'diagnosis.analyze': 'Analyze Symptoms',
      'diagnosis.results': 'Diagnosis Results',
      'diagnosis.confidence': 'Confidence Score',
      'diagnosis.estimated_cost': 'Estimated Cost',
      'diagnosis.recommendations': 'Recommendations',
      'diagnosis.spare_parts': 'Required Spare Parts',
      
      // History
      'history.title': 'Diagnosis History',
      'history.empty': 'No diagnosis history found',
      'history.date': 'Date',
      'history.symptoms': 'Symptoms',
      'history.cost': 'Estimated Cost',
      
      // Profile
      'profile.title': 'Profile Settings',
      'profile.update': 'Update Profile',
      'profile.save': 'Save Changes',
      
      // Common
      'common.loading': 'Loading...',
      'common.error': 'An error occurred',
      'common.success': 'Success',
      'common.cancel': 'Cancel',
      'common.save': 'Save',
      'common.close': 'Close',
    }
  },
  id: {
    translation: {
      // Navigation
      'nav.home': 'Beranda',
      'nav.diagnosis': 'Diagnosis',
      'nav.history': 'Riwayat',
      'nav.profile': 'Profil',
      'nav.logout': 'Keluar',
      
      // Auth
      'auth.login': 'Masuk',
      'auth.register': 'Daftar',
      'auth.email': 'Email',
      'auth.password': 'Kata Sandi',
      'auth.name': 'Nama Lengkap',
      'auth.workshop': 'Nama Bengkel',
      'auth.phone': 'Nomor Telepon',
      'auth.login.button': 'Masuk',
      'auth.register.button': 'Buat Akun',
      
      // Home
      'home.title': 'BengkelBot Pro',
      'home.subtitle': 'Sistem Diagnosis Motor Canggih',
      'home.description': 'Dapatkan diagnosis motor profesional dengan rekomendasi bertenaga AI dan harga suku cadang global.',
      'home.start': 'Mulai Diagnosis',
      'home.features.title': 'Mengapa Memilih BengkelBot Pro?',
      'home.features.ai': 'Diagnosis Bertenaga AI',
      'home.features.global': 'Harga Suku Cadang Global',
      'home.features.multilingual': 'Dukungan Multi-Bahasa',
      'home.features.history': 'Riwayat Diagnosis',
      
      // Diagnosis
      'diagnosis.title': 'Diagnosis Motor',
      'diagnosis.select': 'Pilih gejala yang dialami motor Anda',
      'diagnosis.language': 'Bahasa',
      'diagnosis.model': 'Model Motor (Opsional)',
      'diagnosis.year': 'Tahun (Opsional)',
      'diagnosis.analyze': 'Analisis Gejala',
      'diagnosis.results': 'Hasil Diagnosis',
      'diagnosis.confidence': 'Skor Kepercayaan',
      'diagnosis.estimated_cost': 'Estimasi Biaya',
      'diagnosis.recommendations': 'Rekomendasi',
      'diagnosis.spare_parts': 'Suku Cadang yang Diperlukan',
      
      // History
      'history.title': 'Riwayat Diagnosis',
      'history.empty': 'Tidak ada riwayat diagnosis',
      'history.date': 'Tanggal',
      'history.symptoms': 'Gejala',
      'history.cost': 'Estimasi Biaya',
      
      // Profile
      'profile.title': 'Pengaturan Profil',
      'profile.update': 'Perbarui Profil',
      'profile.save': 'Simpan Perubahan',
      
      // Common
      'common.loading': 'Memuat...',
      'common.error': 'Terjadi kesalahan',
      'common.success': 'Berhasil',
      'common.cancel': 'Batal',
      'common.save': 'Simpan',
      'common.close': 'Tutup',
    }
  },
  es: {
    translation: {
      // Navigation
      'nav.home': 'Inicio',
      'nav.diagnosis': 'Diagnóstico',
      'nav.history': 'Historial',
      'nav.profile': 'Perfil',
      'nav.logout': 'Cerrar Sesión',
      
      // Auth
      'auth.login': 'Iniciar Sesión',
      'auth.register': 'Registrarse',
      'auth.email': 'Correo Electrónico',
      'auth.password': 'Contraseña',
      'auth.name': 'Nombre Completo',
      'auth.workshop': 'Nombre del Taller',
      'auth.phone': 'Número de Teléfono',
      'auth.login.button': 'Iniciar Sesión',
      'auth.register.button': 'Crear Cuenta',
      
      // Home
      'home.title': 'BengkelBot Pro',
      'home.subtitle': 'Sistema Avanzado de Diagnóstico de Motocicletas',
      'home.description': 'Obtén diagnóstico profesional de motocicletas con recomendaciones impulsadas por IA y precios globales de repuestos.',
      'home.start': 'Iniciar Diagnóstico',
      'home.features.title': '¿Por qué elegir BengkelBot Pro?',
      'home.features.ai': 'Diagnóstico con IA',
      'home.features.global': 'Precios Globales de Repuestos',
      'home.features.multilingual': 'Soporte Multi-idioma',
      'home.features.history': 'Historial de Diagnósticos',
      
      // Diagnosis
      'diagnosis.title': 'Diagnóstico de Motocicleta',
      'diagnosis.select': 'Selecciona los síntomas que experimenta tu motocicleta',
      'diagnosis.language': 'Idioma',
      'diagnosis.model': 'Modelo de Motocicleta (Opcional)',
      'diagnosis.year': 'Año (Opcional)',
      'diagnosis.analyze': 'Analizar Síntomas',
      'diagnosis.results': 'Resultados del Diagnóstico',
      'diagnosis.confidence': 'Puntuación de Confianza',
      'diagnosis.estimated_cost': 'Costo Estimado',
      'diagnosis.recommendations': 'Recomendaciones',
      'diagnosis.spare_parts': 'Repuestos Requeridos',
      
      // History
      'history.title': 'Historial de Diagnósticos',
      'history.empty': 'No se encontró historial de diagnósticos',
      'history.date': 'Fecha',
      'history.symptoms': 'Síntomas',
      'history.cost': 'Costo Estimado',
      
      // Profile
      'profile.title': 'Configuración del Perfil',
      'profile.update': 'Actualizar Perfil',
      'profile.save': 'Guardar Cambios',
      
      // Common
      'common.loading': 'Cargando...',
      'common.error': 'Ocurrió un error',
      'common.success': 'Éxito',
      'common.cancel': 'Cancelar',
      'common.save': 'Guardar',
      'common.close': 'Cerrar',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'id', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;