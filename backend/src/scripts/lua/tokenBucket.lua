
-- KEYS[1]  = redis key          
-- ARGV[1]  = capacity      
-- ARGV[2]  = refill_rate        
-- ARGV[3]  = requested         
-- ARGV[4]  = now_ms    
-- Returns: { allowed(1/0), remaining, retry_after_ms }

local key         = KEYS[1]
local capacity    = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])
local requested   = tonumber(ARGV[3])
local now_ms      = tonumber(ARGV[4])

if capacity <= 0 then
    return redis.error_reply('capacity must be > 0')
end

if refill_rate <= 0 then
    return redis.error_reply('refill_rate must be > 0')
end

if requested <= 0 then
    return redis.error_reply('requested must be > 0')
end

local stored      = redis.call('HMGET', key, 'tokens', 'last_refill_ms')
local tokens      = tonumber(stored[1])
local last_ms     = tonumber(stored[2])


if not tokens then
    tokens  = capacity
    last_ms = now_ms
end

local elapsed = (now_ms - last_ms) / 1000
tokens = math.min(capacity, tokens + elapsed * refill_rate)
last_ms = now_ms

local allowed = 0
local remaining = 0
local retry_after_ms = 0

if tokens >= requested then
    allowed = 1
    tokens = tokens - requested
    remaining = math.floor(tokens)
else
    allowed = 0
    remaining = 0
    retry_after_ms = math.ceil((requested - tokens) / refill_rate * 1000)
end

redis.call('HMSET', key, 'tokens', tokens, 'last_refill_ms', last_ms)

local ttl = math.ceil((capacity / refill_rate) * 1000)

redis.call('PEXPIRE', key, ttl)

return { allowed, remaining, retry_after_ms }