
-- KEYS[1]  = redis key          
-- ARGV[1]  = limit            
-- ARGV[2]  = window_ms         
-- ARGV[3]  = now_ms             
-- ARGV[4]  = request_id         
-- Returns: { allowed(1/0), remaining, reset_ms }

local key        = KEYS[1]
local limit      = tonumber(ARGV[1])
local window_ms  = tonumber(ARGV[2])
local now_ms     = tonumber(ARGV[3])
local req_id     = ARGV[4]



local window_start = now_ms - window_ms

redis.call('ZREMRANGEBYSCORE', key, '-inf', window_start)

local count = redis.call('ZCARD', key)

local allowed = 0
local remaining = 0

if count < limit then
    redis.call('ZADD', key, now_ms, req_id)
    redis.call('PEXPIRE', key, window_ms)

    allowed = 1
    remaining = limit - count - 1

else
    allowed = 0
    remaining = 0

end

local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
local reset = 0

if oldest[2] then
    reset = tonumber(oldest[2]) + window_ms
else
    reset = now_ms + window_ms
end

return { allowed, remaining, reset }