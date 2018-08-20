const Client = require('bitcoin-core');
const client = new Client({host: 'localhost', network: 'testnet', username: 'yourusername', password: 'yourpassword', port: 17313
});

module.exports = client;
