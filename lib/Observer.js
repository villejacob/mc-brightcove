export default class Observer {
  constructor () {
    this.fns = []
  }

  subscribe (fn) {
    this.fns.push(fn)
  }

  unsubscribe (fn) {
    this.fns = this.fns.filter(function (el) {
      if (el !== fn) {
        return el
      }
    })
  }

  fire (o) {
    this.fns.forEach(function (el) {
      el(o)
    })
  }
}
