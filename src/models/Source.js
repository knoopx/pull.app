import sha1 from 'sha1'
import { autorun } from 'mobx'
import { now } from 'mobx-utils'
import { flatMap, orderBy } from 'lodash'
import { types as t, flow, clone, getParent } from 'mobx-state-tree'
import scrape from '../support/scrape'

import Field from './Field'

const Response = t
  .model('Response', {
    body: t.string,
    createdAt: t.optional(t.Date, () => Date.now()),
  })
  .views(self => ({
    get source() {
      return getParent(self, 2)
    },
    get doc() {
      const parser = new DOMParser()
      return parser.parseFromString(self.body, self.source.format)
    },
    get items() {
      return scrape(
        [self.source.selector],
        self.source.fields.reduce(
          (result, field) => ({
            ...result,
            [field.name]: field.selector,
          }),
          {},
        ),
      )(self.doc)
    },
  }))

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
    lastUpdateAt: t.maybe(t.Date),
    lastClearedAt: t.maybe(t.Date),
    position: t.number,
    format: t.optional(t.enumeration(['text/html', 'text/xml']), 'text/html'),
    filter: t.optional(t.string, ''),
    responses: t.optional(t.array(Response), []),
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

    get items() {
      return flatMap(self.responses, response =>
        response.items.map(item => ({
          data: item,
          isNew: response.createdAt > self.lastClearedAt,
        })))
    },

    get filteredItems() {
      const regex = new RegExp(self.filter, 'i')
      return self.items.filter((item) => {
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
      return self.items.filter(item => item.isNew).length
    },
  }))
  .actions(self => ({
    afterCreate() {
      disposables.push(autorun(() => {
        if (!self.isLoading) {
          if (now() - self.lastUpdateAt > 300000) {
            self.fetchItems()
          }
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
    fetchItems: flow(function* () {
      self.isLoading = true
      self.error = null

      try {
        // const doc = yield fetch(self.href, self.format)
        const response = yield fetch(self.href)
        const body = yield response.text()
        self.responses.push({ body })
      } catch (err) {
        console.log(err)
        self.error = err
      } finally {
        self.lastUpdateAt = Date.now()
        self.isLoading = false
      }
    }),
  }))
