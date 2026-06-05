// limitsync->backend->src->algorithms->token-bucket.js

import redisClient from '../config/redis.js';

class TokenBucket {
    constructor({
        capacity,
        refillRate,
        keyPrefix = 'rl:tb'
    }) {
        this.capacity = capacity;
        this.refillRate = refillRate;
        this.keyPrefix = keyPrefix;
    }

    async consume(identifier, tokensToConsume = 1) {
        const key = `${this.keyPrefix}:${identifier}`;

        const now = Date.now();

        let bucket = await redisClient.get(key);

        if (!bucket) {
            bucket = {
                tokens: this.capacity,
                lastRefill: now,
            };
        } else {
            bucket = JSON.parse(bucket);
        }

        const elapsedSeconds =
            (now - bucket.lastRefill) / 1000;

        const refillTokens =
            elapsedSeconds * this.refillRate;

        bucket.tokens = Math.min(
            this.capacity,
            bucket.tokens + refillTokens
        );

        bucket.lastRefill = now;

        let allowed = false;
        let retryAfter = 0;

        if (bucket.tokens >= tokensToConsume) {
            bucket.tokens -= tokensToConsume;
            allowed = true;
        } else {
            allowed = false;

            const missingTokens =
                tokensToConsume - bucket.tokens;

            retryAfter = Math.ceil(
                missingTokens / this.refillRate
            );
        }

        await redisClient.set(
            key,
            JSON.stringify(bucket)
        );

        return {
            allowed,
            remaining: Math.floor(bucket.tokens),
            retryAfter,
            algorithm: 'token-bucket',
        };
    }

    async getStatus(identifier) {
        const key = `${this.keyPrefix}:${identifier}`;

        const bucket = await redisClient.get(key);

        if (!bucket) {
            return {
                tokens: this.capacity,
                capacity: this.capacity,
                refillRate: this.refillRate,
            };
        }

        const data = JSON.parse(bucket);

        return {
            tokens: Math.floor(data.tokens),
            capacity: this.capacity,
            refillRate: this.refillRate,
            lastRefill: data.lastRefill,
        };
    }

    async reset(identifier) {
        const key = `${this.keyPrefix}:${identifier}`;

        await redisClient.del(key);
    }
}

export default TokenBucket;