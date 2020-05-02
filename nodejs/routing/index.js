// /routing/index.js
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
//               "defition": 
//                 { "uuid": "1234-..",
//                   "text": "def long text"},
//               "fake1":
//                 { "uuid": "1234-..",
//                   "text": "fake1 long text"},
//               "fake2":
//                 { "uuid": "1234-..",
//                   "text": "fake2 long text"},
//               "player uuid":
//                 { "uuid": "word uuid 1234-..",
//                   "text": "player fake long text"},
//                  ...},
//             ...] // end words
// "votes" : {
//             "player uuid1" : [ "word1 uuid", "word2 uuid" ... ],
//             "player uuid2" : [ "word1 uuid", "word2 uuid" ... ],
//           },
// } // end game state

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
const startGameRound1 = function( gameState, data )
{
	if( !( data instanceof JSONArray ) || data.lengh != 5 )	
    {
        console.log("start game. invalid data");
		return '{"error": "invalid data"}';
    }

    gameState = new Object;
    gameState["state"] = "round1";
    gameState["uuid"] = createUUID();
    gameState["words"] = new Object;
    gameState["votes"] = new Object;

    var gameWords = gameState["words"];
    for (var wordInfo of data) {
        var gameWord = new Object;
        gameWord["word"] = wordInfo["word"];
        gameWord["definition"] = new Object;
        gameWord["definition"]["uuid"] = createUUID();
        gameWord["definition"]["text"] = wordInfo["definition"];

        if (typeof wordInfo["fake1"] === 'undefined') {
            gameWord["fake1"] = new Object;
            gameWord["fake1"]["uuid"] = createUUID();
            gameWord["fake1"]["text"] = wordInfo["fake1"];
        }
        if (typeof wordInfo["fake2"] === 'undefined') {
            gameWord["fake2"] = new Object;
            gameWord["fake2"]["uuid"] = createUUID();
            gameWord["fake2"]["text"] = wordInfo["fake2"];
        }

        gameWords.push(gameWord);   
    }

    console.log("start game");
    console.log(JSON.stringify(gameState));
    return "succeed";
}

const startGameRound2 = function (gameState) {
    gameState["state"] = "round2";
    console.log("start round2");
    return "succeed";
}

const stopGame = function (gameState) {
    gameState["state"] = "ended";
    console.log("end game");
    return "succeed";
}

//////////////////////////////////////////////////////////////////////
// player functions
const newPlayer = function (gameState, data) {
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
    if (gameState["state"] != "round1") {
        console.log("invalid game status");
        return "Error: invalid game status";
    }

    var result = new Array;

    for (var wordInfo in gameState["words"]) {
        result.push(wordInfo["word"]);
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
    if (gameState["state"] != "round1") {
        console.log("invalid game status");
        return "Error: invalid game status";
    }

    var playerId = gameState["players"][data["player uuid"]];
    if (typeof playerId === undefined) {
        console.log("invalid player");
        return "Error: invalid game status";
    }

    var gameWords = gameState["words"];
    var dataWords = data["words"];
    for (var i = 0; i < gameWords.lengh && i < dataWords.lengh; ++i) {
        if (dataWords[i] == "") {
            continue;
        }

        var playerWord = new Object;
        playerWord["uuid"] = createUUID();
        playerWord["text"] = dataWords[i];
        gameWords[i][playerId] = playerWord;
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
const getWordsRound2 = function (gameState, playerUuid) {
    if (gameState["state"] != "round2") {
        console.log("invalid game status");
        return "Error: invalid game status";
    }

    var result = new Array;
    for (var wordInfo in gameState["words"]) {
        var dataWord = new Object;
        dataWord["word"] = wordInfo["word"];

        var defitions = new Object;
        for (const [key, value] of wordInfo) {
            if (key != "word" && key != playerUuid) {
                defitions["uuid"] = value["uuid"];
                defitions["text"] = value["text"];
            }
        }
        dataWord["definitions"] = defitions;
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
    if (gameState["state"] != "round2") {
        console.log("invalid game status");
        return "Error: invalid game status";
    }

    var playerId = gameState["players"][data["player uuid"]];
    if (typeof playerId === undefined) {
        console.log("invalid player");
        return "Error: invalid game status";
    }

    gameState["votes"][playerId] = data["vote"];
    return "succeed";
}


const define = function(gameState, req, res, postData) {
	const requst = JSON.parse(json);

    if (typeof request["type"] === 'undefined') {
        res.end('{ "error":"no request type"}');
    }
    else if (typeof request["data"] === 'undefined') {
        res.end('{ "error":"no request data"}');
    }
    else if (request["type"] == "start game") {
        res.end(startGameRound1(gameState, data));
    }
    else if (request["type"] == "start round2") {
        res.end(startGameRound2(gameState));
    }
    else if (request["type"] == "stop game") {
        res.end(stopGame(gameState));
    }
    else if (request["type"] == "new player") {
        res.end(newPlayer(gameState, data));
    }
    else if (request["type"] == "get words") {
        res.end(getWordsRound1(gameState));
    }
    else if (request["type"] == "send words") {
        res.end(playerSendWordsRound1(gameState, data));
    }
    else if (request["type"] == "get definitions") {
        res.end(getWordsRound2(gameState));
    }
    else if (request["type"] == "send vote") {
        res.end(playerSendWordsRound2(gameState, data));
    }
    else if (request["type"] == "get results") {
        res.end(JSON.stringify(gameState));
    }
    else {
        res.end('{"error": "unknown request type"}');
    }

    console.log( JSON.stringify( gameState ) );
}

exports.define = define;
