window.$ = window.jQuery = require('jquery');    
var bootstrap = require('bootstrap');

let buffer = require('buffer')
var client = new WebTorrent()

client.on('error', function (err) {
    console.error('ERROR: ' + err.message)
})





