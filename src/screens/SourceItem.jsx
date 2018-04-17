import React from 'react'
import { inject, observer } from 'mobx-react'
import IconClear from 'react-icons/lib/md/clear-all'
import IconEdit from 'react-icons/lib/md/edit'
import IconError from 'react-icons/lib/md/error'

import { Spinner } from '../components'

@inject('store')
@observer
export default class SourceItem extends React.Component {
  render() {
    const { source, store, ...props } = this.props
    const isActive = store.activeSource === source

    return (
      <div
        className={['border-b cursor-pointer bg-white overflow-hidden flex']}
        style={{ height: 55 }}
        onClick={() => store.setActiveSource(source)}
        {...props}
      >
        <div
          className={[
            'flex flex-auto items-center px-4',
            {
              'border-l-4 border-indigo': isActive,
            },
          ]}
        >
          <div
            className={[
              'flex flex-auto items-center',
              { 'font-semibold': isActive },
            ]}
          >
            <img
              className="mr-2"
              src={`https://plus.google.com/_/favicon?domain=${source.href}`}
            />
            {source.name}
          </div>
          <div className="flex items-center">
            {source.isLoading && <Spinner size="1rem" />}
            {source.error && (
              <span className="text-red" title={source.error.message}>
                <IconError size="1rem" />
              </span>
            )}

            {source.newItemsCount > 0 && (
              <React.Fragment>
                <div
                  className="flex items-center justify-center bg-indigo text-white p-2 text-xs rounded-full ml-4 leading-none"
                  style={{ minWidth: '1.25rem', height: '1.25rem' }}
                >
                  {source.newItemsCount}
                </div>
              </React.Fragment>
            )}
          </div>
        </div>
      </div>
    )
  }
}
