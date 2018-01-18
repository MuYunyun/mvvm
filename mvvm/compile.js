function Compile(el, vm) {
  this.vm = vm
  this.el = document.querySelector(el)
  this.fragment = null
  this.init()
}

Compile.prototype = {
  init: function() {
    if (this.el) {
      this.fragment = this.nodeToFragment(this.el)   // 因为遍历解析的过程有多次操作 dom 节点，为提高性能和效率，会先将跟节点 el 转换成文档碎片 fragment 进行解析编译操作，解析完成，再将 fragment 添加回原来的真实 dom 节点中
      this.compileElement(this.fragment)
      this.el.appendChild(this.fragment)
    } else {
      console.log('Dom元素不存在')
    }
  },
  nodeToFragment: function(el) {
    const fragment = document.createDocumentFragment()
    let child = el.firstChild // △ 第一个 firstChild 是 text
    while(child) {
      fragment.appendChild(child)
      child = el.firstChild
    }
    return fragment
  },
  compileElement: function(el) {
    const childNodes = el.childNodes
    const self = this
    Array.prototype.forEach.call(childNodes, function (node) {
      const reg = /\{\{(.*)\}\}/
      const text = node.textContent
      if (self.isElementNode(node)) {
        self.compile(node)
      } else if (self.isTextNode(node) && reg.test(text)) {
        self.compileText(node, reg.exec(text)[1])
      }

      if (node.childNodes && node.childNodes.length) { // 循环遍历子节点
        self.compileElement(node)
      }
    })
  },

  compile: function (node) {
    const nodeAttrs = node.attributes
    const self = this

    Array.prototype.forEach.call(nodeAttrs, function (attr) {
      const attrName = attr.name
      const exp = attr.value
      const dir = attrName.substring(2)
      if (self.isDirective(attrName)) { // 如果指令包含 v-
        if (self.isEventDirective(dir)) { // 如果是事件指令, 包含 on:
          self.compileEvent(node, self.vm, exp, dir)
        } else { // v-model 指令
          self.compileModel(node, self.vm, exp)
        }
      }
    })
  },

  compileText: function (node, exp) { // 将 {{abc}} 替换掉
    const self = this
    const initText = this.vm[exp]
    this.updateText(node, initText) // 初始化
    new Watcher(this.vm, exp, function(value) { // 实例化订阅者
      self.updateText(node, value)
    })
  },

  compileEvent: function (node, vm, exp, dir) {
    const eventType = dir.split(':')[1]
    const cb = vm.methods && vm.methods[exp]

    if (eventType && cb) {
      node.addEventListener(eventType, cb.bind(vm), false)
    }
  },

  compileModel: function (node, vm, exp) {
    let val = vm[exp]
    const self = this
    this.modelUpdater(node, val)
    node.addEventListener('input', function (e) {
      const newValue = e.target.value
      self.vm[exp] = newValue // 实现 view 到 model 的绑定
    })
  },

  updateText: function (node, value) {
    node.textContent = typeof value === 'undefined' ? '' : value
  },

  modelUpdater: function(node, value) {
    node.value = typeof value === 'undefined' ? '' : value
  },

  isEventDirective: function(dir) {
    return dir.indexOf('on:') === 0
  },

  isDirective: function(attr) {
    return attr.indexOf('v-') === 0
  },

  isElementNode: function(node) {
    return node.nodeType === 1
  },

  isTextNode: function(node) {
    return node.nodeType === 3
  }
}