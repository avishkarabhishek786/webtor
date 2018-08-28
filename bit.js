var Tracker = require('bittorrent-tracker')
var magnet = require('magnet-uri')

var magnetURI = "magnet:?xt=urn:btih:08122dc39c46fab0221aa24e93f2825e3f9efe61&dn=%5BAndreas_M._Antonopoulos%5D_Mastering_Bitcoin_Progr(b-ok.org).pdf&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com"

var parsedTorrent = magnet(magnetURI)
//console.log(parsedTorrent);


var opts = {
  infoHash: parsedTorrent.infoHash,
  announce: parsedTorrent.announce,
  peerId: new Buffer('2d5757303030322d773974324137436b54727a30'), // hex string or Buffer
  port: 6881 // torrent client port
}


var client = new Tracker(opts)

client.scrape()

client.on('scrape', function (data) {
  console.log(data)
})

