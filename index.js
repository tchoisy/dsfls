//handle setupevents as quickly as possible
const setupEvents = require('./installer/setupEvents')
if (setupEvents.handleSquirrelEvent()) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    return;
}

const electron = require('electron')
const url = require('url')
const path = require('path')
const Server = require('./server')
const Socket = require('./socket')
const MenuApp = require('./src/config/menu')
const TwitterServer = require('./web/twitter/node/twitterServer')
const YoutubeServer = require('./web/youtube/node/youtubeServer')
const ifs = require('os').networkInterfaces();
const IP_ADDR = Object.keys(ifs)
  .map(x => ifs[x].filter(x => x.family === 'IPv4' && !x.internal)[0])
  .filter(x => x)[0].address;

const interfacePort = 12345
global.sharedObj = {
    IP_ADDR: IP_ADDR,
    PORT: interfacePort
};

const {app, BrowserWindow, Menu, ipcMain} = electron

ipcMain.on('open-settings', (event, arg)=> {
    settingsWindow.show()
})

let mainWindow
let settingsWindow
const socketPort = "7777"
let twitterServer
let youtubeServer
ipcMain.on('start-youtube', (event, arg)=> {
    console.log('youtube server')
    youtubeServer = new YoutubeServer({
        host: IP_ADDR,
        port: socketPort
    })
})
ipcMain.on('start-twitter', (event, arg)=> {
    console.log('twitter server')
    twitterServer = new TwitterServer({
        host: IP_ADDR,
        port: socketPort
    })
})
app.on('ready', () =>{
    const server = new Server({
        port: interfacePort,
        socketHost: IP_ADDR,
        socketPort: socketPort
    })
    server.run()

    const socket = new Socket({
        port: socketPort
    })
    socket.run()

    mainWindow = new BrowserWindow({ 
        width: 500, 
        height: 300, 
        frame: false, 
        titleBarStyle: 'hidden', 
        transparent: true 
    })

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'src/view/main.html'),
        protocol: 'file',
        slashes: true
    }))

    settingsWindow = new BrowserWindow({ 
        width: 1000, 
        height: 500, 
        show: false,
        frame: false
    })

    settingsWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'src/view/settings.html'),
        protocol: 'file',
        slashes: true
    }))

    Menu.setApplicationMenu(Menu.buildFromTemplate(MenuApp.get(app)));
})

app.on("window-all-closed", function(){
    app.quit();
});

