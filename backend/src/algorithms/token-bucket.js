

import { run } from "../scripts/luaLoader.js"; 

async function tokenBucket( 
    redis, 
    redisKey, 
    capacity, 
    refillRate, 
    requestedTokens = 1 
) { 
    if(!redisKey) {
        throw new Error("redisKey is required");
    }
    if ( 
        capacity <= 0 || 
        refillRate <= 0 || 
        requestedTokens <= 0 
    ) { 
        throw new Error( 
            "capacity, refillRate, and requestedTokens must be greater than 0" 
        ); 
    } 

    const nowMs = Date.now(); 
    const luaResult = await run( 
        redis, 
        "tokenBucket", 
        [redisKey], 
        [ 
            String(capacity), 
            String(refillRate), 
            String(requestedTokens), 
            String(nowMs) 
        ] 
    ); 

    return { 
        allowed: luaResult[0] === 1,
        remaining: Number(luaResult[1]),
        resetMs: Number(luaResult[2]),
        retryAfterMs: Number(luaResult[2]),
        algorithm: "token-bucket", 
    }; 

} 

export default tokenBucket;