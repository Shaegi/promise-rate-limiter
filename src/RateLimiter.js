
class RateLimiter {
    callQueue = []
    currentCalls = []
    limits = []
    intervals = []
    callback = () => Promise.resolve()
    // duration in MS to be waited before exceeding the call 
    constructor(limits = [], callback) {
        this.limits = limits
        this.callback = callback
        limits.forEach((element, i) => {
            this.currentCalls[i] = 0
            this.intervals[i] = setInterval(async () => {
                this.currentCalls[i] = 0
                if(this.callQueue.length > 0 && !this.isAnyLimitReached()) {
                    do {
                        const curr = this.callQueue.shift()
                        if(curr) {
                            await this.emit(curr.resolve, curr.reject, curr.args)
                        }
                    } while(this.callQueue.length > 0 && !this.isAnyLimitReached())
                }
            }, element.duration)
        });
    }
    // wrapper around js fetch api
    call = async (...args) => {
        return new Promise (async (resolve, reject) => {
            if(!this.isAnyLimitReached()) {
                return this.emit(resolve, reject, args)
            } else {
                this.addToQueue(resolve, reject, args)
            }
        })
    }
    async emit(resolve, reject, args = []) {
        this.currentCalls = this.currentCalls.map(c => c + 1)
        try {
            const res = await this.callback(...args)
            resolve(res)
        } catch(e) {
            reject(e)
        }
    }
    isAnyLimitReached = () => {
        return this.limits.some((limiter, i) => this.currentCalls[i] >= limiter.limit)
    }
    addToQueue (resolve, reject, args) {
        this.callQueue.push({ resolve, reject, args })
    }
}

module.exports = RateLimiter