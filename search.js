// const postData = querystring.stringify({
//     'msg': 'Hello World!'
//   });
  
    const http = require('http')

  const options = {
    //hostname: 'udp://tracker.opentrackr.org:1337?infohash=4a7b842632ca42cdd3c8d54017a8da756839b84d',
    hostname: 'http://torrent.ubuntu.com:6969/announce?info_hash=%9b%db%bbI%f0%85%a2%d1%5d%96%ac%fa%bf%f81%06%001O%e0&peer_id=ABCDABCDABCDABCDABCD&port=6882&downloaded=0&uploaded=0&left=0&event=started&compact=1',
    port: 80,
    //path: '/upload',
    method: 'GET',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
      //'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      console.log(`BODY: ${chunk}`);
    });
    res.on('end', () => {
      console.log('No more data in response.');
    });
  });
  
  req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
  });
  
  // write data to request body
  //req.write(postData);
  req.end();
  