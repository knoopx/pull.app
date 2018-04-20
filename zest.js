import { parser } from 'bo-selector'

const html = `
  <body>
  <div class="section">
    <h1>Section 1</h1>
    <div class="item">A</div>
    <div class="item">B</div>
  </div>
  <div class="section">
    <h1>Section 2</h1>
    <div class="item">C</div>
    <div class="item">D</div>
  </div>
  </body>
`

const doc = new DOMParser().parseFromString(html, 'text/html') // ? $

class Engine {
  eval(node, context) {
    console.log(node.type)
    return this[node.type].call(this, node, context)
  }

  selector_list(node, context) {
    console.log(node.type)
    // console.log(node.selectors.map(this.selector, this))
    return node.selectors.map(this.selector, this)
  }
  selector(node, context) {
    console.log(node.type)
    return this[node.type].call(this, node, context)
  }
  constraint_list(node, context) {
    console.log(node)
    return node.constraints.map(this.constraint, this)
  }
  constraint(node, context) {
    console.log(node.type)
    return this[node.type].call(this, node, context)
  }
  pseudo_func(node, context) {
    return this[node.func.name].call(node, context)
  }
  closest(node, context) {
    return node
  }
  combinator_selector(node, context) {
    console.log(node.type)
    return node
  }
}

new Engine().eval(parser.parse(':closest(.a)', doc)) // ?
