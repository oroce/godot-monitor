/*
 * wait.js: wait for x milliseconds before forwaring the event
 * it can be useful to prevent sending x trillion email
 * 
 */

var util = require( "util" );
var ReadWriteStream = require( "godot" ).common.ReadWriteStream;
var Wait = module.exports = function Wait( wait ){
  ReadWriteStream.call(this);

  this.wait = wait || 1000 * 5;
  this.waiting = false;
  this.run();
};

util.inherits(Wait, ReadWriteStream);

Wait.prototype.write = function( data ){
  this.last = data;
};

Wait.prototype.run = function(){
  clearTimeout( this.runTimeout );

  this.runTimeout = setTimeout(function(){
    if( this.last ){
      this.emit( "data", this.last );
    }
    this.run();
  }.bind( this ), this.wait );
};