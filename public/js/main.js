let buffer = require('buffer')
var client = new WebTorrent()

client.on('error', function (err) {
    console.error('ERROR: ' + err.message)
})
// You can pass in a DOM node or a selector string!
DragDrop('.drop-div', function (files, pos, fileList, directories) {
    console.log('Here are the dropped files', files)
    console.log('Dropped at coordinates', pos.x, pos.y)
    console.log('Here is the raw FileList object if you need it:', fileList)
    console.log('Here is the list of directories:', directories)

    client.seed(files, function (torrent) {
        console.log(torrent);
        console.log('Client is seeding ' + torrent.magnetURI)

        let t = ``;

        t += `Client is seeding <strong>${torrent.magnetURI}</strong>`;

        t += `<p>Name: ${torrent.name}</p>`;
        t += `<p>Name: ${torrent.path}</p>`;
        var hexdata = torrent.torrentFile.toString('hex');
        t += `<p>Torrent: ${hexdata}</p>`;
        t += `<p></p>`;

        t += `<h5>Files hash</h5>`;
        for (let h = 0; h < torrent._hashes.length; h++) {
            const hash = torrent._hashes[h];
            t += `<p>${hash}</p>`;
        }

        t += `<h5>Peers</h5>`;
        for (let p = 0; p < torrent._peers.length; p++) {
            const peer = torrent._peers[p];
            t += `<p>Peer: ${peer}</p>`;
        }

        t += `<h5>Trackers</h5>`;
        for (let r = 0; r < torrent.discovery._announce.length; r++) {
            const tracker = torrent.discovery._announce[r];
            t += `<p>${tracker}</p>`;
        }

        $("#seed-result").html(t);
        
    })
})
