const client = require('../../server')
const _ = require('lodash')

let getFloData = (tx) => {
    return new Promise((resolve, reject)=>{
        let transaction = _.trim(tx)
        try {
        return client.getRawTransaction(transaction, 1).then(res=>{
            if (res==undefined) {
                return reject(error)
            }
            return res;
        }).then(response=>{
            return resolve(response.floData)
        })
        } catch (error) {
            return reject(error)
        } 
    }).catch ((error)=>{
        console.error(error);
    })
}



module.exports = {
    getFloData
}