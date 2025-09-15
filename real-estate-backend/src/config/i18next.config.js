import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import i18nextMiddleware from 'i18next-http-middleware';

i18next
  .use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    // Order of language detection
    detection: {
      order: ['header', 'querystring', 'cookie'],
    },
    // Languages to load on startup
    preload: ['en', 'ne'],
    // Default language if detection fails
    fallbackLng: 'en',
    // Configuration for the file system backend
    backend: {
      loadPath: 'src/locales/{{lng}}/{{ns}}.json',
    },
    // Default namespace for translations
    ns: 'translation',
    defaultNS: 'translation',
  });

export default i18next;