import React from 'react'
import { render } from 'react-dom'
import App from './containers/App'
import Store from './stores'
import { Provider } from 'mobx-react'
import { debounce } from 'lodash'
import { onSnapshot } from 'mobx-state-tree'

import { install } from 'wicked-good-xpath'

install(global, true)

const store = Store.create(localStorage.store ? JSON.parse(localStorage.store) : {})

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'),
)

onSnapshot(
  store,
  debounce((snapshot) => {
    localStorage.store = JSON.stringify(snapshot)
  }, 1000),
)
