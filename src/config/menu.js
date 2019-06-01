module.exports = class MenuApp {
    static get(app){
        return [{
            label: "Edit",
            submenu: [
                { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
                { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
                { label: "Quit", accelerator: "CmdOrCtrl+Q", click: () => { app.quit(); }}
            ]
        }]
    }
}