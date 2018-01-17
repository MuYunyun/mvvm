/**
 * 通过 observe 监听数据变化，当数据变化时候，告知 Dep，调用 update 更新数据。
 */
function Dep() {
  this.subs = []
}

Dep.prototype = {
  addSub: function(sub) {
    this.subs.push(sub)
  },
  notify: function() {
    this.subs.forEach(function(sub) {
      sub.update()
    })
  }
}

// let data = {
//   number: 0
// }

// observe(data)

// data.number = 1 // 值发生变化

function observe(data) {
  if (!data || typeof(data) !== 'object') {
    return
  }
  const self = this
  Object.keys(data).forEach(key =>
    self.defineReactive(data, key, data[key])
  )
}

function defineReactive(data, key, value) {
  var dep = new Dep()
  observe(value) // 遍历嵌套对象
  Object.defineProperty(data, key, {
    get: function() {
      if (Dep.target) { // 往订阅器添加订阅者
        dep.addSub(Dep.target)
      }
      return value
    },
    set: function(newValue) {
      if (value !== newValue) {
        console.log('值发生变化', 'newValue:' + newValue + ' ' + 'oldValue:' + value)
        value = newValue
        dep.notify()
      }
    }
  })
}
