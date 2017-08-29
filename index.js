var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var messages = [];
var games = [];
var players = [];

var g = require('./game');

function Player(){
  this.name = "";
  this.age = 0;
  this.ip;
  this.godFather;
  this.piece;
  this.loot = [];
  return this;
}

function startGame(){
  if(players.length > 1 && players.length < 3){
    players = g.start(players);
    io.emit('allPlayersReady');
    io.emit('message', 'Please pick your player!');
  }
}

function startRound(){
  //check if all players have picked characters
  for(var i = 0; i < players.length; i ++){
    if(players[i].player.piece == ""){
      return;
    }
  }
  io.emit('allPlayersPicked');
  console.log("distributing cards");
  io.emit('loot', g.loot());
}

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/game', function(req, res){
  res.sendFile(__dirname + '/game.html');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

io.on('connection', function(socket){
  console.log('a user connected');
  /*io.emit('message history', messages);
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on('chat message', function(msg){
    messages.push(msg);
    io.emit('chat message', msg);
  });*/
  socket.on('playerSetup', function(name, age){
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

  socket.on('playerPicked',function(piece){//when a player picks a piece it comes through here first
    if(socket.player.piece == ""){
      socket.player.piece = piece;
      io.emit('playerPicked', piece);//tell all the players which piece is picked.
      io.emit('message', socket.player.name + ' picked ' + piece);
    }
    startRound();
  });


  socket.on('lootPicked', function(index){
      if(g.pickLoot(index, socket.player)){
        io.emit('lootPicked', index);
        io.emit('message', socket.player.name + " picked.");
      }else{
        io.emit('message', "Error: this card is picked.");
      }
  });
});
