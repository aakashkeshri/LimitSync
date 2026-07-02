// limitsync->backend->src->algorithms->sliding-window.js

import redisClient from '../config/redis.js';

class SlidingWindow {
    constructor({
        limit,
        windowSizeInSeconds,
        keyPrefix = 'rl:sw'
    }) {
        this.limit = limit;
        this.windowSizeInSeconds = windowSizeInSeconds;
        this.keyPrefix = keyPrefix;
    }

    async consume(identifier) {
        const key = `${this.keyPrefix}:${identifier}`;

        const now = Date.now();
        const windowStart =
            now - (this.windowSizeInSeconds * 1000);

        let timestamps = await redisClient.get(key);

        if (!timestamps) {
            timestamps = [];
        } else {
            timestamps = JSON.parse(timestamps);
        }

        timestamps = timestamps.filter(
            timestamp => timestamp > windowStart
        );

        let allowed = false;
        let retryAfter = 0;

        if (timestamps.length < this.limit) {
            timestamps.push(now);
            allowed = true;
        } else {
            allowed = false;

            const oldestRequest = timestamps[0];

            retryAfter = Math.ceil(
                (oldestRequest +
                    (this.windowSizeInSeconds * 1000) -
                    now) / 1000
            );
        }

        await redisClient.set(
            key,
            JSON.stringify(timestamps)
        );

        return {
            allowed,
            remaining: Math.max(
                0,
                this.limit - timestamps.length
            ),
            retryAfter,
            algorithm: 'sliding-window',
        };
    }

    async getStatus(identifier) {
        const key = `${this.keyPrefix}:${identifier}`;

        let timestamps = await redisClient.get(key);

        if (!timestamps) {
            return {
                currentRequests: 0,
                limit: this.limit,
                windowSizeInSeconds: this.windowSizeInSeconds,
            };
        }

        timestamps = JSON.parse(timestamps);

        const now = Date.now();
        const windowStart =
            now - (this.windowSizeInSeconds * 1000);

        timestamps = timestamps.filter(
            timestamp => timestamp > windowStart
        );

        return {
            currentRequests: timestamps.length,
            limit: this.limit,
            windowSizeInSeconds: this.windowSizeInSeconds,
        };
    }

    async reset(identifier) {
        const key = `${this.keyPrefix}:${identifier}`;

        await redisClient.del(key);
    }
}

export default SlidingWindow;