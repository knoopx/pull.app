import React from 'react'
import { inject, observer } from 'mobx-react'
import { getSnapshot } from 'mobx-state-tree'
import Inspector from 'react-inspector'

@inject('store')
@observer
export default class PreviewSourceScreen extends React.Component {
  render() {
    const { store } = this.props
    return (
      <div className="p-4">
        <Inspector data={getSnapshot(store.activeSource)} expandLevel={2} />
      </div>
    )
  }
}
