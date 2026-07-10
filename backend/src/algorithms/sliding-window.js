


import crypto from "crypto";

import { run }  from "../scripts/luaLoader.js";

async function slidingWindow(
    redis,
    redisKey,
    limit,
    windowMs
) {
    if (!redisKey) {
        throw new Error("redisKey is required");
    }
    if (limit <= 0 || windowMs <= 0) {
        throw new Error(
            "limit and windowMs must be greater than 0"
        );
    }

    const nowMs = Date.now();

    const requestId =
        `${nowMs}-${crypto.randomUUID()}`;

    const luaResult = await run(
        redis,
        "slidingWindow",
        [redisKey],
        [
            String(limit),
            String(windowMs),
            String(nowMs),
            requestId
        ]
    );

    const resetAt=Number(luaResult[2]);
    return {
        allowed: luaResult[0] === 1,
        remaining: Number(luaResult[1]),
        resetMs: resetAt,
        retryAfterMs: Math.max(0, resetAt - nowMs),
        algorithm: "sliding-window",
    };
}

export default slidingWindow;

