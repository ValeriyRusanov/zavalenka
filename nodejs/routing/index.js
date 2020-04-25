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

const startGame = function( gameState, data )
{
	if( !( data instanceof JSONArray ) || data.lengh != 5 )	
	{
		return '{"error": "invalid data"}';
	}
    gameState = {};
    gameState{"state"} = "words ready";

}

const define = function(gameState, req, res, postData) {
	const requst = JSON.parse(json);

	if ( typeof request.type  === 'undefined' )
	{
		res.end('{ "error":"no request type"}'); 
	}
	else if ( typeof request.data  === 'undefined' )
	{
		res.end('{ "error":"no request data"}'); 
	}

	else if ( request.type eq "start game" )
	{
		res.end( startGame(request.data) );
	}
	else
	{
  		res.end('something goes wrong');
  	}
}
exports.define = define;
