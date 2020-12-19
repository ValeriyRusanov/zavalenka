// /routing/index.js


const url = require('url');
const fs = require('fs');


function createUUID() {
    // http://www.ietf.org/rfc/rfc4122.txt
    var s = [];
    var hexDigits = "0123456789ABCDEF";
    for (var i = 0; i < 32; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[12] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    s[16] = hexDigits.substr((s[16] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
 
    var uuid = s.join("");
    return uuid;
}

//////////////////////////////////////////////////////////////////////
// game state
// { "players" : {
//                 "player uuid1": { "name": "Vasya" },
//                 "player uuid2": { "name": "Petya" },
//                 ... },
//  "words" :  
//            [  {"word": "word text",
//               "defitions": 
//                 { 
//                  "definition" : { "uuid": "1234-..", "text": "def long text"},
//                  "fake1": { "uuid": "1234-..", "text": "fake1 long text"},
//                  "fake2": { "uuid": "1234-..", "text": "fake2 long text"},
//                  "player uuid": { "uuid": "word uuid 1234-..", "text": "player fake long text"},
//                  ...},
//                 } // end definitions
//                "votes"{
//                   "player uuid1" : [ "word1 uuid", "word2 uuid" ... ],
//                   "player uuid2" : [ "word1 uuid", "word2 uuid" ... ],
//                }
//          ...] // end words
//           },
// } // end game state


class Player {
    constuctor( name ) {
        this.id = createUUID(); 
        this.name = name;
        this.color = "";
    }
}

class PlayerInGame {
    constuctor( id ) {
        this.id = id; 
        this.state = "Joined";
    }   
}

class Word {
    constuctor( text ) {
        this.id = createUUID(); 
        this.text = text;
        this.definitions = Array;
    }
}

class Definition {
    constuctor( text, playerId ) {
        this.id = createUUID();     // definition guid
        this.text = text;           // defintion text
        this.playerId = playerId;   // id of play that wrote that definition
        this.votes = Array;         // set of id of players that vote for that definition
    }
}


class Game {
    constuctor() {
        this.state = "Not started";
        this.id = createUUID();
        this.words = Array;
        this.players = Array;
    }

//////////////////////////////////////////////////////////////////////
// admin functions

// admin send words
// [ {"word": "word text",
//    "defition": "long text",
//    "fake1": "fake long text",
//    "fake2": "fake long text",
//              ...},
//   {"word": "word text",
//    "defition": "long text",
//    "fake1": "fake long text",
//    "fake2": "fake long text",
//     ... },
//  ...]
//
// 
startRound1( data )
{
	if( !Array.isArray(data) )	
    {
        console.log("start game. invalid data");
		return '{"error": "invalid data"}';
    }

    this.words.length = 0;
    for (var wordInfo of data) {
        var word = new Word( wordInfo["word"] );
        word.definitions.push_back( new Definition(wordInfo.definition. "True") );

        if ( !(typeof wordInfo.fake1 === 'undefined')) {
            word.definitions.push_back( new Definition(wordInfo.fake1. "Fake1") );
        }
        if ( !(typeof wordInfo.fake2 === 'undefined')) {
            word.definitions.push_back( new Definition(wordInfo.fake2. "Fake2") );
        }
        this.words.push( word );
    }

    this.state = "round1";
    console.log("start game result");
    console.log(JSON.stringify(game));
    return "succeed";
}

startRound2() {
    this.state = "round2";
    console.log("start round2");
}

stopGame() {
    this.state = "ended";
    console.log("end game");
}


//////////////////////////////////////////////////////////////////////
// player functions
getStateSimple()
{
    // in future we are goint to verify access
    var res = {};
    res.uuid = this.id;
    res.state = this.state;
    console.log("get game state");
    console.log(JSON.stringify(res));

    return JSON.stringify(res);
}

newPlayer( data ) {
    if (typeof gameState["players"] === 'undefined') {
        gameState["players"] = new Object;
    }

    var players = gameState["players"];
    players[data["uuid"]] = new Object;
    players[data["uuid"]]["name"] = data["name"];

    console.log("new player");
    console.log(JSON.stringify(gameState));

    return "succeed";
}

// returns array
// [ "word1", "word2",... ]
const getWordsRound1 = function (gameState) {
    if (gameState.state != "round1") {
        console.log("invalid game status");
        return "Error: invalid game status";
    }

    var result = [];
    console.log("words" );
    console.log( JSON.stringify( gameState.words ) );

    for ( var i = 0; i < gameState.words.length; ++i) {
        console.log("word");
        console.log( JSON.stringify( gameState.words[i] ) );
        result.push(gameState.words[i].word);
    }

    console.log("player request words");
    console.log(JSON.stringify(result));

    return JSON.stringify(result);
}

// input { 
//         "player uuid" : "uuid",
//         "words" : [ "long text1", "long text2", ...]  }
// save as part of game words

const playerSendWordsRound1 = function (gameState, data) {
    if (gameState.state != "round1") {
        console.log("invalid game status");
        return "Error: invalid game status";
    }

    var playerId = data["player uuid"];
    if (typeof playerId === undefined) {
        console.log("invalid player");
        return "Error: invalid game status";
    }

    var gameWords = gameState.words;
    var dataWords = data.words;
    for (var i = 0; i < gameWords.length && i < dataWords.length; ++i) {
        console.log("Add word " + playerId + " " + dataWords[i]);

        gameWords[i][playerId] = new Object;
        gameWords[i][playerId].uuid = createUUID();
        gameWords[i][playerId].text = dataWords[i];
        
    }

    console.log("player send words");
    console.log(JSON.stringify(gameState));

    return "succeed";
}

// send words
// data = [ { "word": "word text"
//            "definitions": [
//            "uuid1": "text 1",
//            "uuid2": "text 2"
//             ... ]
//           },
//           { "word": "word text"
//            "definitions": [
//            "uuid1": "text 1",
//            "uuid2": "text 2"
//             ... ]
//           }, ...
//         ]
//
const getWordsRound2 = function (gameState, data) {
    if (gameState.state != "round2") {
        console.log("invalid game status");
        return "Error: invalid game status";
    }

    var playerUuid = data.playerUuid;
    var result = [];
    for ( var i in gameState.words) {
        var wordInfo = gameState.words[i];
        var dataWord = {};
        dataWord.word = wordInfo.word;
        dataWord.definitions = [];

        for (var key in wordInfo) {
            if ( key != "word"  ){//&& key != playerUuid) {
                var definition = {};
                definition.uuid = wordInfo[key].uuid;
                definition.text = wordInfo[key].text;
                dataWord.definitions.push (definition);
            }
        }
        result.push(dataWord);
    }

    console.log("player request words");
    console.log(JSON.stringify(result));

    return JSON.stringify(result);
}


// input { 
//         "player uuid" : "uuid",
//         "vote" : [ "uuid1", "uuid2", ...]  }
const playerSendWordsRound2 = function (gameState, data) {
    if (gameState.state != "round2") {
        console.log("invalid game status");
        return "Error: invalid game status";
    }

    if (data.playerUuid === undefined) {
        console.log("invalid player");
        return "Error: invalid game status";
    }

    console.log("add vote");
    console.log("player = " + data.playerUuid );
    gameState.votes[data.playerUuid] = { ...data.votes};
    return "succeed";
}

}


const define_game = function(gameState, req, res, postData) {
    console.log( "post data: " + postData);

	const request = JSON.parse(postData);

    console.log( "request type: " + request.type);
    console.log( "game state:\n\t" + JSON.stringify(gameState) );

    if (typeof request["type"] === 'undefined') {
        res.end('{ "error":"no request type"}');
    }
    // get requests 
    else if (request["type"] == "game state") {
        res.end(getGameState(gameState));
    }
    else if (request["type"] == "game info") {
        res.end(getGameInfo(gameState, request.data));
    }
    else if (request["type"] == "start round2") {
        res.end(startGameRound2(gameState));
    }
    else if (request["type"] == "stop game") {
        res.end(stopGame(gameState));
    }
    else if (request["type"] == "get words") {
        res.end(getWordsRound1(gameState));
    }
    else if (request["type"] == "get results") {
        res.end(JSON.stringify(gameState));
    }

    // post request
    else if (typeof request["data"] === 'undefined') {
        res.end('{ "error":"no request data"}');
    }
    else if (request["type"] == "start game") {
        res.end(startGameRound1(gameState, request.data));
    }
    else if (request["type"] == "new player") {
        res.end(newPlayer(gameState, request.data));
    }
    else if (request["type"] == "send words") {
        res.end(playerSendWordsRound1(gameState, request.data));
    }
    else if (request["type"] == "get definitions") {
        res.end(getWordsRound2(gameState, request.data));
    }
    else if (request["type"] == "send vote") {
        res.end(playerSendWordsRound2(gameState, request.data));
    }
    else {
        res.end('{"error": "unknown request type"}');
    }


    console.log( "After" );
    console.log( JSON.stringify( gameState ) );
}

const lastFolderPart = function(path)
{
    var arr = path.split(/\//);
    return arr[arr.length - 1];
}

const loadDynamic = function(path ,res)
{
    // Здесь мы пытаемся подключить модуль по ссылке. Если мы переходим на
    // localhost:8000/api, то скрипт идёт по пути /routing/dynamic/api, и, если находит там
    // index.js, берет его. Я знаю, что использовать тут try/catch не слишком правильно, и потом
    // переделаю через fs.readFile, но пока у вас не загруженный проект, разницу в скорости
    // вы не заметите.
    let dynPath = './dynamic/' + path;
    let routeDestination = require(dynPath);
    res.end('We have API!');
}

const loadStatic = function(path, res)
{
    // Теперь записываем полный путь к server.js. Мне это особенно нужно, так как сервер будет
    // висеть в systemd, и путь, о котором он будет думать, будет /etc/systemd/system/...
    let prePath = __dirname;

    // Находим наш путь к статическому файлу и пытаемся его прочитать.
    // Если вы не знаете, что это за '=>', тогда прочитайте про стрелочные функции в es6,
    // очень крутая штука.
    let filePath = prePath + '/static/' + path;
    console.log( "load static " + filePath);

    fs.readFile( filePath, 'utf-8', (err, html) => {
        // Если не находим файл, пытаемся загрузить нашу страницу 404 и отдать её.
        // Если находим — отдаём, народ ликует и устраивает пир во имя царя-батюшки.
        if(err) {
            let nopath = '/var/www/html/nodejs/routing/nopage/index.html';
            fs.readFile(nopath, (err , html) => {
                if(!err) {
                    res.writeHead(404, {'Content-Type': 'text/html'});
                    res.end(html);
                }
                // На всякий случай напишем что-то в этом духе, мало ли, иногда можно случайно
                // удалить что-нибудь и не заметить, но пользователи обязательно заметят.
                else{
                    let text = "Something went wrong. Please contact webmaster@forgetable.ru";
                    res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
                    res.end(text);
                }
            });
        }
        else{
            // Нашли файл, отдали, страница загружается.
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
            res.end(html);
        }
    });
}


const define = function(gamestate, req, res, postData) {
    console.log( req.url );
    const urlParsed = url.parse(req.url, true);
    let path = lastFolderPart( urlParsed.pathname );
    
    console.log( "path: " + path );

    if ( path == "api" )
    {
        try{
            define_game( gamestate, req, res, postData );
        }
        catch {
            let text = "Something went wrong. Please contact webmaster@forgetable.ru";
            res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
            res.end(text);
        }
    }
    else {
        try {
            loadDynamic( path, res );
        }
        catch (err) {
            loadStatic( path, res );
        }
    }
};

exports.define = define;