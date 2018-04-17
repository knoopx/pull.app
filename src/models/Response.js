import { types as t, getParent } from 'mobx-state-tree'
import fetch from '../support/fetch'
import scrape from '../support/scrape'
import sha1 from 'sha1'

export default t
  .model('Response', {
    body: t.string,
    clearedAt: t.maybe(t.Date),
  })
  .views(self => ({
    get source() {
      return getParent(self)
    },
    get doc() {},
    get items() {},
  }))

// addItem(doc) {
//   const data = scrape(self.schema)(doc)
//
//   if (data[self.keyField] && data[self.keyField].length) {
//     const key = sha1(data[self.keyField])
//     const html = doc.outerHTML
//     if (self.items.has(key)) {
//       Object.assign(self.items.get(key), {
//         html,
//         updatedAt: Date.now(),
//       })
//     } else {
//       self.items.put({ key, html, createdAt: Date.now() })
//     }
//   }
// },
// self.isLoading = true
// self.error = null
//
// try {
//   const doc = yield fetch(self.href, self.format)
//   const items = doc.querySelectorAll(self.selector)
//   items.forEach(self.addItem)
// } catch (err) {
//   self.error = err
// } finally {
//   self.lastUpdateAt = Date.now()
//   self.isLoading = false
// }
