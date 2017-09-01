$( document ).ready(function() {
    var socket = io();
    $('#playerSetup').submit(function(){
      socket.emit('playerSetup', $('#name').val(), $('#age').val());//send in name and age so game can begin
      $('#name').val('');
      $('#age').val('');
      return false;
    });
});
