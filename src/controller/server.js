var socketio = require('socket.io');
var p2pserver = require('socket.io-p2p-server').Server;
var express = require('express');
var http = require('http');

var app = express();
var server = http.createServer({}, app)
var io = socketio(server);

io.use(p2pserver)
io.on('connection', function(socket){
	socket.on('peer-msg', function (data) {
		console.log('Message from peer: %s', data)
		socket.broadcast.emit('peer-msg', data)
	})

	socket.on('go-private', function (data) {
		socket.broadcast.emit('go-private', data)
	});
}