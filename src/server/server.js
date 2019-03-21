var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set('view engine', 'hbs');
app.set('views', 'src');

app.get('/', function(req, res) {
    res.render('index.hbs');
});

io.on('connection', function(socket) {
    io.emit('some event', { for: 'everyone' });
    socket.on('disconnect', function() {
        console.log('user disconnected');
    });
});

io.on('connection', function(socket) {
    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
    });
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});