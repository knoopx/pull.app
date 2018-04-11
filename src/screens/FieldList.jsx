import React from 'react'
import { observer } from 'mobx-react'
import { sortable } from '../components'
import Field from './Field'

const SortableField = sortable(Field)

@observer
export default class FieldList extends React.Component {
  onRemoveField(field) {
    this.props.source.removeField(field)
  }

  onSwap(sourceIndex, targetIndex) {
    this.props.source.swapFields(sourceIndex, targetIndex)
  }

  render() {
    const { source } = this.props
    return (
      <div>
        {source.fields.map((field, i) => (
          <SortableField
            key={i}
            field={field}
            onRemove={this.onRemoveField}
            onSwap={this.onSwap}
            index={i}
          />
        ))}
      </div>
    )
  }
}
