
import { ipKey } from "../config/keys.js";

function byIp(req, algorithm) {
    const ip = 
        req.ip || 
        req.headers["x-forwarded-for"]?.split(",")[0].trim() || 
        req.socket?.remoteAddress || 
        "unknown"
    ;

    return ipKey(algorithm, ip);
}

export default byIp;