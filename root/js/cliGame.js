$(document).ready(function() {
	//Properties
	var selectedTarget;
	var myPiece;

	//Prepare click functions (html5 onclick attribute seems to cause issue)
	document.getElementById('btnClick').addEventListener('click', loadGun);
	document.getElementById('btnBang').addEventListener('click', loadGun);
	document.getElementById('btnBonzai').addEventListener('click', inOrOut);
	document.getElementById('btnCoward').addEventListener('click', inOrOut);

	//Display functions
	function createPlayerPiece(color, func, id) {
		var piece = document.createElement("div");
		piece.style.backgroundColor = color;
		piece.className = 'player';
		piece.id = id ? id : color;
		piece.addEventListener('click', func);
		$('#playerStage').append(piece);
	}

	function layOutLoot(cards) {
		var mobBossDesk = document.createElement("div");
		mobBossDesk.className = "loot";
		mobBossDesk.style.backgroundColor = "brown";
		$('#gameBoard').append(mobBossDesk);
		for(var i = 0; i < cards.length; i ++){//Put out cards
			var card = document.createElement("div");
			card.className = "loot";
			if(cards[i].type == "diamond"){
				card.style.backgroundColor = "lightblue";
			}else if(cards[i].type == "painting"){
				card.style.backgroundColor = "beige";
			}else if(cards[i].type == "cash"){
				card.style.backgroundColor = "lightgreen";
			}
			else{
				card.style.backgroundColor = "white";
			}
			card.id = 'loot' + i;
			card.addEventListener('click', pickLoot);
			card.innerHTML = "Type:" + cards[i].type + "<br / >"
				+ "Value:" + cards[i].value;
			$('#lootContainer').append(card);
		}
	}

	//Server communications
	var socket = io();
	$('#playerSetup').submit(function() {
		socket.emit('playerSetup', $('#name').val(), $('#age').val());//send in name and age so game can begin
		$('#name').val('');
		$('#age').val('');
		return false;
	});

	socket.on('accepted', function(accepted) {
		if(accepted){
			$('#playerSetup').hide();
			$('#message').text("Waiting for other players!");
		}
	});

	socket.on('allPlayersReady', function() {
		$('#message').text('');
		createPlayerPiece('red', pickPlayer);
		createPlayerPiece('black', pickPlayer);
		createPlayerPiece('brown', pickPlayer);
		createPlayerPiece('orange', pickPlayer);
		createPlayerPiece('blue', pickPlayer);
	});

	socket.on('updateAmmo', function(clicks, bangs) {
		$("#btnClick").text('Clicks (' + clicks + ')');
		$("#btnBang").text('Bangs (' + bangs + ')');
	});

	socket.on('lootPicked', function(index) {
		$('#loot'+ index).remove();
	});

	socket.on('allPlayersPicked', function() {
		$('.player').remove();
	});

	socket.on('playerPicked', function(piece) {
		console.log(piece);
		$('#' + piece).remove();
	});

	socket.on('loot', function(cards) {
		layOutLoot(cards);
	});

	socket.on('pickTarget', function(players) {
		for(var i = 0; i < players.length; i ++) {
			if(players[i].piece !== myPiece) {
				createPlayerPiece(players[i].piece , pickTarget, 'player' + i);
			}
		}
	});

	socket.on('inOrOut', function() {
		$('.player').remove();
		$('#targetLabel').show();
		$('#shootButtons').show();
	});
	
	socket.on('enemy', function(enemy) {
		createPlayerPiece(enemy, null);
	});

	socket.on('message', function(message) {
		$('#messages').append($('<li>').text(message));
	});

	//Player Actions
	function pickPlayer(e) {
		myPiece = e.target.id;
		socket.emit('playerPicked', e.target.id);
	}

	function pickLoot(e) {
		var index = e.target.id.replace("loot", "");
		socket.emit('lootPicked', index);
	}

	function loadGun(e) {
		socket.emit('bullet', e.target.id == 'btnBang');
	}

	function pickTarget(e) {
		var target = e.target.id.replace('player', '');
		console.log(target);
		socket.emit('target', target);
	}

	function inOrOut(e) {
		socket.emit('bonzai', e.target.id == 'btnBonzai');
	}
});
