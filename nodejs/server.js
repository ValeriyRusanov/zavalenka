// server.js
var gameState = new Object;

const http = require('http');
const routing = require('./routing');

let server = new http.Server(function(req, res) {
  var jsonString = ''; // data started
  res.setHeader('Content-Type', 'application/json');
  req.on('data', (data) => { // new data
      jsonString += data;
  });

  req.on('end', () => { // data ended
      routing.define( gameState, req, res, jsonString);
  });
});
server.listen(8000, 'localhost');