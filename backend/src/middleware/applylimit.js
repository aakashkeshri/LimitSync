
import createRateLimiter from "./rateLimiter.js";
import createPlanResolver from "./planResolver.js";

function createApplyLimit(redis, plans) {
    if(!redis) {
        throw new Error('Redis client is required');
    }
    if(!plans) {
        throw new Error('Plans are required');
    }

    const resolvePlan = createPlanResolver(plans);
    const rateLimiter = createRateLimiter(redis, plans);

    return function applyLimit(options={}) {
        return [
            resolvePlan,
            rateLimiter(options),
        ];
    };
}

export default createApplyLimit;