var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var messages = [];
var games = [];

function Game(){
  var id;
  var players = [];

  this.init = function(){
    this.id = makeid();
  };

  function makeid()
  {
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for( var i=0; i < 20; i++ )
          text += possible.charAt(Math.floor(Math.random() * possible.length));

      return text;
  }
};

function Player(){
  var nickname;
  var id;

}

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/creategame', function(req, res){
  var game = new Game();
  game.init();
  games.push(game);
  console.log(games);
  res.redirect('game/' + game.id);
});

app.get('/game/:gameID', function(req, res){
  res.sendFile(__dirname + '/game.html');
});



http.listen(3000, function(){
  console.log('listening on *:3000');
});

io.on('connection', function(socket){
  console.log('a user connected');
  console.log(socket.client.id);
  io.emit('message history', messages);
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on('chat message', function(msg){
    messages.push(msg);
    io.emit('chat message', msg);
  });
});
