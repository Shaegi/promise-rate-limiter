
class RateLimiter {
    callQueue = []
    currentCalls = {}
    limits = []
    intervals = []
    callback = () => Promise.resolve()
    // duration in MS to be waited before exceeding the call 
    constructor(limits = [], callback) {
        this.limits = limits
        this.callback = callback
        limits.forEach((element, i) => {
            this.intervals[i] = setInterval(async () =>     {
                Object.keys(this.currentCalls).forEach(id => {
                    this.currentCalls[id][i] = 0
                    if(this.callQueue.length > 0 && !this.isAnyLimitReached(id)) {
                        do {
                            const curr = this.callQueue.shift()
                            if(curr) {
                                this.emit(curr.resolve, curr.reject, id, curr.args)
                            }
                        } while(this.callQueue.length > 0 && !this.isAnyLimitReached(id))
                    }
                })
            }, element.duration)
        });
    }
    // wrapper around js fetch api
    call = async (id, ...args) => {
        if(!this.currentCalls[id]){
            this.currentCalls[id] = []
            this.limits.forEach((limit, i) => {
                this.currentCalls[id][i] = 0
            })
        }
        return new Promise (async (resolve, reject) => {
            if(!this.isAnyLimitReached(id)) {
                return this.emit(resolve, reject, id, args)
            } else {
                this.addToQueue(resolve, reject, id, args)
            }
        })
    }
    async emit(resolve, reject, id, args = []) {
        this.currentCalls = Object.keys(this.currentCalls).reduce((acc, curr) => {
            acc[curr] = this.currentCalls[curr].map((c) => c+1)
            return acc
        }, {}) 
        try {
            const res = await this.callback(...args)
            resolve(res)
        } catch(e) {
            reject(e)
        }
    }
    isAnyLimitReached = (id) => {
        return this.limits.some((limiter, i) => this.currentCalls[id][i] + 1 >= limiter.limit)
    }
    addToQueue (resolve, id, reject, args) {
        this.callQueue.push({ resolve, reject, id, args })
    }
}

module.exports = RateLimiter