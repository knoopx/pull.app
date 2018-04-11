import React from 'react'
import { observable } from 'mobx'
import { inject, observer } from 'mobx-react'
import uuid from 'uuid/v4'

import SourceForm from './SourceForm'
import Source from '../models/Source'

@inject('store')
@observer
export default class NewSourceScreen extends React.Component {
  componentWillMount() {
    const { store } = this.props
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
      position: store.sources.size,
    })
    store.addSource(source)
    store.setActiveSource(source)
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

  onCancel(e) {
    const { history } = this.props
    e.preventDefault()
    history.push('/sources/list')
  }

  onSubmit(e) {
    const { store, history } = this.props
    e.preventDefault()
    history.push('/sources/list')
  }
}
