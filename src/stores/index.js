import uuid from 'uuid/v4'
import { values, autorun } from 'mobx'
import { orderBy } from 'lodash'
import { types as t, getSnapshot } from 'mobx-state-tree'
import { remote } from 'electron'

import Source from '../models/Source'

const disposables = []
export default t
  .model('Store', {
    mode: t.optional(t.enumeration(['view', 'edit']), 'view'),
    activeSource: t.maybe(t.reference(Source)),
    sources: t.optional(t.map(Source), {}),
  })
  .views(self => ({
    get sortedSources() {
      return orderBy(values(self.sources), 'position')
    },
    get notificationCount() {
      return self.sortedSources.reduce(
        (count, source) => count + source.newItemsCount,
        0,
      )
    },
  }))
  .actions(self => ({
    afterCreate() {
      disposables.push(autorun(() => {
        remote.app.setBadgeCount(self.notificationCount)
      }))
    },
    afterDestroy() {
      disposables.forEach(dispose => dispose())
    },
    setMode(value) {
      self.mode = value
    },
    setActiveSource(source) {
      self.activeSource = source
    },
    newSource() {
      const source = Source.create({
        key: uuid(),
        name: '',
        href: '',
        selector: '',
        fields: [
          {
            name: '',
            selector: '',
            type: 'text',
          },
        ],
        position: self.sources.size,
      })
      self.addSource(source)
      return source
    },
    addSource(source) {
      self.sources.put(source)
    },
    removeSource(source) {
      self.sources.delete(source.key)
    },
    swapSources(from, to) {
      const fromSource = self.sortedSources[from]
      const toSource = self.sortedSources[to]
      const fromPosition = fromSource.position || from
      fromSource.position = toSource.position || to
      toSource.position = fromPosition
    },
    fetchSources() {
      self.sortedSources.forEach((source) => {
        source.fetch()
      })
    },
    exportSources() {
      return self.sortedSources.map((source) => {
        const {
          isLoading,
          items,
          lastUpdateAt,
          lastClearedAt,
          ...snapshot
        } = getSnapshot(source)
        return snapshot
      })
    },
    importSources(sources) {
      sources.forEach((source) => {
        self.sources.put(source)
      })
    },
  }))
