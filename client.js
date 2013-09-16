/* jshint expr: true*/
var
  godot = require( "godot" ),
  Producer = godot.producer.Producer,
  util = require( "util" ),
  request = require( "request" ),
  HTTPCheck = function( options ){
    options || ( options = {} );
    Producer.apply( this, arguments );
    this.url = options.url;
    this.timeout = options.timeout;
  };
util.inherits( HTTPCheck, Producer );
HTTPCheck.prototype.produce = function(){
  request( this.url, {
    timeout: this.timeout
  },function( err ){
    var data = {
      host:        this.values.host,
      service:     this.values.service,
      state:       err?"critical":"ok",
      time:        Date.now(),
      description: this.values.description,
      tags:        this.values.tags,
      metric:      this.values.metric,
      ttl:         this.values.ttl
    };
    this.emit("data", data);
  }.bind( this ));
};

godot.createClient({
  type: "udp",
  producers: [
    new HTTPCheck({
      host: "localhost",
      service: "elviraapi/index/check",
      ttl: 1000*60*2,
      url: "http://apiv2.oroszi.net/",
      timeout: 2*1000
    }),
    new HTTPCheck({
      host: "localhost",
      service: "elviraapi/bp-szeged/check",
      ttl: 1000*60*5,
      url: "http://apiv2.oroszi.net/elvira?from=budapest&to=szeged",
      timeout: 1000*20
    })
  ],
  reconnect: {
    type: "exponential",
    maxTries: 20,
    initialDelay: 100,
    maxDelay: 300
  }
}).connect( 1337 );