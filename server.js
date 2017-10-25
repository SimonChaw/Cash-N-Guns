"use strict";

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var g = require('./game')();
var Player = require('./player');

var messages = [];
var games = [];
var players = [];
var waiting;

app.use(express.static('root'));

http.listen(3000, function() {
	console.log('Cash \'N Guns listening on *:3000!');
});

io.on('connection', function(socket){
	console.log('a user connected');

	socket.on('playerSetup', function(name, age) {
		var player = new Player();

		player.name = name;
		player.age = age;
		player.ip = 10;
		player.piece = "";
		player.godFather = false;
		socket.player = player;
		players.push(socket);
		socket.emit('accepted', true);
		io.emit('message', name + " has joined!")
		startGame();
	});

	socket.on('playerPicked',function(piece) {//when a player picks a piece it comes through here first
		if(socket.player.piece == ""){
			socket.player.piece = piece;
			io.emit('playerPicked', piece);//tell all the players which piece is picked.
			io.emit('message', socket.player.name + ' picked ' + piece);
			waiting = waiting - 1;
		}
		startRound();
	});


	socket.on('lootPicked', function(index) {
		var lastSearchedIndex = getPlayerIndex(socket.player);
		if(g.isMyTurn(lastSearchedIndex)){
			if(g.pickLoot(index, socket.player)){
				io.emit('lootPicked', index);
				io.emit('message', socket.player.name + " picked.");
				if(lastSearchedIndex + 1 == players.length){
					players[0].emit('message', players[0].player.name + ', it is your turn to pick.');
				}else{
					players[lastSearchedIndex + 1].emit('message', players[lastSearchedIndex + 1].player.name + ', it is your turn to pick.');
				}
			}else{
				if(g.phase() == 'loot'){
					socket.emit('message', "It's not time to pick loot yet!");
				}else{
					socket.emit('message', "Error: this card is picked.");
				}
			}
		}else{
			socket.emit('message', 'Sorry, its not your turn to pick loot.');
		}
		if(! g.cardsLeft()){
			//Start new round;
		}
	});

	socket.on('bullet', function(bullet) {
		if (g.phase() == 'load' && (g.round() == socket.player.bangs + socket.player.clicks)){
			if(bullet && socket.player.bangs > 0){
				socket.player.bangs = socket.player.bangs - 1;
				waiting = waiting -1;
			}else if(!bullet && socket.player.clicks > 0){
				socket.player.clicks = socket.player.clicks - 1;
				waiting = waiting -1;
			}else{
				socket.emit('message', 'Sorry you are out of ' + (bullets) ? 'bang' : 'click' + ' cards.');
				return;
			}
		}else{
			socket.emit('message', (g.phase() == 'load') ? 'You have already loaded your gun' : 'It is not time to do this');
			return;
		}
		socket.player.bullet = bullet;
		socket.emit('message', 'Ca-chink! Gun loaded!');
		socket.emit('updateAmmo', socket.player.clicks, socket.player.bangs);
		if(waiting == 0){
			//proceed to next stage
			waiting = players.length;
			g.setPhase('target');
			var targetList = [];
			for(var i = 0; i < players.length; i ++){
				targetList.push(players[i].player);
			}
			io.emit('pickTarget', targetList);
			io.emit('message','Now, Who are you going to shoot at?');
		}
	});

	socket.on('target', function(index) {
		if(g.phase() == 'target' && index < players.length){
			socket.player.target = index;
			waiting = waiting - 1;
			socket.emit('message', 'Selected ' + players[index].player.piece + ' as your target.');
		}
		if(waiting == 0){
			waiting = players.length;
			g.setPhase('shoot');
			io.emit('inOrOut');
			//show all players who are targeting them
			for(var i = 0; i < players.length; i ++){
				players[i].emit('enemy', players[players[i].player.target].player.piece);
			}
			io.emit('message', "Are you in or are you out?");
		}
	});

	socket.on('bonzai', function(bonzai) {
		if(g.phase() == 'shoot'){
			socket.player.bonzai = bonzai;
			socket.emit('message', 'You are ' + (bonzai ? 'staying in, you will share in the loot if you are not shot.' : 'cowarding out. Any one shooting at you will miss, but you will not share in the loot'));
			waiting = waiting - 1;
		}
		if(waiting == 0){
			waiting = players.length;
			var messages = g.shootOut(players);
			for(var i = 0;i < messages.length;i++){
				io.emit('message', messages[i]);
			}
		}
	});
});

function getPlayerIndex(player) {
	for(var i = 0; i < players.length; i ++){
		if(player.piece == players[i].player.piece){
			return i;
		}
	}
	console.log('Could not find player!!');
}

function startGame() {
	if(players.length > 1 && players.length < 3){
		players = g.start(players);
		waiting = players.length;
		io.emit('allPlayersReady');
		io.emit('message', 'Please pick your player!');
	}
}

function startRound() {
	//check if all players have picked characters; using waiting var to avoid too many loops
	if(waiting > 0){
		return;
	}else{
		waiting = players.length;
	}
	io.emit('allPlayersPicked');
	console.log("distributing cards");
	io.emit('loot', g.loot());
	io.emit('message', 'Please choose your bullet card!');
}
