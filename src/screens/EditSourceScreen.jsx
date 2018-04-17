import React from 'react'
import { observable } from 'mobx'
import { inject, observer } from 'mobx-react'
import { getSnapshot, applySnapshot } from 'mobx-state-tree'

import SourceForm from './SourceForm'

@inject('store')
@observer
export default class EditSourceScreen extends React.Component {
  @observable source

  componentWillMount() {
    const { store } = this.props
    this.snapshot = getSnapshot(store.activeSource)
  }
  render() {
    const { store } = this.props
    return (
      <SourceForm
        source={store.activeSource}
        onSubmit={this.onSubmit}
        onCancel={this.onCancel}
      />
    )
  }

  onChange(snapshot) {
    this.source.update(snapshot)
  }

  onCancel(e) {
    const { store } = this.props
    e.preventDefault()
    applySnapshot(store.activeSource, this.snapshot)
    store.setMode('view')
  }

  onSubmit(e) {
    const { store } = this.props
    e.preventDefault()
    store.setMode('view')
  }
}
