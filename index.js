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
const ifs = require('os').networkInterfaces();
const IP_ADDR = Object.keys(ifs)
  .map(x => ifs[x].filter(x => x.family === 'IPv4' && !x.internal)[0])
  .filter(x => x)[0].address;

const interfacePort = 12345
global.sharedObj = {
    IP_ADDR: IP_ADDR,
    PORT: interfacePort
};

const {app, BrowserWindow, Menu} = electron

let mainWindow
const socketPort = "7777"
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

    Menu.setApplicationMenu(Menu.buildFromTemplate(MenuApp.get(app)));
})

app.on("window-all-closed", function(){
    app.quit();
});

