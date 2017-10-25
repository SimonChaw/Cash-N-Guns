"use strict";

module.exports = function() {
  this.name = "";  // String: name
  this.age = 0;    // int: age
  this.ip;         // String: no use as of yet
  this.godFather;  // bool: is this character the godFather
  this.piece;      // String: What character are they playing
  this.bullet;     // bool: is there a bullet loaded?
  this.loot = [];  // Array: Collection of loot cards for this player
  this.clicks = 5;
  this.bangs = 3;
  this.target;     // int: Index of the player this player is going to shoot.
  this.health = 3; // int: Number of shots the player can take.
  this.getsLoot;   // bool: Does the player share in taking loot this round?
  return this;
}

