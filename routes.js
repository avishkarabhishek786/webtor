const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check')
const { matchedData } = require('express-validator/filter')
const _ = require('lodash');

const client = require('./server.js');

var path = require('path')
var fs = require('fs');

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

        let toaddress = "oXCsMUyX3mLJEdnn8SXoH6gyPW9Jd6kjYu";
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

router.get('/fetch-tx-comment', (req, res)=>{
    res.render('from_flo', {
        data: {},
        errors: {},
        title: 'Send the torrent to flo'
    })
})

module.exports = router