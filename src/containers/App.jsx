import fs from 'fs'
import React from 'react'
import electron from 'electron'
import { hot } from 'react-hot-loader'
import { inject, observer } from 'mobx-react'
import IconAdd from 'react-icons/lib/md/add-circle'
import IconRefresh from 'react-icons/lib/md/refresh'
import IconEdit from 'react-icons/lib/md/edit'
import IconClear from 'react-icons/lib/md/clear-all'
import IconGrid from 'react-icons/lib/md/view-comfortable'
import IconTable from 'react-icons/lib/md/view-list'
import IconImport from 'react-icons/lib/md/file-download'
import IconExport from 'react-icons/lib/md/file-upload'

import SourceList from '../screens/SourceList'
import EditSourceScreen from '../screens/EditSourceScreen'
import ItemTable from './ItemTable'
import ItemGrid from './ItemGrid'

import Inspector from 'react-inspector'

@inject('store')
@observer
class App extends React.Component {
  render() {
    const {
      mode, activeSource, sources, activeScreen,
    } = this.props.store

    return (
      <React.Fragment>
        <div className="w-1/4 flex flex-col">
          <div>
            <h4
              className="bg-indigo-darkest text-white flex items-center justify-end p-4 border-r border-indigo-darker leading-none"
              style={{ WebkitAppRegion: 'drag', height: 54 }}
            >
              <div className="flex items-center">
                <a
                  className="cursor-pointer text-indigo mr-2"
                  onClick={this.onExport}
                >
                  <IconExport size="1rem" />
                </a>

                <a
                  className="cursor-pointer text-indigo mr-2"
                  onClick={this.onImport}
                >
                  <IconImport size="1rem" />
                </a>

                <a
                  className="cursor-pointer text-indigo mr-2"
                  onClick={this.onRefresh}
                >
                  <IconRefresh size="1rem" />
                </a>

                <a
                  className="cursor-pointer text-indigo"
                  onClick={this.onNewSource}
                >
                  <IconAdd size="1rem" />
                </a>
              </div>
            </h4>
          </div>

          <div className="flex flex-col flex-auto overflow-auto border-r">
            {mode === 'edit' ? <EditSourceScreen /> : <SourceList />}
          </div>
        </div>
        <div className="flex w-3/4 flex-col">
          {activeSource ? (
            <React.Fragment>
              <div style={{ WebkitAppRegion: 'drag' }}>
                <h4
                  className="flex bg-indigo-darkest text-white flex items-center justify-between p-4 leading-none"
                  style={{ height: 54 }}
                >
                  <div>
                    <input
                      className="appearance-none bg-transparent text-indigo"
                      style={{ outline: 'none' }}
                      placeholder="Search..."
                      value={activeSource.filter}
                      onChange={(e) => {
                        activeSource.setFilter(e.target.value)
                      }}
                    />
                  </div>
                  <div className="flex-auto text-center">
                    {activeSource.name}
                  </div>
                  <div className="flex items-center">
                    <a
                      className={[
                        'cursor-pointer mx-1 text-white',
                        {
                          'text-indigo': activeSource.viewMode !== 'table',
                        },
                      ]}
                      onClick={() => {
                        activeSource.setViewMode('table')
                      }}
                    >
                      <IconTable size="1rem" />
                    </a>

                    <a
                      className={[
                        'cursor-pointer mx-1 text-white mr-8',
                        {
                          'text-indigo': activeSource.viewMode !== 'grid',
                        },
                      ]}
                      onClick={() => {
                        activeSource.setViewMode('grid')
                      }}
                    >
                      <IconGrid size="1rem" />
                    </a>

                    <a
                      className="cursor-pointer text-indigo mx-1"
                      onClick={() => {
                        this.props.store.setMode('edit')
                      }}
                    >
                      <IconEdit size="1rem" />
                    </a>

                    <a
                      className="cursor-pointer text-indigo mx-1"
                      onClick={() => {
                        activeSource.fetch()
                      }}
                    >
                      <IconRefresh size="1rem" />
                    </a>

                    <a
                      className="cursor-pointer text-indigo mx-1"
                      onClick={(e) => {
                        activeSource.clearItems(e.metaKey || e.ctrlKey)
                      }}
                    >
                      <IconClear size="1rem" />
                    </a>
                  </div>
                </h4>
              </div>
              <div
                key={activeSource.key}
                className="flex flex-auto overflow-auto bg-grey-lightest"
              >
                {activeSource.viewMode === 'grid' ? (
                  <ItemGrid
                    source={activeSource}
                    items={activeSource.sortedItems}
                  />
                ) : (
                  <ItemTable
                    source={activeSource}
                    items={activeSource.sortedItems}
                  />
                )}
              </div>
            </React.Fragment>
          ) : (
            <div className="flex flex-auto flex-col">
              <h4
                className="flex bg-indigo-darkest text-white items-center p-4 leading-none justify-center"
                style={{ height: 54 }}
              >
                Pull.app
              </h4>
              <div className="text-grey flex flex-auto items-center justify-center">
                Nothing to display
              </div>
            </div>
          )}
        </div>
      </React.Fragment>
    )
  }
  onNewSource() {
    const { store } = this.props
    const source = this.props.store.newSource()
    store.setActiveSource(source)
    store.setMode('edit')
  }

  onEditActiveSource(e) {
    const { store } = this.props
    store.activeSource.update({ [e.target.name]: e.target.value })
  }

  onRefresh() {
    const { store } = this.props
    store.fetchSources()
  }

  onImport() {
    const { store } = this.props
    const { dialog } = electron.remote

    dialog.showOpenDialog(
      {
        defaultPath: '~/sources.json',
        filters: [
          {
            name: 'JSON',
            extensions: ['json'],
          },
        ],
      },
      (paths) => {
        paths.forEach((path) => {
          fs.readFile(path, (err, data) => {
            if (err) {
              dialog.showErrorBox('Error', err)
            }
            store.importSources(JSON.parse(data))
          })
        })
      },
    )
  }

  onExport() {
    const { store } = this.props
    const { dialog } = electron.remote

    dialog.showSaveDialog(
      {
        defaultPath: '~/sources.json',
        filters: [
          {
            name: 'JSON',
            extensions: ['json'],
          },
        ],
      },
      (path) => {
        if (path) {
          fs.writeFile(path, JSON.stringify(store.exportSources()), (err) => {
            if (err) {
              dialog.showErrorBox('Error', err)
            }
          })
        }
      },
    )
  }
}

export default hot(module)(App)
