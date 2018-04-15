import React from 'react'
import { render } from 'react-dom'
// import App from './containers/App'
// import Store from './stores'
// import { Provider } from 'mobx-react'
// import { debounce } from 'lodash'
// import { onSnapshot, getSnapshot, applySnapshot } from 'mobx-state-tree'
// import { HashRouter } from 'react-router-dom'
//
// const store = Store.create(localStorage.store ? JSON.parse(localStorage.store) : {})
//
// render(
//   <Provider store={store}>
//     <HashRouter>
//       <App />
//     </HashRouter>
//   </Provider>,
//   document.getElementById('root'),
// )
//
// onSnapshot(
//   store,
//   debounce((snapshot) => {
//     localStorage.store = JSON.stringify(snapshot)
//   }, 1000),
// )
import { observable, computed } from 'mobx'
import { observer } from 'mobx-react'
import Inspector from 'react-inspector'

const alasql = require('alasql')

@observer
class App extends React.Component {
  @observable.ref doc
  @observable
  query = "select nodeName,href,innerText from document where className='storylink' limit 5"

  componentWillMount() {
    this.fetchDocument()
  }

  async fetchDocument() {
    const res = await fetch('https://news.ycombinator.com/news')
    const parser = new DOMParser()
    const doc = parser.parseFromString(await res.text(), 'text/html')
    const db = new alasql.Database()
    // db.exec('create table document')
    // db.tables.document.data = [].slice.call(doc.all)
    this.doc = doc
    this.db = db
    console.log('ready')
  }

  @computed
  get matches() {
    try {
      return this.db.exec(this.query, [[].slice.call(this.doc.all)])
    } catch (err) {
      return err
    }
  }

  render() {
    return (
      <div className="p-8 flex flex-auto flex-col">
        <input
          className="mb-4"
          value={this.query}
          onChange={(e) => {
            this.query = e.target.value
          }}
        />
        {this.matches instanceof Error ? (
          this.matches.message
        ) : (
          <Inspector data={this.matches} expandLevel={5} />
        )}
      </div>
    )
  }
}

render(<App />, document.querySelector('#root'))
