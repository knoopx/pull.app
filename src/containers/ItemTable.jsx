import React from 'react'
import { inject, observer } from 'mobx-react'
import renderField from './renderField'

@inject('store')
@observer
export default class ItemTable extends React.Component {
  render() {
    const { source, items, store } = this.props
    if (items instanceof Error) {
      return (
        <div className="flex flex-auto items-center justify-center">
          <span className="p-1 bg-red-lightest rounded text-xs text-red-light mr-4">
            {items.message}
          </span>
        </div>
      )
    }
    return (
      <table className="w-full bg-white" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {source.validFields.map(field => (
              <th
                key={field.name}
                className={[
                  'px-4 py-2 border-b-2 font-medium text-left pin-t bg-white cursor-pointer',
                  {
                    'font-bold': source.sortField === field.name,
                  },
                ]}
                onClick={(e) => {
                  if (source.sortField === field.name) {
                    if (source.sortDirection === 'asc') {
                      source.setSortField(field.name, 'desc')
                    } else if (source.sortDirection === 'desc') {
                      source.setSortField('', null)
                    }
                  } else {
                    source.setSortField(field.name, 'asc')
                  }
                }}
              >
                {source.sortField === field.name && (
                  <span>
                    {source.sortDirection === 'asc' ? '↓' : '↑'}
                    &nbsp;
                  </span>
                )}
                {field.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.key}>
              {source.validFields.map(field => (
                <React.Fragment key={field.name}>
                  <td className="px-4 py-2 border-b">
                    <div
                      className={[
                        'flex items-center',
                        { 'font-bold': item.isNew },
                      ]}
                    >
                      {renderField(field, item, store.mode)}
                    </div>
                  </td>
                </React.Fragment>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    )
  }
}
