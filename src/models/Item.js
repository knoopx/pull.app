import { types as t, getParent } from 'mobx-state-tree'

const Item = t
  .model('Item', {
    key: t.identifier(t.string),
    data: t.frozen,
    createdAt: t.maybe(t.Date),
    modifiedAt: t.maybe(t.Date),
  })
  .views(self => ({
    get source() {
      return getParent(self, 2)
    },
    get isNew() {
      return (
        self.createdAt > self.source.lastClearedAt ||
        self.modifiedAt > self.source.lastClearedAt
      )
    },
  }))

export default Item
