import React from 'react'
import RemoveIcon from 'react-icons/lib/md/remove-circle'
import { observer } from 'mobx-react'

import { Input, Select } from '../components'

@observer
export default class Field extends React.Component {
  onChange(e) {
    this.props.field.update({
      [e.target.name]: e.target.value,
    })
  }
  render() {
    const {
      field, onRemove, isDragging, ...props
    } = this.props
    const opacity = isDragging ? 0 : 1

    return (
      <div
        className="bg-indigo-lightest p-2 bg-transparent rounded flex mb-1"
        style={{ opacity }}
        {...props}
      >
        <div>
          <Input
            className="mb-1"
            type="text"
            placeholder="Name"
            name="name"
            value={field.name}
            onChange={this.onChange}
          />
          <Input
            className="font-mono text-xs"
            type="text"
            placeholder="Selector"
            name="selector"
            value={field.selector}
            onChange={this.onChange}
          />

          <Select name="type" value={field.type} onChange={this.onChange}>
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
            <option value="image">Image</option>
            <option value="html">HTML</option>
          </Select>

          {field.type === 'number' && (
            <Input
              className="mb-1"
              type="text"
              placeholder="Format"
              name="format"
              value={field.format}
              onChange={this.onChange}
            />
          )}

          {field.type === 'image' && (
            <Input
              className="mb-1"
              type="text"
              placeholder="Width"
              name="width"
              value={field.width}
              onChange={this.onChange}
            />
          )}

          {field.type === 'image' && (
            <Input
              className="mb-1"
              type="text"
              placeholder="Height"
              name="height"
              value={field.height}
              onChange={this.onChange}
            />
          )}

          {field.type === 'html' && (
            <Input
              className="mb-1"
              type="text"
              placeholder="Allowed Tags"
              name="allowedTags"
              value={field.allowedTags.join(',')}
              onChange={e =>
                this.props.field.update({
                  allowedTags: e.target.value.split(','),
                })
              }
            />
          )}
        </div>
        <div className="ml-2">
          <a
            className="text-indigo"
            onClick={() => {
              onRemove(field)
            }}
          >
            <RemoveIcon size="1rem" />
          </a>
        </div>
      </div>
    )
  }
}
