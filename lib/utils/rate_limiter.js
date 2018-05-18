const ExpressBrute = require('express-brute');
const RedisStore = require('express-brute-redis');

/**
 * 
 * @param {Object} config the configuration object for the limiter
 * format of config:
 * {
 *      env: 'development' || 'production',
 *      host: eg '127.0.0.1',
 *      port: 6379,
 *      retries: 10,
 *      minWait: 9000,
 *      maxWait: 20000,
 *      lifetime: 24*60*60
 * }
 * 
 * @returns a rate limiter object
 */
module.exports = ({host, port, env = 'development', retries, minWait, maxWait, lifetime}) => {
    
    let store; // The memory store to use
    if (env === 'development') {
        store = new ExpressBrute.MemoryStore();
    } else {
        if (! host || ! port) throw new Error("Host and Port must be set");
        store = new RedisStore({
            host, port
        });
    }

    return new ExpressBrute(store, {
        freeRetries: retries || 1000, // number of requests before delay starts applying
        attachResetToRequest: true,
        refreshTimeoutOnRequest: false,
        minWait: minWait || (2 * 1000), // milliseconds
        maxWait: maxWait || (10 * 1000), // milliseconds
        lifetime: lifetime || (24 * 60 * 60) // (seconds not milliseconds)
    });
};