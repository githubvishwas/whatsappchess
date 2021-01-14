const moveAudio = new Audio('sounds/Move.mp3');
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
  moveAudio.play()
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
  console.log(game.pgn());
  console.log(game.pgn().charAt(0));
  if(game.pgn().charAt(0) == "1") {
		pgnEl.html(game.pgn());
  }
	
};
var reset = function() {
	window.open(window.location.href,"_self")
}
var sendmove = function() {
	
	var gameUrl = "http://tryit.in/whatsappchess/index.html?fen="+orgStartPos+"&source="+glb_source+"&target="+glb_target;
	//var gameUrl = "file:///D:/chess/githubvishwas.github.io/justplaychess.html?fen="+orgStartPos+"&source="+glb_source+"&target="+glb_target;
	if(game.pgn() != "") {
		if(game.pgn().charAt(0) == "1") {
			var encodedpgn = game.pgn().replace(/ /g,"_");
			console.log(encodedpgn)
			gameUrl = "http://tryit.in/whatsappchess/index.html?fen="+orgStartPos+"&source="+glb_source+"&target="+glb_target+"&game="+encodedpgn;
		}
	}
	
	var sendlink  = "https://wa.me/?text="+encodeURIComponent(gameUrl)
	//alert(sendlink)
	window.open(sendlink)
	//window.open(gameUrl)
}

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
		console.log(key + ": " + value);
    });
    return vars;
}


function main() {
	startPos = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR_w_KQkq_-_0_1'
	//var startPos = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1'
	//file:///D:/chess/githubvishwas.github.io/justplaychess.html?fen=rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR_w_KQkq_-_0_1&source=d2&target=d4
	params = getUrlVars();
	game_pgn = "";
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
	if("game" in params) {
		var decodedpgn = params["game"].replace(/_/g, " ");
		pgnEl.html(decodedpgn);
		game_pgn = decodedpgn;
	}	
	orgStartPos = startPos
	startPos = orgStartPos.replace(/_/g, " ");

	lastplay = startPos.split(" ")[1];
	toplay = ""
	g_orientation = "white"
	if(glb_source === "" && glb_target === "") {
			toplay = "w";
			g_orientation = "white"
	} else if (lastplay === "w") {
		toplay = "b"
		g_orientation = "black"
	} else {
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
			if(game_pgn != "") {
				game.load_pgn(game_pgn)
			}
			board.position(game.fen());
			orgStartPos = game.fen().replace(/ /g,"_");
		
	}



	  

	updateStatus();
}
var board
var game = new Chess()
var statusEl = $('#status');
var pgnEl = $('#pgn5');
var startPos = ""
var glb_source = ""
var glb_target = ""
var orgStartPos = ""
var lastplay = ""
var toplay = ""
var g_orientation = ""

main()