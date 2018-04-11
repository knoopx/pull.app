import React from 'react'
import { orderBy } from 'lodash'
import { values } from 'mobx'
import { inject, observer } from 'mobx-react'

import SourceItem from './SourceItem'

import { sortable } from '../components'

const SortableSource = sortable(SourceItem)

export default inject('store')(observer(({ store }) => (
  <div
    className="flex flex-auto flex-col"
    onClick={(e) => {
        if (e.target === e.currentTarget) {
          store.setActiveSource(null)
        }
      }}
  >
    {orderBy(values(store.sources), 'position').map((source, i) => (
      <SortableSource
        key={source.name}
        index={i}
        source={source}
        onSwap={store.swapSources}
      />
      ))}
  </div>
)))
