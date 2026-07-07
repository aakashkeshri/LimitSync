
import {apiKeyKey} from '../config/keys.js';

function byApiKey(req, algorithm) {
    const apiKey=req.apiKey;    
    if(!apiKey) {
        return null;
    }
    return apiKeyKey(algorithm, apiKey);
}

export default byApiKey;