import { types as t, getParent } from 'mobx-state-tree'
import numeral from 'numeral'
import scrape from '../support/scrape'

const Item = t
  .model('Item', {
    key: t.identifier(t.string),
    html: t.string,
    createdAt: t.maybe(t.Date),
    modifiedAt: t.maybe(t.Date),
  })
  .views(self => ({
    get source() {
      return getParent(self, 2)
    },
    get data() {
      try {
        return self.source.fields.reduce((result, field) => {
          const value = scrape(field.selector)(self.doc)
          switch (field.type) {
            case 'number':
              result[field.name] = numeral(value)
              break
            default:
              result[field.name] = value
          }
          return result
        }, {})
      } catch (err) {
        return {}
      }
    },
    get doc() {
      const parser = new DOMParser()
      return parser.parseFromString(self.html, 'text/html').body
    },
    get isNew() {
      return (
        self.createdAt > self.source.lastClearedAt ||
        self.modifiedAt > self.source.lastClearedAt
      )
    },
  }))

export default Item
