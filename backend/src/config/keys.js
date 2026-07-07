
const ALGORITHM_PREFIX = {
    "sliding-window": 'sw',
    "token-bucket": 'tb'
};

const IDENTIFIER = {
    USER: 'user',
    APIKEY: 'apikey',
    IP: 'ip'
};

function getAlgorithmPrefix(algorithm) {
    const prefix = ALGORITHM_PREFIX[algorithm];
    if (!prefix) {
        throw new Error(`Unknown algorithm: ${algorithm}`);
    }
    return prefix;
}

function createKey(algorithm, identifierType, value) {
    const algo = getAlgorithmPrefix(algorithm);
    return `rl:${algo}:${identifierType}:${value}`;
}

function buildKey(algorithm, req) {

    if (req.user?.id) {
        return createKey(algorithm, IDENTIFIER.USER, req.user.id);
    }

    if (req.apiKey) {
        return createKey(algorithm, IDENTIFIER.APIKEY, req.apiKey);
    }

    const ip = req.ip || req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.socket?.remoteAddress || 'unknown';
    return createKey(algorithm, IDENTIFIER.IP, ip);
}

function userKey(algorithm, userId) {
    return createKey(algorithm, IDENTIFIER.USER, userId);
}

function apiKeyKey(algorithm, apiKey) {
    return createKey(algorithm, IDENTIFIER.APIKEY, apiKey);
}

function ipKey(algorithm, ip) {
    return createKey(algorithm, IDENTIFIER.IP, ip);
}

export  { buildKey, userKey, apiKeyKey, ipKey };