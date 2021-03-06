var net = require('net'),
    _ = require('underscore');

var HOST = '25.220.91.24',
//var HOST = '127.0.0.1',
    PORT = 8444;

var players = [],
    playerCounter = 1;

// Create a server instance, and chain the listen function to it
// The function passed to net.createServer() becomes the event handler for the 'connection' event
// The sock object the callback function receives UNIQUE for each connection
net.createServer(function (sock) {
    var playerObject = {};
    playerObject.sock = sock;
    playerObject.id = playerCounter;
    
    // Let the player know his own id.
    sock.write('You are connected with id: ' + playerCounter  + '|');
    playerCounter++;
    
    // Send currently connected players, and let all players know this player did connect.
    // Delay for 5 seconds, to let him start up.
    setTimeout(function() {
        players.forEach(function (player) {
            playerObject.sock.write('Player[' + player.id + ']: CREATE'  + '|');
            console.log('Sending new player id of old player:' + player.id);
            if (player.id != playerObject.id) {
                console.log('Sending old player id of new player:' + playerObject.id);
                player.sock.write('Player[' + playerObject.id + ']: CREATE' + '|');
            }
        });
    }, 5000);
    
    players.push(playerObject);
    
    // We have a connection - a socket object is assigned to the connection automatically
    console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);

    // Add a 'data' event handler to this instance of socket
    sock.on('data', function (data) {
        console.log('Player[' + playerObject.id + ']: ' + data);
        players.forEach(function (player) {
            if (player.id != playerObject.id) {
                player.sock.write('Player[' + playerObject.id + ']: ' + data  + '|');
            }
        });
    });

    // Add a 'close' event handler to this instance of socket
    sock.on('close', function (data) {
        console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
        
        //Let the players know, this id needs to be destroyed.
        players.forEach(function (player) {
            if (player.id != playerObject.id) {
                player.sock.write('Player[' + playerObject.id + ']: DESTROY'  + '|');
            }
        });
        
        players = _.reject(players, function (element) {
            return element.sock == sock;
        });
    });

    sock.on("error", function (err) {
        console.log('Error occured:' + err);
    });
    
}).listen(PORT, HOST);

console.log('Server listening on ' + HOST + ':' + PORT);

setInterval(function () {
    console.log('Players connected: ' + players.length);
}, 60000);