var Tracker = require('bittorrent-tracker')
var magnet = require('magnet-uri')

var magnetURI = "magnet:?xt=urn:btih:4a7b842632ca42cdd3c8d54017a8da756839b84d&dn=D0112-Chacha.Choudhary.Sabu.Kaale.Tapu.Mein.pdf&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com"

var parsedTorrent = magnet(magnetURI)
//console.log(parsedTorrent);


var opts = {
  infoHash: parsedTorrent.infoHash,
  announce: parsedTorrent.announce,
  peerId: new Buffer('2d5757303030322d76726379554a35752b7a6248'), // hex string or Buffer
  port: 6881 // torrent client port
}


var client = new Tracker(opts)



// start getting peers from the tracker
client.start()

client.on('update', function (data) {
  console.log('got an announce response from tracker: ' + data.announce)
  console.log('number of seeders in the swarm: ' + data.complete)
  console.log('number of leechers in the swarm: ' + data.incomplete)
})



setInterval(function() {
  console.log('Searching for peers...');
  client.once('peer', function (addr) {
    console.log(`******* Found a peer: ${addr} *******`) // 85.10.239.191:48623
  })
}, 1500);


client.scrape()

client.on('scrape', function (data) {
  console.log(data)
})



