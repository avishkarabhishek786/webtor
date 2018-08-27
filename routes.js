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
        //alert("Please specify a magnetic url.");
        console.error("Empty torrent id");
        return;
    }

    client.add(torrentId, function (torrent) {

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

                // Seed file
                client.seed(file, function (tor) {
                    console.log(tor);
                    console.log('Client is seeding ' + tor.magnetURI)
                })

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

        let toaddress = "oSjBiuTE1aFNBjaSGq6UNhU9ddpD2YXdg8";
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
                console.log(tx_arr); 
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
                    console.log(flo_data);
                    res.json({error:false, msg:'floData fetching complete', data:flo_data})
                })
            }).catch(e=>{
                console.error(e)    
            })
        } catch (error) {
            console.error(error)
        }       

})

module.exports = router