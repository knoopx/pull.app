import sha1 from 'sha1'
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
      const parser = new DOMParser()
      return parser.parseFromString(self.body, self.source.format)
    },
    xpath(selector, element, type = XPathResult.ORDERED_NODE_ITERATOR_TYPE) {
      const array = []
      const results = self.doc.evaluate(selector, element, null, type, null)

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
              value = self.xpath(field.selector, node, XPathResult.ANY_TYPE)
            } catch (err) {
              value = err
            }

            res[field.name] = value
            return res
          }, {})

          return { data, key: sha1(data[self.source.keyField].toString()) }
        })
      } catch (err) {
        console.error(err)
        return []
      }
    },
  }))
