var nma = require( "nma" );
var util = require( "util" );
var ReadWriteStream = require( "godot" ).common.ReadWriteStream;
var NMA = module.exports = function NMA( options ){
  if (!options || !options.key ){
    throw new Error( "options.key is required" );
  }

  ReadWriteStream.call(this);

  this.key     = options.key;
  this.appName = options.appName||"";
  this.interval = options.interval;
  this._last    = 0;


  this.body    = options.body    || "";
  this.subject = options.subject || "Godot error";
  
};

util.inherits( NMA, ReadWriteStream );

//
// ### function write (data)
// #### @data {Object} JSON to send email with
// Sends an email with the specified `data`.
//
NMA.prototype.write = function (data) {
  var text = JSON.stringify(data, null, 2),
      self = this;

  //
  // Return immediately if we have sent an email
  // in a time period less than `this.interval`.
  //
  if( this.interval && this._last &&
     ((new Date()) - this._last) <= this.interval ){
    return;
  }
  //return console.dir( data );
  nma(
    this.key,
    this.appName + "-" + data.service,
    data.state,
    this.body + "\n\n" + text,
    data.metric
  );
  this._last = new Date();
  // nma has no callback, i've already forked, should create PR
  
  self.emit("data", data);
};