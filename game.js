"use strict";

function Game(){
  var lootCards = new Array();
  var round;
  var cards;
  var alivePlayers;
  var turn;
  var cardsLeft;
  var phase = '';

  //CLASSES
  function LootCard(type, value){
    this.type = type;
    this.value = value;
    this.picked = false;
    return this;
  }

  //get/set
  exports.phase = function(){
    return phase;
  }

  exports.setPhase = function(n){
    phase = n;
  }

  exports.round = function(){
    return round;
  }

  //FUNCTIONS
  Array.prototype.move = function (from, to) {
    this.splice(to, 0, this.splice(from, 1)[0]);
  };

  Array.prototype.rotate = function( n ) { //Rotate the array based on order joined so that the oldest player is first
    this.unshift.apply( this, this.splice( n, this.length ) )
    return this;
  }

  function shuffle(a) {
      var j, x, i;
      for (i = a.length; i; i--) {
          j = Math.floor(Math.random() * i);
          x = a[i - 1];
          a[i - 1] = a[j];
          a[j] = x;
      }
  }

  exports.start = function(players){
    var oldest = {age : 0, playerIndex: null};
    for(var i = 0; i < players.length; i ++){
      //choose godFather and setup clicks and bangs
      oldest.index = ((oldest.age < players[i].player.age) ? i : oldest.index); //Decide who the godFather will be based on the ages of all players. Oldest player will be godFather
      oldest.age = players[oldest.index].player.age;
    }
    players[oldest.index].player.godFather = true;
    //create cards
    for(var i = 0; i < 15; i ++){
      //create bills
      var card = new LootCard("cash", 5000);
      lootCards.push(card);
    }
    for(var i = 0; i < 15; i ++){
      //create bills
      var card = new LootCard("cash", 10000);
      lootCards.push(card);
    }
    for(var i = 0; i < 10; i ++){
      //create bills
      var card = new LootCard("cash", 20000);
      lootCards.push(card);
    }
    for(var i = 0; i < 9; i ++){
      //create diamonds
      if(i < 5){
        var card = new LootCard("diamond", 1000);
      } else if(i > 5 && i < 8) {
        var card = new LootCard("diamond", 5000);
      } else {
        var card = new LootCard("diamond", 10000);
      }
      lootCards.push(card);
    }
    for(var i = 0; i < 10; i ++){
      //create paintings
      var card = new LootCard("painting", 0);
      lootCards.push(card);
    }
    for(var i = 0; i < 3; i ++){
      //create paintings
      var card = new LootCard("clip", 0);
      lootCards.push(card);
    }
    for(var i = 0; i < 2; i ++){
      //create paintings
      var card = new LootCard("firstaid", 0);
      lootCards.push(card);
    }
    shuffle(lootCards);
    console.log('game started');
    round = 8;
    alivePlayers = players.length;
    turn = 0;
    return players.rotate(oldest.index);
  }

  exports.loot = function(){
    cards = [];
    for(var i = 0; i < 8; i ++){
      cards.push(lootCards[0]);
      lootCards.shift();
    }
    cardsLeft = 8;
    phase = "load";
    return cards;
  }


  exports.pickLoot = function(index, player){
    if(phase == "loot")
      if(cards[index].picked){
        return false;
      }else{
        cards[index].picked = true;
        player.loot.push(cards[index]);
        turn = turn + 1;
        if(turn == alivePlayers){
          turn = 0;
        }
        cardsLeft = cardsLeft - 1;
        return true;
      }
    }


  exports.isMyTurn = function(index){
    return index == turn; // if the index of the player matches the turn number, it is the players turn
  }

  exports.cardsLeft = function(){
    return cardsLeft > 0;
  }

  exports.shootOut = function(players){
    var messages = [];
    for(var i = 0; i < players.length; i ++){
      var player = players[i].player;
      var target = players[players[i].player.target].player;//makes it easier to read
      if(player.bonzai && target.bonzai){//is player && player target is staying in shoot out?
        if(player.bullet){//did the player use a bang this round?
          target.health = target.health - 1;//injur target
          messages.push(player.name + ' shot and injured ' + target.name);
          if(target.health == 0){
            //player dies
            alivePlayers = alivePlayers - 1;
            if(alivePlayers == 0){
              //gameOver
            }
          }
          target.getsLoot = false;//target does not get to share in loot
        }else{
          messages.push(player.name + ' shot ' + target.name + ", but it was just a blank!");
          target.getsLoot = true;//target gets to share in loot
        }
      }else if(player.bonzai && !target.bonzai){//is the player in but their target out?
          messages.push(player.name + ' tried to shoot at ' + target.name + ', but ' + target.name + ' hid themselves!' );
      }
      //store changes to original player model
      players[i].player = player;
      players[players[i].player.target].player = target;
    }
    return messages;
  }

}

var game = new Game();
exports.game = game;
