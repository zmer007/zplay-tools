const ipc = require('electron').ipcRenderer
const $ = require('jquery')

$('#select-file').click((event) => {
    ipc.send('open-file-dialog')
})

ipc.on('selected-file', (event, path) => {
    console.log('selected')
})