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

function saveAs(uri, filename) {
    var link = document.createElement('a');
    if (typeof link.download === 'string') {
      link.href = uri;
      link.download = filename;
  
      //Firefox requires the link to be in the body
      document.body.appendChild(link);
  
      //simulate click
      link.click();
  
      //remove the link when done
      document.body.removeChild(link);
    } else {
      window.open(uri);
    }
  }
  
module.exports = {
    getFloData,
    saveAs
}