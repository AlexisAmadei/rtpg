const i18next = require("i18next");
const i18nextMiddleware = require("i18next-http-middleware");

i18next
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    fallbackLng: "en",
    preload: ["en", "fr"],
    resources: {
      en: { translation: {
        HEALTH_OK: "Service healthy",
        NOT_FOUND: "Resource not found",
        BAD_REQUEST: "Bad request",
        FORBIDDEN: "Forbidden",
        UNAUTHORIZED: "Unauthorized",
      }},
      fr: { translation: {
        HEALTH_OK: "Service opérationnel",
        NOT_FOUND: "Ressource introuvable",
        BAD_REQUEST: "Mauvaise requête",
        FORBIDDEN: "Interdit",
        UNAUTHORIZED: "Non authentifié",
      }},
    },
    detection: {
      order: ["header", "querystring", "cookie"],
      caches: false,
    },
  });

const i18n = i18next;
const i18nMiddlewareHandler = i18nextMiddleware.handle(i18next);

module.exports = { i18n, i18nMiddleware: i18nMiddlewareHandler };
