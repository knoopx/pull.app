import React from 'react'
import { inject, observer } from 'mobx-react'
import { Input, Select, Link, Button, OutlineButton } from '../components'

import IconAdd from 'react-icons/lib/md/add-circle'
import IconTrash from 'react-icons/lib/md/highlight-remove'

import FieldList from './FieldList'

@inject('store')
@observer
export default class SourceForm extends React.Component {
  onChange(e) {
    this.props.source.update({ [e.target.name]: e.target.value })
  }

  onRemove() {
    const { source, store } = this.props
    store.setActiveSource(null)
    store.removeSource(source)
    store.setMode('view')
  }

  render() {
    const { source, onSubmit, onCancel } = this.props
    return (
      <form className="flex flex-none flex-col p-4" onSubmit={onSubmit}>
        <div className="mb-4">
          <label className="mb-4 flex flex-col">
            <strong className="mb-2">Name</strong>
            <Input
              type="text"
              placeholder="My Website"
              name="name"
              value={source.name}
              onChange={this.onChange}
            />
          </label>

          <label className="mb-4 flex flex-col">
            <strong className="mb-2">Address</strong>
            <Input
              type="text"
              placeholder="http://mywebsite.net"
              name="href"
              value={source.href}
              onChange={this.onChange}
            />
          </label>

          <label className="mb-4 flex flex-col">
            <strong className="mb-2">Format</strong>
            <Select
              name="format"
              value={source.format}
              onChange={this.onChange}
            >
              <option value="text/html">text/html</option>
              <option value="text/xml">text/xml</option>
            </Select>
          </label>

          <label className="mb-4 flex flex-col">
            <strong className="mb-2">Selector</strong>
            <Input
              type="text"
              className="font-mono text-xs"
              placeholder=".item"
              name="selector"
              value={source.selector}
              onChange={this.onChange}
            />
          </label>

          <h4 className="my-2 flex justify-between">
            Fields
            <a
              className="text-indigo"
              onClick={() => {
                source.addField({ name: '', selector: '', type: 'text' })
              }}
            >
              <IconAdd size="1rem" />
            </a>
          </h4>
          <FieldList source={source} />
        </div>

        <label className="mb-4 flex flex-col">
          <strong className="mb-2">Primary Field</strong>
          <Select
            name="keyField"
            value={source.keyField}
            onChange={this.onChange}
          >
            {source.fields.map(field => (
              <option key={field.name} value={field.name}>
                {field.name}
              </option>
            ))}
          </Select>
        </label>

        <label className="mb-4 flex flex-col">
          <strong className="mb-2">Sort Field</strong>
          <Select
            name="sortField"
            value={source.sortField}
            onChange={this.onChange}
          >
            <option>Default</option>
            {source.fields.map(field => (
              <option key={field.name} value={field.name}>
                {field.name}
              </option>
            ))}
          </Select>
        </label>

        <div className="flex justify-between mb-8">
          <Button className="mr-1">Save</Button>
          <OutlineButton className="ml-1" onClick={onCancel}>
            Cancel
          </OutlineButton>
        </div>

        <div className="text-center">
          <Link className="text-red" onClick={this.onRemove}>
            <IconTrash className="mr-2" />
            Remove Source
          </Link>
        </div>
      </form>
    )
  }
}
