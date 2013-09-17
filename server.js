var
  godot = require( "godot" ),
  mailer = require( "./lib/mail" ),
  winston = require( "winston" ),
  nma = require( "./lib/nma" );
require( "winston-syslog" );
godot.reactor.register( "sendmail", mailer );
godot.reactor.register( "nma", nma );
var logger = new ( winston.Logger )({
  exitOnError: false,
  transports: [
    new ( winston.transports.Console )(),
    new ( winston.transports.Syslog )()
  ]
});

function onError( err ){
  logger.error( "Error occured %s - %s", err.message, err.stack );
}

var server = godot.createServer({
  type: "udp",
  reactors: [
    godot.reactor()
      .where( "service", "elviraapi/*/check" )
      .expire( 1000 * 6 * 3 )
      .change( "state" )
      .console()
      .nma({
        key: process.env.NMA_KEY,
        appName: "",
        body: ""
      })
      .sendmail({from: process.env.FROM, to: process.env.TO})
  ]
});


server
  .on( "error", onError )
  .listen( 1337, function( err ){
    if( !err ){
      logger.info( "Godot server is listening on port %s", server.port  );
    }
  });