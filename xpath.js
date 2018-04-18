import { parser } from 'bo-selector'
import XpathBuilder from 'xpath-builder'

const xpathBuilder = XpathBuilder.dsl()

class Expression {
  constructor(data) {
    Object.assign(this, data)
  }

  render(xpath, combinator) {
    return new Renderer().render(this, xpath, combinator)
  }
}

class Renderer {
  render(node, xpath, combinator) {
    const fn = this[node.type] // ?
    if (!fn) {
      throw new Error(`No renderer for '${node.type}'`)
    }
    return fn.call(this, node, xpath, combinator)
  }

  selector_list({ selectors }, xpath, combinator) {
    let i
    let x = this.render(selectors[0], xpath, combinator)
    for (i = 1; i < selectors.length; ++i) {
      x = x.union(this.render(selectors[i], xpath, combinator))
    }
    return x
  }

  constraint_list(node, xpath, combinator) {
    return this.element(node, xpath, combinator)
  }

  element(node, xpath, combinator) {
    return this.applyConstraints(
      node,
      xpath[combinator].call(xpath, node.name || '*'),
    )
  }

  combinator_selector(node, xpath, combinator) {
    const left = this.render(node.left, xpath, combinator)
    return this.render(node.right, left, node.combinator)
  }

  immediate_child({ child }, xpath) {
    return this.render(child, xpath, 'child')
  }

  pseudo_func(node, xpath) {
    const fn = this[node.func.name.replace(/-/g, '_')]
    if (fn) {
      return fn.call(this, node, xpath)
    }
    throw new Error(`Unsupported pseudo function :${node.func.name}()`)
  }

  pseudo_class(node, xpath) {
    const fn = this[node.name.replace(/-/g, '_')]
    if (fn) {
      return fn.call(this, node, xpath)
    }
    throw new Error(`Unsupported pseudo class :${node.name}`)
  }

  has({ func }, xpath) {
    return this.render(func.args, xpathBuilder, 'descendant')
  }

  not({ func }, xpath) {
    const firstChild = func.args.selectors[0]
    const childType = firstChild.type
    if (childType === 'constraint_list') {
      return this.combineConstraints(firstChild, xpath).inverse()
    }
    return this.matchesSelectorList(func.args, xpath).inverse()
  }

  nth_child({ func }, xpath) {
    return xpath.nthChild(Number(func.args))
  }

  first_child(node, xpath) {
    return xpath.firstChild()
  }

  last_child(node, xpath) {
    return xpath.lastChild()
  }

  nth_last_child({ func }, xpath) {
    return xpath.nthLastChild(Number(func.args))
  }

  only_child(node, xpath) {
    return xpath.onlyChild()
  }

  only_of_type(node, xpath) {
    return xpath.onlyOfType()
  }

  nth_of_type({ func }, xpath) {
    const type = func.args.type
    if (type === 'odd') {
      return xpath.nthOfTypeOdd()
    } else if (type === 'even') {
      return xpath.nthOfTypeEven()
    } else if (type === 'an') {
      return xpath.nthOfTypeMod(Number(func.args.a))
    } else if (type === 'n_plus_b') {
      return xpath.nthOfTypeMod(1, Number(func.args.b))
    } else if (type === 'an_plus_b') {
      return xpath.nthOfTypeMod(Number(func.args.a), Number(func.args.b))
    }
    return xpath.nthOfType(Number(func.args))
  }

  nth_last_of_type({ func }, xpath) {
    const type = func.args.type
    if (type === 'odd') {
      return xpath.nthLastOfTypeOdd()
    } else if (type === 'even') {
      return xpath.nthLastOfTypeEven()
    } else if (type === 'an') {
      return xpath.nthLastOfTypeMod(Number(func.args.a))
    } else if (type === 'n_plus_b') {
      return xpath.nthLastOfTypeMod(1, Number(func.args.b))
    } else if (type === 'an_plus_b') {
      return xpath.nthLastOfTypeMod(Number(func.args.a), Number(func.args.b))
    }
    return xpath.nthLastOfType(Number(func.args))
  }

  last_of_type(node, xpath) {
    return xpath.lastOfType()
  }

  empty(node, xpath) {
    return xpath.empty()
  }

  has_attribute({ name }, xpath) {
    return xpathBuilder.attr(name)
  }

  attribute_equals({ name, value }, xpath) {
    return xpathBuilder.attr(name).equals(value)
  }

  attribute_contains({ name, value }, xpath) {
    return xpathBuilder.attr(name).contains(value)
  }

  attribute_contains_word({ name, value }, xpath) {
    return xpath
      .concat(' ', xpathBuilder.attr(name).normalize(), ' ')
      .contains(` ${value} `)
  }

  attribute_contains_prefix({ name, value }) {
    return xpathBuilder
      .attr(name)
      .startsWith(value)
      .or(xpathBuilder.attr(name).startsWith(`${value}-`))
  }

  attribute_starts_with({ name, value }, xpath) {
    return xpathBuilder.attr(name).startsWith(value)
  }

  attribute_ends_with({ name, value }) {
    return xpathBuilder.attr(name).endsWith(value)
  }

  class({ name }) {
    return this.attribute_contains_word(
      {
        name: 'class',
        value: name,
      },
      xpathBuilder,
    )
  }

  id({ name }) {
    return xpathBuilder.attr('id').equals(name)
  }

  previous_sibling(node, xpath, combinator) {
    const left = this.render(node.left, xpath, combinator)
    return this.applyConstraints(
      node.right,
      left.axis('following-sibling', node.right.name),
    )
  }

  adjacent_sibling(node, xpath, combinator) {
    const left = this.render(node.left, xpath, combinator)
    return this.applyConstraints(
      node.right,
      left.axis('following-sibling::*[1]/this', node.right.name),
    )
  }

  first_of_type(node, xpath) {
    return xpath.firstOfType()
  }

  matchesSelectorList({ selectors }, xpath) {
    let condition
    let i
    if (selectors.length > 0) {
      condition = this.matchesSelector(selectors[0], xpathBuilder)
      for (i = 1; i < selectors.length; ++i) {
        condition = condition.or(this.matchesSelector(selectors[i], xpathBuilder))
      }
      return condition
    }
    return xpath
  }

  matchesSelector({ name }, xpath) {
    return xpath.name().equals(name)
  }

  combineConstraints({ constraints }, xpath) {
    let i
    let condition = this.render(constraints[0], xpath)
    for (i = 1; i < constraints.length; ++i) {
      condition = condition.and(this.render(constraints[i], condition))
    }
    return condition
  }

  applyConstraints(node, xpath) {
    if (node.constraints.length > 0) {
      return xpath.where(this.combineConstraints(node, xpath))
    }
    return xpath
  }

  contains(node, xpath) {
    return xpathBuilder.contains(node.func.args.selectors[0].name)
  }
  closest(node, xpath) {
    // return this.applyConstraints(
    //   node.right,
    //   left.axis('following-sibling::*[1]/this', node.right.name),
    // )

    return xpathBuilder.descendant('ancestor-or-self',
      // this.selector_list(node.func.args, xpath, 'descendant'),
    )
  }
}

parser.yy.create = data => new Expression(data)

const parse = selector =>
  parser.parse(selector).render(xpathBuilder, 'descendant')

console.log(parse('a :closest(.asd)').toXPath())
