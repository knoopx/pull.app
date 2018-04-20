import urlJoin from 'url-join'
import numeral from 'numeral'
import moment from 'moment'
import { types as t, getParent } from 'mobx-state-tree'

// XPathResult = {
//   ANY_TYPE: 0,
//   NUMBER_TYPE: 1,
//   STRING_TYPE: 2,
//   BOOLEAN_TYPE: 3,
//   UNORDERED_NODE_ITERATOR_TYPE: 4,
//   ORDERED_NODE_ITERATOR_TYPE: 5,
//   UNORDERED_NODE_SNAPSHOT_TYPE: 6,
//   ORDERED_NODE_SNAPSHOT_TYPE: 7,
//   ANY_UNORDERED_NODE_TYPE: 8,
//   FIRST_ORDERED_NODE_TYPE: 9
// };

function typecast(type, value) {
  switch (type) {
    case 'number':
      return numeral(value).value()
    case 'date':
      return moment(value).valueOf()
    default:
      return value
  }
}

function xpathize(expr) {
  const types = {
    '#': 'id',
    '.': 'class',
  }
  return expr.replace(
    /([_a-zA-Z][_a-zA-Z0-9-]*)?([.#])([_a-zA-Z][_a-zA-Z0-9-]*)/gi,
    (_, tag, type, value) =>
      `${tag || '*'}[contains(concat(' ', normalize-space(./@${
        types[type]
      }), ' '), ' ${value} ')]`,
  )
  // .replace(':first-child', '[first()]')
  // .replace(':last-child', '[last()]')
  // .replace(/:closest\(([^)]+)\)/, '/ancestor-or-self::$1')
}

function absolutize(url, baseUrl) {
  if (
    !url ||
    /^(https?|file|ftps?|mailto|javascript|data:image\/[^;]{2,9};):/i.test(url)
  ) {
    return url
  }

  if (url.match(/^\/\//)) {
    return `http:${url}`
  }

  return urlJoin(baseUrl, url)
}

function _rewrite(baseUrl, attrName) {
  return (el) => {
    if (el.attributes[attrName]) {
      el.attributes[attrName].value = absolutize(
        el.attributes[attrName].value,
        baseUrl,
      )
    }
  }
}

export function rewrite(doc, baseUrl) {
  Array.from(doc.querySelectorAll('img, script,iframe')).forEach(_rewrite(baseUrl, 'src'))
  Array.from(doc.querySelectorAll('a, link')).forEach(_rewrite(baseUrl, 'href'))
  return doc
}

function nodeToValue(node) {
  if (Array.isArray(node)) {
    return nodeToValue(node[0])
  }

  if (node instanceof Element) {
    return node.outerHTML
  }

  if (node instanceof Attr) {
    return node.value
  }

  if (node instanceof Text) {
    return node.nodeValue
  }

  return node
}

export default t
  .model('Response', {
    body: t.string,
    clearedAt: t.maybe(t.Date),
  })
  .views(self => ({
    get source() {
      return getParent(self)
    },
    get doc() {
      const url = new URL(self.source.href)
      const parser = new DOMParser()
      const doc = parser.parseFromString(self.body, self.source.format)
      rewrite(doc, url.origin)
      return doc
    },
    xpath(selector, element, type = XPathResult.ORDERED_NODE_ITERATOR_TYPE) {
      const array = []
      const results = self.doc.evaluate(
        xpathize(selector),
        element,
        null,
        type,
        null,
      )

      switch (results.resultType) {
        case XPathResult.STRING_TYPE:
          return results.stringValue
        case XPathResult.NUMBER_TYPE:
          return results.numberValue
        case XPathResult.ORDERED_NODE_SNAPSHOT_TYPE:
        case XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE:
          for (let i = 0, l = results.snapshotLength; i < l; i++) {
            array.push(results.snapshotItem(i))
          }
          return array
        case XPathResult.ORDERED_NODE_ITERATOR_TYPE:
        case XPathResult.UNORDERED_NODE_ITERATOR_TYPE:
          let node
          while ((node = results.iterateNext())) {
            array.push(node)
          }
          return array
        default:
          throw new Error(results.resultType)
      }
    },
    get items() {
      try {
        return self.xpath(self.source.selector, self.doc).map((node) => {
          const data = self.source.validFields.reduce((res, field) => {
            let value
            try {
              value = typecast(
                field.type,
                nodeToValue(self.xpath(field.selector, node, XPathResult.ANY_TYPE)),
              )
            } catch (err) {
              value = err
            }

            res[field.name] = value
            return res
          }, {})

          return { data, key: data[self.source.keyField] }
        })
      } catch (err) {
        return err
      }
    },
  }))
