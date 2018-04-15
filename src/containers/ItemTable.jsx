import React from 'react'
import { observer } from 'mobx-react'
import Inspector from 'react-inspector'

import renderField from './renderField'

@observer
export default class ItemTable extends React.Component {
  render() {
    const { source } = this.props

    return (
      <table className="w-full bg-white" style={{ borderCollapse: 'collapse' }}>
        {/* <thead>
          <tr>
            {source.fields.map(field => (
              <th
                key={field.name}
                className={[
                  'px-4 py-2 border-b-2 font-medium text-left sticky pin-t bg-white cursor-pointer',
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
        </thead> */}
        <tbody>
          {source.sortedItems.map(item => (
            <tr key={item.key}>
              {Object.keys(item.data).map(key => (
                <React.Fragment key={key}>
                  <td className="px-4 py-2 border-b">
                    <div
                      className={[
                        'flex items-center',
                        { 'font-bold': item.isNew },
                      ]}
                    >
                      {/* <Inspector data={item.data[key]} /> */}
                      {/* {renderField(key, item.data[key])} */}
                      {item.data[key]}
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
