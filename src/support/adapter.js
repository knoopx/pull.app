function isTag(elem) {
  return elem.nodeType === 1
}
function getChildren(elem) {
  return Array.prototype.slice.call(elem.childNodes, 0)
}
function getParent(elem) {
  return elem.parentElement
}
function removeSubsets(nodes) {
  let idx = nodes.length,
    node,
    ancestor,
    replace

  // Check if each node (or one of its ancestors) is already contained in the
  // array.
  while (--idx > -1) {
    node = ancestor = nodes[idx]

    // Temporarily remove the node under consideration
    nodes[idx] = null
    replace = true

    while (ancestor) {
      if (nodes.indexOf(ancestor) > -1) {
        replace = false
        nodes.splice(idx, 1)
        break
      }
      ancestor = getParent(ancestor)
    }

    // If the node has been found to be unique, re-insert it.
    if (replace) {
      nodes[idx] = node
    }
  }

  return nodes
}

const adapter = {
  isTag,
  existsOne(test, elems) {
    return elems.some(elem =>
      (isTag(elem)
        ? test(elem) || adapter.existsOne(test, getChildren(elem))
        : false))
  },
  getSiblings(elem) {
    const parent = getParent(elem)
    return parent && getChildren(parent)
  },
  getChildren,
  getParent,
  getAttributeValue(elem, name) {
    if (elem.attributes && elem.attributes[name]) {
      return elem.attributes[name].value
    }
  },
  hasAttrib(elem, name) {
    return name in elem.attributes
  },
  removeSubsets,
  getName(elem) {
    return elem.tagName.toLowerCase()
  },
  findOne: function findOne(test, arr) {
    let elem = null

    for (let i = 0, l = arr.length; i < l && !elem; i++) {
      if (test(arr[i])) {
        elem = arr[i]
      } else {
        const childs = getChildren(arr[i])
        if (childs && childs.length > 0) {
          elem = findOne(test, childs)
        }
      }
    }

    return elem
  },
  findAll: function findAll(test, elems) {
    let result = []
    for (let i = 0, j = elems.length; i < j; i++) {
      if (!isTag(elems[i])) continue
      if (test(elems[i])) result.push(elems[i])
      const childs = getChildren(elems[i])
      if (childs) result = result.concat(findAll(test, childs))
    }
    return result
  },
  getText: function getText(elem) {
    if (Array.isArray(elem)) return elem.map(getText).join('')

    if (isTag(elem)) return getText(getChildren(elem))

    if (elem.nodeType === 3) return elem.nodeValue

    return ''
  },
}

export default adapter
