import dotenv from 'dotenv';
dotenv.config({
    path: "./.env"
});

const PLANS = {

    free: {
        name: 'Free',
        price: 0,

        requestsPerMinute: parseInt(process.env.FREE_PLAN_REQUESTS_PER_MINUTE) || 5,
        requestsPerDay: parseInt(process.env.FREE_PLAN_REQUESTS_PER_DAY) || 200,

        burstSize: parseInt(process.env.FREE_PLAN_BURST_SIZE) || 3,
        algorithm: 'sliding-window',
        cooldownPeriod: parseInt(process.env.FREE_PLAN_COOLDOWN_PERIOD) || 60,
        requests: 5,
        windowms: 60_000,

        abuseRules: {
            maxViolations: 3,
            violationWindow: 600,
            cooldownMultiplier: 1,
            blockOnBurstViolations: true,
            blockOnRpmExceed: false,
            escalationEnabled: true,
        },

        maxDevicesPerUser: parseInt(process.env.FREE_PLAN_MAX_DEVICES_PER_USER) || 1,
        maxConcurrentSessionsPerUser: parseInt(process.env.FREE_PLAN_MAX_CONCURRENT_SESSIONS_PER_USER) || 1,
        maxTeamMembers: parseInt(process.env.FREE_PLAN_MAX_TEAM_MEMBERS) || 1,
        
        maxDataRetentionDays: parseInt(process.env.FREE_PLAN_MAX_DATA_RETENTION_DAYS) || 30,
        maxLogRetentionDays: parseInt(process.env.FREE_PLAN_MAX_LOG_RETENTION_DAYS) || 7,

        auditLogs: false,
        geoRestrictions:{
            enabled: false,
            mode: 'allowlist',
            enforceAt: 'subscription'
        },

        priorityLevel: 1,

        features: {
            basicSupport: true,
            apiAccess: true,
            analytics: false,
            customIntegrations: false,
            prioritySupport: false,
        },
    },


    pro:{
        name: 'Pro',
        price: 499,

        requestsPerMinute: parseInt(process.env.PRO_PLAN_REQUESTS_PER_MINUTE) || 100,
        requestsPerDay: parseInt(process.env.PRO_PLAN_REQUESTS_PER_DAY) || 10000,

        burstSize: parseInt(process.env.PRO_PLAN_BURST_SIZE) || 20,
        algorithm: 'token-bucket',
        cooldownPeriod: parseInt(process.env.PRO_PLAN_COOLDOWN_PERIOD) || 30,
        capcity: 20,
        refillRate: 100/60,

        abuseRules: {
            maxViolations: 5,
            violationWindow: 300,
            cooldownMultiplier: 1,
            blockOnBurstViolations: true,
            blockOnRpmExceed: true,
            escalationEnabled: true,
        },

        maxDevicesPerUser: parseInt(process.env.PRO_PLAN_MAX_DEVICES_PER_USER) || 5,
        maxConcurrentSessionsPerUser: parseInt(process.env.PRO_PLAN_MAX_CONCURRENT_SESSIONS_PER_USER) || 10,
        maxTeamMembers: parseInt(process.env.PRO_PLAN_MAX_TEAM_MEMBERS) || 50,

        maxDataRetentionDays: parseInt(process.env.PRO_PLAN_MAX_DATA_RETENTION_DAYS) || 90,
        maxLogRetentionDays: parseInt(process.env.PRO_PLAN_MAX_LOG_RETENTION_DAYS) || 30,

        auditLogs: true,
        geoRestrictions: {
            enabled: true,
            mode: 'advanced',
            enforceAt: 'subscription'
        },

        priorityLevel: 2,

        features: {
            basicSupport: true,
            apiAccess: true,
            analytics: true,
            customIntegrations: false,
            prioritySupport: false,
        },
    },


    enterprise: {
        name: 'Enterprise',
        price: 1999,

        requestsPerMinute: parseInt(process.env.ENTERPRISE_PLAN_REQUESTS_PER_MINUTE) || 1000,
        requestsPerDay: parseInt(process.env.ENTERPRISE_PLAN_REQUESTS_PER_DAY) || -1,

        burstSize: parseInt(process.env.ENTERPRISE_PLAN_BURST_SIZE) || 100,
        algorithm: 'token-bucket',
        cooldownPeriod: parseInt(process.env.ENTERPRISE_PLAN_COOLDOWN_PERIOD) || 10,
        capcity: 100,
        refillRate: 1000/60,

        abuseRules: {
            maxViolations: 10,
            violationWindow: 60,
            cooldownMultiplier: 2,
            blockOnBurstViolations: true,
            blockOnRpmExceed: false,
            escalationEnabled: true,
        },

        maxDevicesPerUser: parseInt(process.env.ENTERPRISE_PLAN_MAX_DEVICES_PER_USER) || 10,
        maxConcurrentSessionsPerUser: parseInt(process.env.ENTERPRISE_PLAN_MAX_CONCURRENT_SESSIONS_PER_USER) || 10,
        maxTeamMembers: parseInt(process.env.ENTERPRISE_PLAN_MAX_TEAM_MEMBERS) || -1,

        maxDataRetentionDays: parseInt(process.env.ENTERPRISE_PLAN_MAX_DATA_RETENTION_DAYS) || 365,
        maxLogRetentionDays: parseInt(process.env.ENTERPRISE_PLAN_MAX_LOG_RETENTION_DAYS) || 90,

        auditLogs: true,
        geoRestrictions: {
            enabled: true,
            mode: 'advanced',
            enforceAt: 'subscription'
        },

        priorityLevel: 3,

        features: {
            basicSupport: true,
            apiAccess: true,
            analytics: true,
            customIntegrations: true,
            prioritySupport: true,
        },
    }
};


function getPlanConfig(planName) {
    const planKey =planName?.toLowerCase();
    return PLANS[planKey] ||PLANS.free;
}

function isUnlimited(value) {
    return value === -1;
}

export {PLANS, getPlanConfig, isUnlimited };