// server.js
// Для начала установим зависимости.

var gameState = {};

const http = require('http');
const routing = require('./routing');

var game = {};

let server = new http.Server(function(req, res) {
  // API сервера будет принимать только POST-запросы и только JSON, так что записываем
  // всю нашу полученную информацию в переменную jsonString
  var jsonString = '';
  res.setHeader('Content-Type', 'application/json');
  req.on('data', (data) => { // Пришла информация - записали.
      jsonString += data;
  });

  req.on('end', () => {// Информации больше нет - передаём её дальше.
      routing.define( gameState, req, res, jsonString); // Функцию define мы ещё не создали.
  });
});
server.listen(8000, 'localhost');