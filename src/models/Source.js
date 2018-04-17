import { autorun, values } from 'mobx'
import { now } from 'mobx-utils'
import { orderBy } from 'lodash'
import { types as t, flow, clone } from 'mobx-state-tree'

import Item from './Item'
import Field from './Field'
import Response from './Response'

const disposables = []

export default t
  .model('Source', {
    key: t.identifier(t.string),
    name: t.string,
    href: t.string,
    selector: t.string,
    fields: t.optional(t.array(Field), []),
    keyField: t.optional(t.string, ''),
    sortField: t.optional(t.string, ''),
    sortDirection: t.maybe(t.enumeration(['asc', 'desc'])),
    viewMode: t.optional(t.enumeration(['grid', 'table']), 'table'),
    items: t.optional(t.map(Item), {}),
    lastUpdateAt: t.maybe(t.Date),
    lastClearedAt: t.maybe(t.Date),
    position: t.number,
    format: t.optional(t.enumeration(['text/html', 'text/xml']), 'text/html'),
    filter: t.optional(t.string, ''),
    response: t.maybe(Response),
  })
  .volatile(self => ({
    error: null,
    isLoading: false,
  }))
  .views(self => ({
    get schema() {
      return self.fields.reduce(
        (res, field) => ({
          ...res,
          [field.name]: field.selector,
        }),
        {},
      )
    },

    get filteredItems() {
      const regex = new RegExp(self.filter, 'i')
      return values(self.items).filter((item) => {
        if (self.filter.length > 0) {
          return Object.values(item.data).some(x => regex.test(x))
        }
        return true
      })
    },

    get sortedItems() {
      if (self.sortField) {
        return orderBy(
          self.filteredItems,
          [`data.${self.sortField}`],
          [self.sortDirection],
        )
      }
      return orderBy(self.filteredItems, 'createdAt', 'desc')
    },

    get newItemsCount() {
      return values(self.items).filter(item => item.isNew).length
    },

    get validFields() {
      return self.fields.filter(f => f.name)
    },
  }))
  .actions(self => ({
    afterCreate() {
      disposables.push(autorun(() => {
        if (/https?:\/\//.test(self.href)) {
          if (!self.isLoading) {
            if (now() - self.lastUpdateAt > 300000) {
              self.fetch()
            }
          }
        }
      }))

      disposables.push(autorun(() => {
        if (self.response && self.mode !== 'edit') {
          self.response.items.forEach(self.addItem)
        }
      }))
    },
    beforeDestroy() {
      disposables.forEach(dispose => dispose())
    },
    update(snapshot) {
      Object.assign(self, snapshot)
    },
    clearItems(shouldRemove = false) {
      self.lastClearedAt = Date.now()
      if (shouldRemove) {
        self.items.clear()
      }
    },
    addField(props) {
      self.fields.push(props)
    },
    removeField(field) {
      self.fields.remove(field)
    },
    swapFields(from, to) {
      const fromField = clone(self.fields[from])
      const toField = clone(self.fields[to])
      self.fields[to] = fromField
      self.fields[from] = toField
    },
    setFilter(value) {
      self.filter = value
    },
    setSortField(name, direction) {
      self.sortField = name
      self.sortDirection = direction
    },
    setViewMode(name) {
      self.viewMode = name
    },
    addItem(item) {
      self.items.put(item)
    },
    fetch: flow(function* () {
      try {
        const res = yield fetch(self.href)
        const body = yield res.text()
        self.response = {
          body,
        }
      } finally {
        self.lastUpdateAt = Date.now()
      }
    }),
  }))
