import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const shaCache = {};

const scripts = {
    slidingWindow: fs.readFileSync(
        path.join(__dirname, "lua", "slidingWindow.lua"),
        "utf8"
    ),

    tokenBucket: fs.readFileSync(
        path.join(__dirname, "lua", "tokenBucket.lua"),
        "utf8"
    )
};

async function loadScripts(redis) {
    for (const [name, source] of Object.entries(scripts)) {
        shaCache[name] = await redis.script("LOAD", source);

        console.log(
            `[LuaLoader] Loaded ${name}: ${shaCache[name]}`
        );
    }
}

async function run(redis, name, keys = [], args = []) {
    const sha = shaCache[name];

    if (!sha) {
        throw new Error(
            `Lua script "${name}" has not been loaded.`
        );
    }

    try {
        return await redis.evalsha(
            sha,
            keys.length,
            ...keys,
            ...args
        );
    } 
    catch (error) {
        if (error.message.includes("NOSCRIPT")) {
            shaCache[name] = await redis.script(
                "LOAD",
                scripts[name]
            );

            return await redis.evalsha(
                shaCache[name],
                keys.length,
                ...keys,
                ...args
            );
        }

        throw error;
    }
}

export {
    loadScripts,
    run
};