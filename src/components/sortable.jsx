import React from 'react'

export default function sortable(Component) {
  let draggingIndex = null

  return class extends React.Component {
    onDragStart(e) {
      const { dataTransfer, currentTarget } = e
      draggingIndex = currentTarget.dataset.index
      if (dataTransfer !== undefined) {
        dataTransfer.effectAllowed = 'move'
        dataTransfer.setData('text/html', currentTarget)
      }
    }

    onDragOver(e) {
      e.preventDefault()
      const { currentTarget } = e
      const { onSwap } = this.props
      const indexDragged = Number(currentTarget.dataset.index)
      const indexFrom = Number(draggingIndex)

      if (indexDragged !== indexFrom) {
        onSwap(indexFrom, indexDragged)
        draggingIndex = indexDragged
      }
    }

    onDragEnd(e) {
      e.preventDefault()
      draggingIndex = null
    }

    render() {
      const { index, onSwap, ...props } = this.props
      return (
        <Component
          draggable
          onDragOver={this.onDragOver}
          onDragStart={this.onDragStart}
          onDragEnd={this.onDragEnd}
          data-index={index}
          {...props}
        />
      )
    }
  }
}
