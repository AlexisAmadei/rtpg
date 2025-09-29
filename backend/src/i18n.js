const i18next = require("i18next");
const i18nextMiddleware = require("i18next-http-middleware");

i18next
    .use(i18nextMiddleware.LanguageDetector)
    .init({
        fallbackLng: "en",
        preload: ["en", "fr"],
        resources: {
            en: {
                translation: {
                    HEALTH_OK: "Service healthy",

                    // auth
                    EMAIL_PWD_REQUIRED: "Email and password required",
                    USER_EXISTS: "User already exists",
                    USER_CREATED: "User created",
                    INVALID_CREDENTIALS: "Invalid credentials",
                    MISSING_TOKEN: "Missing token",
                    INVALID_OR_EXPIRED: "Invalid or expired token",

                    // matches
                    MATCH_NOT_FOUND: "Match not found",
                    MATCH_FULL: "Match is already full",
                    CANNOT_JOIN_OWN: "You cannot join your own match",
                    MATCH_NOT_IN_PROGRESS: "Match is not in progress",
                    MATCH_FINISHED: "Match already finished",
                    NOT_A_PLAYER: "You are not a player in this match",
                    NOT_YOUR_TURN: "It's not your turn",
                    INVALID_INDEX: "Invalid board index",
                    CELL_TAKEN: "Cell is already taken",

                    // generic
                    NOT_FOUND: "Resource not found",
                    BAD_REQUEST: "Bad request",
                    FORBIDDEN: "Forbidden",
                    UNAUTHORIZED: "Unauthorized",
                }
            },
            fr: {
                translation: {
                    HEALTH_OK: "Service opérationnel",

                    // auth
                    EMAIL_PWD_REQUIRED: "Email et mot de passe requis",
                    USER_EXISTS: "Utilisateur déjà existant",
                    USER_CREATED: "Utilisateur créé",
                    INVALID_CREDENTIALS: "Identifiants invalides",
                    MISSING_TOKEN: "Jeton manquant",
                    INVALID_OR_EXPIRED: "Jeton invalide ou expiré",

                    // matches
                    MATCH_NOT_FOUND: "Partie introuvable",
                    MATCH_FULL: "La partie est déjà complète",
                    CANNOT_JOIN_OWN: "Vous ne pouvez pas rejoindre votre propre partie",
                    MATCH_NOT_IN_PROGRESS: "La partie n'est pas en cours",
                    MATCH_FINISHED: "La partie est déjà terminée",
                    NOT_A_PLAYER: "Vous ne participez pas à cette partie",
                    NOT_YOUR_TURN: "Ce n'est pas votre tour",
                    INVALID_INDEX: "Index de case invalide",
                    CELL_TAKEN: "Case déjà occupée",

                    // generic
                    NOT_FOUND: "Ressource introuvable",
                    BAD_REQUEST: "Mauvaise requête",
                    FORBIDDEN: "Interdit",
                    UNAUTHORIZED: "Non authentifié",
                }
            },
        },
        detection: { order: ["header", "querystring", "cookie"], caches: false },
    });

const i18n = i18next;
const i18nMiddlewareHandler = i18nextMiddleware.handle(i18next);

module.exports = { i18n, i18nMiddleware: i18nMiddlewareHandler };
