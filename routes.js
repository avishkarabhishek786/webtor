const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check')
const { matchedData } = require('express-validator/filter')
const _ = require('lodash');

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

module.exports = router