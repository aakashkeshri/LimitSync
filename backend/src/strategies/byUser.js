
import {userKey} from "../config/keys.js";

function byUser(req, algorithm) {
    const userId=req.user?.id;
    if(!userId) {
        return null;
    }
    return userKey(algorithm, userId);
}

export default byUser;