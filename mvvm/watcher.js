// Watcher 订阅者作为 observer 和 compile 之间通信的桥梁，主要做的事情是:
// 1、在自身实例化时往订阅器(dep)里面添加自己
// 2、待 model 变动 dep.notice() 通知时，能调用自身的 update() 方法，并触发 Compile 中绑定的回调
function Watcher(vm, exp, cb) {
  this.cb = cb
  this.vm = vm
  this.exp = exp
  this.value = this.get()
}

Watcher.prototype = {
  update: function() {
    this.run()
  },

  run: function() {
    const value = this.vm.data[this.exp]
    const oldVal = this.value
    if (value !== oldVal) {
      this.value = value
      this.cb.call(this.vm, value)
    }
  },

  get: function() {
    Dep.target = this // 缓存自己
    const value = this.vm.data[this.exp] // 强制执行监听器里的 get 函数
    Dep.target = null // 释放自己
    return value
  }
}