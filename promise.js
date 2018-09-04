const resolvePromise = (promise, result, resolve, reject) => {
  if (promise === result) throw new TypeError('The same reference')

  if ((result != null && typeof result === 'function') || typeof result === 'object') {
    if (typeof result.then === 'function') {
      result.then.call(result, (value) => {
        resolvePromise(promise, value, resolve, reject)
        resolve(value)
      }, (reason) => {
        reject(reason)
      })
    } else {
      resolve(result)
    }
  } else {
    resolve(result)
  }
}
class Promise {
  constructor (executor) {
    this.status = 'pending'
    this.value = undefined
    this.reason = undefined
    this.onResolveCallBacks = []
    this.onRejectedCallBacks = []

    const resolve = (value) => {
      if (this.status === 'pending') {
        this.value = value
        this.status = 'resolved'
        this.onResolveCallBacks.forEach(callback => callback(this.value))
      }
    }

    const reject = (reason) => {
      if (this.status === 'pending') {
        this.reason = reason
        this.status = 'rejected'
        this.onRejectedCallBacks.forEach(callback => callback(this.reason))
      }
    }

    try {
      executor(resolve, reject)
    } catch (e) {
      reject(e)
    }
  }

  then (onFulfilled, onRejected) {
    let promise = null

    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : (value) => value
    onRejected = typeof onRejected === 'function' ? onRejected : (err) => { throw err }

    if (this.status === 'pending') {
      return promise = new Promise((resolve, reject) => {
        this.onResolveCallBacks.push(() => {
          try {
            let newValue = onFulfilled(this.value)
  
            resolvePromise(promise, newValue, resolve, reject)
          } catch (err) {
            reject(err)
          }
        })
        this.onRejectedCallBacks.push(() => {
          try {
            let newReason = onRejected(this.reason)
  
            resolvePromise(promise, newReason, resolve, reject)
          } catch (err) {
            reject(err)
          }
        })
      })
    }

    if (this.status === 'resolved') {
      return promise = new Promise((resolve, reject) => {
        try {
          let newValue = onFulfilled(this.value)

          resolvePromise(promise, newValue, resolve, reject)
        } catch (err) {
          reject(err)
        }
      })
    }

    if (this.status === 'rejected') {
      return promise = new Promise((resolve, reject) => {
        try {
          let newReason = onRejected(this.reason)

          resolvePromise(promise, newReason, resolve, reject)
        } catch (err) {
          reject(err)
        }
      })
    }
  }

  catch (onRejected) {
    return this.then(null, onRejected)
  }

  static resolve (result) {
    return new Promise((resolve, reject) => {
      resolve(result)
    })
  }

  static reject (reason) {
    return new Promise((resolve, reject) => {
      reject(reason)
    })
  }

  static all (promises) {
    return new Promise((resolve, reject) => {
      let result = []
      let len = promises.length

      const resolved = index => data => {
        result[index] = data
        len--

        if (len === promises.length) resolve(result)
      }

      const rejected = reason => {
        reject(reason)
      }

      promises.forEach((promise, index) => {
        promise.then(resolved(index), rejected(reason))
      })
    })
  }

  static race (promises) {
    return new Promise((resolve, reject) => {
      promises.forEach(promise => {
        promise.then(resolve, reject)
      })
    })
  }
}

export default Promise
