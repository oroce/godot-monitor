var sendmail = require( "sendmail" );
var util = require( "util" );
var ReadWriteStream = require( "godot" ).common.ReadWriteStream;
var Email = module.exports = function Email( options ){
  if (!options || !options.from || !options.to ){
    throw new Error( "options.from and options.to are required" );
  }

  ReadWriteStream.call(this);

  this.from     = options.from;
  this.to       = options.to;
  this.interval = options.interval;
  this._last    = 0;


  this.body    = options.body    || "";
  this.subject = options.subject || "Godot error";
  this.client  = options.client  || sendmail();
};

util.inherits(Email, ReadWriteStream);

//
// ### function write (data)
// #### @data {Object} JSON to send email with
// Sends an email with the specified `data`.
//
Email.prototype.write = function( data ){
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

  this.client({
    to:      this.to,
    from:    this.from,
    subject: this.subject,
    content:    this.body + "\n\n" + text
  }, function( err ){
    self._last = new Date();

    return err ?
      self.emit( "error", err )
      : self.emit( "data", data );
  });
};