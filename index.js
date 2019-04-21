const electron = require('electron')
const url = require('url')
const path = require('path')
const Server = require('./server')
const Socket = require('./socket')
const ifs = require('os').networkInterfaces();
const IP_ADDR = Object.keys(ifs)
  .map(x => ifs[x].filter(x => x.family === 'IPv4' && !x.internal)[0])
  .filter(x => x)[0].address;



const {app, BrowserWindow} = electron

let mainWindow
const socketPort = "7777"
app.on('ready', () =>{
    const server = new Server({
        port: 12345,
        socketHost: IP_ADDR,
        socketPort: socketPort
    })
    server.run()

    const socket = new Socket({
        port: socketPort
    })
    socket.run()

    mainWindow = new BrowserWindow({ width: 1366, height: 768 })

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'src/view/main.html'),
        protocol: 'file',
        slashes: true
    }))
})


