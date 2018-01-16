// 代理方法的目的是为了在实例对象上直接修改或获取相应属性
// var vm = new MVVM({data: {name: 'Mvvm'}}); vm.data.name
// => var vm = new MVVM({data: {name: 'Mvvm'}}); vm.name
function Mvvm (options) {
  this.data = options.data
  this.methods = options.methods

  const self = this
  Object.keys(this.data).forEach(key =>
    self.proxyKeys(key)
  )
  observe(this.data)
  new Compile(options.el, this)
  options.mounted.call(this) // 所有事情处理好后执行 mounted 函数
}

Mvvm.prototype = {
  proxyKeys: function(key) {
    const self = this
    Object.defineProperty(this, key, {
      get: function () { // 这里的 get 和 set 实现了 vm.data.name 和 vm.name 的值同步
        return self.data[key]
      },
      set: function (newValue) {
        self.data[key] = newValue
      }
    })
  }
}