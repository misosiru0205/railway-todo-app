import React from 'react'
import * as ReactDOM from 'react-dom/client'
import './index.scss'
import { CookiesProvider } from 'react-cookie'
import { Provider } from 'react-redux'
import App from './App'
import reportWebVitals from './reportWebVitals'
import { store } from './store'

const root = document.getElementById('root')
const reactRoot = ReactDOM.createRoot(root)
reactRoot.render(
  <Provider store={store}>
    <CookiesProvider>
      <App />
    </CookiesProvider>
  </Provider>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
