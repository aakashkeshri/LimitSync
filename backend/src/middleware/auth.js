
import jwt from "jsonwebtoken";

const MOCK_USERS = {
    "user1": { id:"user1", name: "User One", plan: "free" },
    "user2": { id:"user2", name: "User Two", plan: "pro" },
    "user3": { id:"user3", name: "User Three", plan: "enterprise" },
}

const MOCK_API_KEYS = {
    "api-key-1": { owner: "user1"},
    "api-key-2": { owner: "user2"},
    "api-key-3": { owner: "user3"},
}


function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")) {
        return next();
    }

    const token = authHeader.slice(7);

    try{
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        const user = MOCK_USERS[payload.userId];
        if(user) {
            req.user = user;
        }
    } 
    catch (error) {
       console.error("JWT Authentication error:", error);
    }

    return next();
}

function authenticateApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'];

    if(!apiKey) {
        return next();
    }

    const record = MOCK_API_KEYS[apiKey];
    if(record) {
        req.apiKey =apiKey;
        req.user = MOCK_USERS[record.owner];
    }
    return next();
}

export { authenticateJWT, authenticateApiKey };