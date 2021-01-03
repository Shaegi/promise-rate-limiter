# Promise-Rate-Limiter

Limit function calls in given limits.

* Supports multiple limits
* Accepts every promise-returning function
* Works with multiple promises simultaneously due to internal queue

## Usage

```javascript
    // node-fetch is not a dependency but highly recommended using, but every function thats returning a promise is supported
    const fetch = require('node-fetch')
    const RateLimiterClass = require('promise-rate-limiter')
    // 3 every 5 seconds but not more than 10 in 10 seconds
    const RateLimiter = new RateLimiterClass([{ limit: 3, duration: 5000 }, { limit: 10, duration: 10000 }], fetch)
    (async () => {
        for(let i = 0; i < 20; i++) {
            await RateLimiter.call(`https://jsonplaceholder.typicode.com/posts/1`)
        }
    })()
```