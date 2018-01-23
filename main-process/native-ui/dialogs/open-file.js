const ipc = require('electron').ipcMain
const dialog = require('electron').dialog
ipc.on('open-file-dialog', (event) => {
    dialog.showOpenDialog({
        properties: ['openFile']
    }, (files) => {
        if (files) event.sender.send('selected-file', files)
    })
})