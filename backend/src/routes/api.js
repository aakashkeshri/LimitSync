
import {Router} from 'express';

import {PLANS} from '../config/plans.js';
import createRateLimiter from '../middleware/rateLimiter.js';

import byUser from '../strategies/byUser.js';
import byIp from '../strategies/byIp.js';
import byApiKey from '../strategies/byApiKey.js';

export default function apiRouter(redis){
    const router = Router();
    const limiter = createRateLimiter(redis, PLANS);

    router.get(
        "/ping",
        (_req, res) => {
            res.json({
                status: "ok",
                timestamp: Date.now(),
            });
        }
    );

    router.get(
        "/free",
        limiter({
            strategy: byIp,
        }),
        (req, res) => {
            res.json({
                plan: "free",
                ip: req.ip
            });
        }
    );

    router.get(
        "/pro",
        limiter({
            strategy: byUser,
            plan: "pro",
        }),
        (req, res) => {
            if(!req.user) {
                return res.status(401).json({
                    error: "JWT required",
                });
            }

            res.json({
                plan: "pro",
                userId: req.user.id,
            });
        }
    );

    router.get(
        "/enterprise",
        limiter({
            strategy: byUser,
            plan: "enterprise",
        }),
        (req, res) => {
            if (!req.user) {
                return res.status(401).json({
                    error: "JWT required",
                });
            }

            res.json({
                plan: "enterprise",
                userId: req.user.id,
            });
        }
    );

    router.get(
        "/apikey",
        limiter({
            strategy: byApiKey,
        }),
        (req, res) => {
            if (!req.apiKey) {
                return res.status(401).json({
                    error: "API key required",
                });
            }

            res.json({
                apiKey: req.apiKey,
                owner: req.apiKeyOwner,
                plan: req.apiKeyPlan,
            });
        }
    );

    router.get(
        "/auto",
        limiter({
            strategy: (req, algorithm) =>
                byUser(req, algorithm) ??
                byApiKey(req, algorithm) ??
                byIp(req, algorithm),
        }),
        (req, res) => {
            res.json({
                resolvedAs: req.user
                    ? "user"
                    : req.apiKey
                        ? "apikey"
                        : "ip",
                plan: req.user?.plan ?? req.apiKeyPlan ?? "free",
            });
        }
    );

    return router;
}