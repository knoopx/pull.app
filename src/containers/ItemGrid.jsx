import React from 'react'
import { observer } from 'mobx-react'

import renderField from './renderField'

@observer
export default class ItemGrid extends React.Component {
  render() {
    const { source } = this.props

    return (
      <div className="flex flex-auto flex-wrap p-2">
        {source.sortedItems.map(item => (
          <div key={item.key} className="flex w-1/4">
            <div className="card p-4">
              {source.validFields.map(field => (
                <div
                  key={field.name}
                  className={[
                    'flex flex-wrap items-center mb-2 ',
                    { 'font-bold': item.isNew },
                  ]}
                >
                  {renderField(field, item)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }
}
