const path = require('path')
const { URL } = require('url')
const defaultMenu = require('electron-default-menu')
const {
  app, shell, BrowserWindow, Menu,
} = require('electron')

let mainWindow

function startWebpackDevServer(fn) {
  const webpack = require('webpack')
  const WebpackDevServer = require('webpack-dev-server')
  const config = require(path.resolve('./webpack.config.js'))

  config.entry.unshift('webpack/hot/dev-server')
  config.plugins.unshift(new webpack.HotModuleReplacementPlugin())

  const compiler = webpack(config)
  const server = new WebpackDevServer(compiler, { hot: true, inline: true })
  server.listen(0, '127.0.0.1', () => {
    const { port } = server.listeningApp.address()

    config.output.publicPath = `http://localhost:${port}/`

    config.entry.unshift(
      `webpack-dev-server/client?http://localhost:${port}/`,
      'webpack/hot/dev-server',
    )

    fn(port)
  })
}

app.on('ready', () => {
  Menu.setApplicationMenu(Menu.buildFromTemplate(defaultMenu(app, shell)))

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 930,
    minHeight: 400,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      webSecurity: false,
    },
  })

  mainWindow.webContents.on('will-navigate', (event, url) => {
    const { origin: target } = new URL(url)
    const { origin } = new URL(mainWindow.webContents.getURL())
    if (target !== origin) {
      event.preventDefault()
      shell.openExternal(url)
    }
  })

  if (process.env.NODE_ENV === 'development') {
    startWebpackDevServer((port) => {
      console.log(`http://localhost:${port}/?react_perf`)
      mainWindow.loadURL(`http://localhost:${port}/?react_perf`)
      mainWindow.webContents.openDevTools()
    })
  } else {
    mainWindow.loadURL(`file://${__dirname}/dist/index.html`)
  }

  if (process.platform === 'darwin') {
    let forceQuit = false
    app.on('before-quit', () => {
      forceQuit = true
    })

    app.on('activate', () => {
      if (!mainWindow.isVisible()) {
        mainWindow.show()
      }
    })

    mainWindow.on('close', (event) => {
      if (!forceQuit) {
        mainWindow.hide()
        event.preventDefault()
      }
    })
  }
})
