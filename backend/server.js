
import "dotenv/config";
import express from "express";
import cors from "cors";

import redisClient from "./src/config/redis.js";
import {loadScripts} from "./src/scripts/lualoader.js";
import { authenticateJWT, authenticateApiKey } from "./src/middleware/auth.js";
import apiRouter from "./src/routes/api.js";


const app = express();
const PORT = process.env.PORT || 3000;

app.set("trust proxy", 1); 
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
    res.json({
        status: "ok",
        redis: redisClient.status,
        timestamp: new Date().toISOString(),
    })
});


async function startServer() {
    await loadScripts(redisClient);
    console.log("Lua scripts loaded into Redis");

    app.use(authenticateJWT);
    app.use(authenticateApiKey);
    app.use("/api", apiRouter(redisClient));

    app.use((_req,res)=>{
        res.status(404).json({
            error: "Not Found" 
        });
    })

    app.use((err, _req, res, _next) => {
        console.error("[Server]",err);
        res.status(500).json({
            error: "Internal Server Error"
        });
    });

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });

}

async function shutdownServer(signal) {
    console.log(`\n[Server] ${signal} received`);

    if(redisClient.status === 'ready'){
        await redisClient.quit();
    }
    process.exit(0);
}

process.on('SIGINT', () => shutdownServer("SIGINT"));
process.on('SIGTERM', () => shutdownServer("SIGTERM"));

startServer().catch(err => {
    console.error("[Fatal]",err);
    process.exit(1);
});