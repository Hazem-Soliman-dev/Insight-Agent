"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TIER_PRICES = exports.TIER_LIMITS = void 0;
exports.TIER_LIMITS = {
    FREE: {
        maxProjects: 3,
        maxQueriesPerMonth: 50,
        maxFileSizeMB: 5,
        dataRetentionDays: 30,
    },
    PRO: {
        maxProjects: 20,
        maxQueriesPerMonth: 500,
        maxFileSizeMB: 50,
        dataRetentionDays: 365,
    },
    ENTERPRISE: {
        maxProjects: -1,
        maxQueriesPerMonth: 5000,
        maxFileSizeMB: 100,
        dataRetentionDays: -1,
    },
};
exports.TIER_PRICES = {
    FREE: 0,
    PRO: 29,
    ENTERPRISE: 99,
};
//# sourceMappingURL=subscription.constants.js.map