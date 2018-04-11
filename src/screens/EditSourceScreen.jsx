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
    const { store, match } = this.props
    this.source = store.sources.get(match.params.id)
    this.snapshot = getSnapshot(this.source)
  }
  render() {
    return (
      <SourceForm
        source={this.source}
        onSubmit={this.onSubmit}
        onCancel={this.onCancel}
      />
    )
  }

  onChange(snapshot) {
    this.source.update(snapshot)
  }

  onCancel(e) {
    const { history } = this.props
    e.preventDefault()
    applySnapshot(this.source, this.snapshot)
    history.push('/sources/list')
  }

  onSubmit(e) {
    const { store, history } = this.props
    e.preventDefault()
    // store.addSource({ ...this.source, items: {} })
    history.push('/sources/list')
  }
}
