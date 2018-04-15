import React from 'react'
import { render } from 'react-dom'
import App from './containers/App'
import Store from './stores'
import { Provider } from 'mobx-react'
import { debounce } from 'lodash'
import { onSnapshot, getSnapshot, applySnapshot } from 'mobx-state-tree'
import { HashRouter } from 'react-router-dom'

const store = Store.create(localStorage.store ? JSON.parse(localStorage.store) : {})

render(
  <Provider store={store}>
    <HashRouter>
      <App />
    </HashRouter>
  </Provider>,
  document.getElementById('root'),
)

onSnapshot(
  store,
  debounce((snapshot) => {
    localStorage.store = JSON.stringify(snapshot)
  }, 1000),
)
