var net = require('net'),
    _ = require('underscore');

var HOST = '25.220.91.24',
//var HOST = '127.0.0.1',
    PORT = 8444;

var players = [];

// Create a server instance, and chain the listen function to it
// The function passed to net.createServer() becomes the event handler for the 'connection' event
// The sock object the callback function receives UNIQUE for each connection
net.createServer(function (sock) {
    players.push(sock);
    // We have a connection - a socket object is assigned to the connection automatically
    console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);

    // Add a 'data' event handler to this instance of socket
    sock.on('data', function (data) {
        console.log('DATA ' + sock.remoteAddress + ': ' + data);
        players.forEach(function (player) {
            if (player != sock) {
                player.write('DATA ' + sock.remoteAddress + ': ' + data);
            }
        });
    });

    // Add a 'close' event handler to this instance of socket
    sock.on('close', function (data) {
        console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
        players = _.reject(players, function (element) {
            return element == sock;
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

setInterval(function () {
    players.forEach(function(player) {
        player.write('Test message!');    
    });
}, 10000);