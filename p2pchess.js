// do not pick up pieces if the game is over
// only pick up pieces for the side to move
var onDragStart = function(source, piece, position, orientation) {
  if (game.game_over() === true ||
      (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false;
  }
};

var onDrop = function(source, target) {

	if (game.turn() != toplay) {
		return 'snapback';
	}
	
  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  });

  // illegal move
  if (move === null) {
		return 'snapback';
	}
	glb_source = source
	glb_target = target
  updateStatus();
  if(conn) {
	conn.send(move);
  }
  

};


// update the board position after the piece snap 
// for castling, en passant, pawn promotion
var onSnapEnd = function() {
  board.position(game.fen());
};

var updateStatus = function() {
  var status = '';

  var moveColor = 'White';
  if (game.turn() === 'b') {
    moveColor = 'Black';
  }

  // checkmate?
  if (game.in_checkmate() === true) {
    status = 'Game over, ' + moveColor + ' is in checkmate.';
  }

  // draw?
  else if (game.in_draw() === true) {
    status = 'Game over, drawn position';
  }

  // game still on
  else {
	if(g_orientation.toUpperCase() != moveColor.toUpperCase()) {
		status = "Click on send move button"
	} else {
		status = moveColor + ' to move';
	}

    // check?
    if (game.in_check() === true) {
      status += ', ' + moveColor + ' is in check';
    }
  }

  statusEl.html(status);

};
var reset = function() {
	window.open(window.location.href,"_self")
}
var sendmove = function() {
	var otherp2pmode = "sender"
	if(p2pmode == "sender") {
		otherp2pmode = "reciever"
	}
	var gameUrl = "https://justchess.herokuapp.com/p2pchess.html?fen="+orgStartPos+"&source="+glb_source+"&target="+glb_target+"&p2pmode="+otherp2pmode+"&peerid=" +peerid +"&connected="+connected;
	//for debug
	//gameUrl = "file:///D:/chess/githubvishwas.github.io/p2pchess.html?fen="+orgStartPos+"&source="+glb_source+"&target="+glb_target+"&p2pmode="+otherp2pmode+"&peerid=" +peerid+"&connected="+connected;
	
	var sendlink  = "https://wa.me/?text="+encodeURIComponent(gameUrl)
	//for debug
	//alert(sendlink)
	
	
	//window.open(sendlink)
	
	//for debug
	//window.open(gameUrl)
	prompt("Copy and send the link below to play with your friend: ", gameUrl)
}

function getUrlVars() {
    var vars = {};
	console.log("params found: ")
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
		console.log(key + ": " + value);
    });
    return vars;
}
function getShortLink(url) {

    // Bit.ly API
    BitlyCB.shortenResponse = function(data) {
            var sss = '';
            var first_result;
            // Results are keyed by longUrl, so we need to grab the first one.
            for     (var r in data.results) {
                    first_result = data.results[r]; break;
            }
            sss = first_result["shortUrl"].toString();
            document.getElementById("qlink").value = sss;
    }
    BitlyClient.shorten(window.location, 'BitlyCB.shortenResponse');

}
function p2pinit(initmode) {
	console.log("Initializing p2p");
	
	peer = new Peer(null, {
						host:'justchesspeerjs.herokuapp.com',
						secure:true, 
						port:443,
                        debug: 2
                    });
	
		
	//var peer = new Peer({　host:'justchesspeerjs.herokuapp.com', secure:true, port:443, key: 'peerjs', debug: 3})	
	
	/*
	var peer = new Peer(null, {
                secure: true, 
                host: 'justchesspeerjs.herokuapp.com', 
                port: 443,
				key: 'lwjd5qra8257b9'
    });
	*/
	console.log("initmode :" +  initmode);	
	console.log("peerid :" +  peerid);		
	if(initmode == "reciever") {
		
		console.log("Initializing reciever p2p");
		peer.on('open', function(id) {
		  console.log('Reciever peer ID is: ' + id);
		  peerid = id;
		  p2pmode = "reciever"
		});
		peer.on('connection', function (c) {
                        if (conn) {
                            c.send("Already connected...");
                            c.close();
                            return
                        }
                        conn = c;
                        console.log("Connected.");
                        ready()
                    });
	} else {
		if (peerid != null) {
			console.log("Initializing sender p2p");
			console.log('Sender peer ID is: ' + peerid);
			conn = peer.connect(peerid);
			p2pmode = "sender"
			connected = 1;
			conn.on('open', function () {
                          
                            console.log("Connected...")
                            ready();
                        });
		}
		
	}
	
}

function ready() {
                    conn.on('data', function (data) {
                        console.log("Move recieved: " + data);
						game.move(data);
						 board.position(game.fen());
					});
}
function main() {

	console.log("Launching version 1.1");
	
	startPos = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR_w_KQkq_-_0_1'
	//var startPos = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1'
	//file:///D:/chess/githubvishwas.github.io/justplaychess.html?fen=rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR_w_KQkq_-_0_1&source=d2&target=d4
	params = getUrlVars();
	if("fen" in params) {
		startPos = params["fen"];
	}
	glb_source = "";
	if("source" in params) {
			glb_source = params["source"];
		}
		
	glb_target = "";
	if("target" in params) {
			glb_target = params["target"];
		}	
	
	connected = 0;
	if("connected" in params) {
			connected = params["connected"];
		}	
		
	peerid = null;
	if("peerid" in params) {
			peerid = params["peerid"];
		}		

	if("p2pmode" in params) {
			p2pmode = params["p2pmode"];
			if(p2pmode ==  "sender") {
				if("peerid" in params) {	
					peerid = params["peerid"]
				}
			}
		}	
	orgStartPos = startPos
	startPos = orgStartPos.replace(/_/g, " ");

	lastplay = startPos.split(" ")[1];
	toplay = ""
	g_orientation = "white"
	console.log("connected: " + connected);
	if(glb_source === "" && glb_target === "") {
			//fresh board so set up as reciever and generate peerid
			if(connected == 0) {
				p2pinit(p2pmode);
			}
			toplay = "w";
			g_orientation = "white"
	} else if (lastplay === "w") {
		if(connected == 0) {
			p2pinit(p2pmode);
		}
		toplay = "b"
		g_orientation = "black"
	} else {
		if(connected == 0) {
			p2pinit(p2pmode);
		}
		toplay = "w"
		g_orientation = "white"
	}
	console.log("Start chess!");
	console.log("startPos: " + startPos);
	console.log("lastplay: " + lastplay);
	console.log("toplay: " + toplay);
	console.log("orientation: " + g_orientation);
	console.log("glb_source: " + glb_source);
	console.log("glb_target: " + glb_target);
	
	var cfg = {
	  draggable: true,
	  position: startPos,
	  onDragStart: onDragStart,
	  onDrop: onDrop,
	  onSnapEnd: onSnapEnd,
	  moveSpeed: 'slow', 
	  orientation: g_orientation
	};
	board = ChessBoard('board', cfg);


	if(glb_target != "") {
			game.load(startPos)
			glb_source = params["source"];
			var move = game.move({
				from: glb_source,
				to: glb_target,
				promotion: 'q' // NOTE: always promote to a queen for example simplicity
			  });
			game.move(move);
			board.position(game.fen());
			orgStartPos = game.fen().replace(/ /g,"_");
		
	}



	  

	updateStatus();
}
var board
var game = new Chess()
var statusEl = $('#status');
var startPos = ""
var glb_source = ""
var glb_target = ""
var orgStartPos = ""
var lastplay = ""
var toplay = ""
var g_orientation = ""

//p2pstuff
var p2pmode = "reciever"
var peer = null; // Own peer object
var peerid = null;
var conn = null;
var connected  = 0;


main()



