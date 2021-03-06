const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check')
const { matchedData } = require('express-validator/filter')
const _ = require('lodash');
const WebtorrentHybrid = require('webtorrent-hybrid')

const client = require('./server.js');
const funcs = require('./public/js/funcs') 

var path = require('path')
var fs = require('fs');

var Tracker = require('bittorrent-tracker')
var magnet = require('magnet-uri')

//const JSON = require('circular-json');

router.get('/', (req, res)=>{
    res.render('index.ejs', {
        data: {},
        errors: {},
        title: 'Welcome!'
    })
})

router.get('/seed', (req, res)=>{
    res.render('seed.ejs', {
        data: {},
        errors: {},
        title: 'Seed!'
    })
})

router.get('/download', (req, res)=>{
    res.render('download.ejs', {
        data: {},
        errors: {},
        title: 'Download!'
    })
})

router.get('/download-magnetic-uri', (req, res)=>{
    res.render('magnetic.ejs', {
        data: {},
        errors: {},
        title: 'Download Magnetic URI!'
    })
})

router.post('/download-magnetic-uri', (req, res)=>{

    let params = _.pick(req.body, ['job', 'torrentId']) 

    if (params.job != 'download-magnetic-uri') {
        return
    }

    var client = new WebtorrentHybrid()

    client.on('error', function (err) {
       console.error('ERROR: ' + err.message)
    })

    var torrentId = params.torrentId

    if (_.trim(torrentId) == '') {
        console.error("Empty torrent id");
        return;
    }

    client.add(torrentId, function (torrent) {

        //torrent.on('wire', (wire)=>{
          //  console.log(wire);
            // console.log(wire._readableState.pipes.remoteAddress);
            // console.log(wire._readableState.pipes.remoteFamily);
            // console.log(wire._readableState.pipes.remotePort);
            // console.log(wire._readableState.pipes.localAddress);
            // console.log(wire._readableState.pipes.localPort);
            
             //console.log(wire._readableState.pipes._pc);


            
            // var id = wire.peerId.toString()
            // var addr = wire.remoteAddress
            // console.log(id);
            // console.log(addr);
        //})
        
        var files = torrent.files
        var length = files.length
        // Stream each file to the disk
        files.forEach(function (file) {
            //console.log(file._torrent.path);
        
            var source = file.createReadStream()
            var destination = fs.createWriteStream(`files/${file.name}`)

            let fullpath = path.resolve(`files/${file.name}`)
            
            source.on('end', function () {
                console.log('file:\t\t', file.name)

                res.json({file:file.name, location:fullpath})

                // close after all files are saved
                if (!--length) process.exit()
            }).pipe(destination) 
            
        })

    })

})

router.get('/send-to-blockchain', (req, res)=>{
    res.render('to_flo', {
        data: {},
        errors: {},
        title: 'Send the torrent to flo'
    })
})

router.post('/send-to-blockchain', [
        check('job')
            .isLength({min:1})
            .withMessage('Invalid job!')
            .trim(),
        check('magtor')
            .isLength({min:1})
            .withMessage('Invalid magnetic uri!')
            .trim()
    ],(req,res)=>{

        const errors = validationResult(req)
        console.log(errors.mapped());
        
        if(!errors.isEmpty()) {
            return res.render('send-to-blockchain', {
                data: req.body,
                errors: errors.mapped(),
                title: 'Please correct your errors'
            })
        }

        let params = _.pick(req.body, ['job', 'magtor'])

        if (typeof params.job == undefined || params.job!='magtor') {
            console.log("Unknown request");
            return;
        }

        let magnetic_uri = params.magtor

        if (magnetic_uri.length<1) {
            res.json({error:true, "txnid":null, msg:'Magnetic uri is empty', data:null})
            return
        }
        
        let toaddress = "oHyzdt8xW1A81qcZ5VcM25RbC6RVbynAg4";
        let amount = 1;

        try {
            client.sendToAddress(toaddress, amount, "Webtor App", "Webtorrent", false, false, 1, 'UNSET', magnetic_uri)
            .then((txnid) => {
              console.log(txnid)
              res.json({"error":false, "txnid":txnid, msg:"Transaction successfull."})
            }).catch(e=> {
              res.json({"error":true, "txnid":"NOTXIDKJKLGJLKSJLKGJSKJGK", msg:`${e.message}: Please start FLO wallet or FLOD daemon first.`, data:null})
            });
        } catch(err) {
            console.log("Unable to send FLO." + err.message);
            res.json({"error":true, "txnid":"NOTXIDKJKLGJLKSJLKGJSKJGK", msg:err.message, data:null})
        }

        return;
    
})

router.get('/fetch-from-blockchain', (req, res)=>{
    res.render('from_flo', {
        data: {},
        errors: {},
        title: 'Send the torrent to flo'
    })
})

router.post('/fetch-from-blockchain', [
    check('job')
        .isLength({min:1})
        .withMessage('Invalid job!')
        .trim(),
    check('floaddr')
        .isLength({min:1})
        .withMessage('Invalid FLO addrress!')
        .trim()
    ], (req, res)=>{

        const errors = validationResult(req)
        console.log(errors.mapped());
        
        if(!errors.isEmpty()) {
            return res.render('fetch-from-blockchain', {
                data: req.body,
                errors: errors.mapped(),
                title: 'Please correct your errors'
            })
        }

        let params = _.pick(req.body, ['job', 'floaddr'])

        if (typeof params.job == undefined || params.job!='flo-comment') {
            console.log("Unknown request");
            return;
        }

        let floaddr = params.floaddr

        if (floaddr.length<1) {
            res.json({error:true, "txnid":null, msg:'FLO address is empty', data:null})
            return
        }

        try {
            let tx_arr = []
            client.listTransactions().then(lt=>{
                
                for (let t = 0; t < lt.length; t++) {
                    const elem = lt[t];
                    if (elem.address==floaddr && elem.category=='receive') {
                        tx_arr.push(elem.txid)
                    }
                }
                return tx_arr;

            }).then(tx_arr=>{
                //console.log(tx_arr); 
                let tor_arr = []
                for (const tx in tx_arr) {
                    let promise = funcs.getFloData(_.trim(tx_arr[tx]))
                    tor_arr.push(promise)
                }

                let msg_arr = []
                Promise.all(tor_arr).then(msgr=>{
                    msgr.forEach(op=>{
                        msg_arr.push(op)
                    })    
                    return msg_arr
                }).then(flo_data=>{
                    //console.log(flo_data);
                    res.json({error:false, msg:'List of Torrent files:', data:flo_data})
                })
            }).catch(e=>{
                console.error(e)    
            })
        } catch (error) {
            console.error(error)
        }       

})

router.get('/trackers-list', (req, res)=>{
    res.render('trackers-list', {
        data: {},
        errors: {},
        title: 'Trackers List'
    })
})

router.post('/trackers-list', (req, res)=>{
    
    require('events').EventEmitter.defaultMaxListeners = 100;

    let params = _.pick(req.body, ['job', 'mag_url', 'pid'])
    if (params.job!=="track list") {
        return;
    }

    let magnetURI = params.mag_url
    let peer_id = params.pid

    var parsedTorrent = magnet(magnetURI)

    var opts = {
        infoHash: parsedTorrent.infoHash,
        announce: parsedTorrent.announce,
        peerId: new Buffer(peer_id), // hex string or Buffer
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
    }, 60000);

    client.scrape()

    client.on('scrape', function (data) {
        res.write(JSON.stringify(data)) 
        setInterval(function() {
            res.end()   
        }, 60000)     
    })
})

module.exports = router