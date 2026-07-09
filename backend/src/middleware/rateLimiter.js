
import slidingWindow from '../algorithms/sliding-window.js';
import  tokenBucket from '../algorithms/token-bucket.js';
import {getPlanConfig} from '../config/plans.js';

const algorithms = {
    'sliding-window': slidingWindow,
    'token-bucket':   tokenBucket,
};

function createRateLimiter(redis, plans) {
    if(!redis) {
        throw new Error("Redis client must be provided");
    }
    if(!plans){
        throw new Error("Plans must be provided");
    }
    return function rateLimiter({
        strategy,
        plan: planOverride,
    } = {}) 
    {
        if(typeof strategy !== 'function') {
            throw new Error("Rate limiter strategy must be a function");
        }

        return async function rateLimitMW(req, res, next) {
            try{
                const planName = planOverride ?? req.user?.plan ?? req.apiKeyPlan ?? 'free';
                const plan= getPlanConfig(planName);

                if(!plan) {
                    throw new Error(`Plan not found: ${planName}`);
                }

                const algorithm = algorithms[plan.algorithm];
                if(!algorithm) {
                    throw new Error(`Unsupported rate limiting algorithm: ${plan.algorithm}`);
                }

                const redisKey = strategy(req, plan.algorithm);
                if(!redisKey) {
                    throw new Error("Rate limiter strategy must return a valid key");
                }

                let result;

                switch (plan.algorithm){
                    case 'sliding-window':
                        result = await algorithm(
                            redis,
                            redisKey,
                            plan.requests,
                            plan.windowMs
                        );
                        break;
                    case 'token-bucket':
                        result = await algorithm(
                            redis,
                            redisKey,
                            plan.capacity,
                            plan.refillRate
                        );
                        break;

                    default:
                        throw new Error(`Unsupported rate limiting algorithm: ${plan.algorithm}`);
                }

                const limit = plan.requests ?? plan.capacity;

                res.set({
                    "RateLimit-Limit": String(limit),
                    "RateLimit-Remaining": String(result.remaining),
                    "RateLimit-Reset": String(
                        Math.ceil(result.resetMs / 1000)
                    ),

                    "X-RateLimit-Limit": String(limit),
                    "X-RateLimit-Remaining": String(result.remaining),
                    "X-RateLimit-Reset": String(
                        Math.ceil(result.resetMs / 1000)
                    )
                });

                if(!result.allowed && result.retryAfterMs != null) {
                    res.set(
                        "Retry-After",
                        String(Math.ceil(result.retryAfterMs / 1000))
                    );
                }

                if(!result.allowed) {
                    return res.status(429).json({
                        error: 'Too many requests',
                        message: 'You have exceeded your request limit',
                        retryAfter:
                            result.retryAfterMs != null
                                ? Math.ceil(result.retryAfterMs / 1000)
                                : null,
                    });
                }


                return next();
            }

            catch(err) {
                console.error("[RateLimiter]", err);

                return next();
            }

            
        
        };
    };
    
}


export default createRateLimiter;