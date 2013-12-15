var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    ent = require('ent'), // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
    fs = require('fs');

// Chargement de la page index.html
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.use("/css", express.static(__dirname + "/css"));
app.use("/js", express.static(__dirname + "/js"));
app.use("/maps", express.static(__dirname + "/maps"));
app.use("/tilesets", express.static(__dirname + "/tilesets"));
app.use("/sprites", express.static(__dirname + "/sprites"));

//Variables accessibles à tous
var characters = new Array();
var messages = new Array();

io.sockets.on('connection', function (socket, pseudo) {
    // Dès qu'on nous donne un pseudo, on le stocke en variable de session et on informe les autres personnes
    socket.on('connexion', function(pseudo) {
        pseudo = ent.encode(pseudo);
        socket.set('pseudo', pseudo);

        console.log(pseudo+' has joined the game.');
        socket.broadcast.emit('getNewMessage', { pseudo : 'System', message : pseudo + ' has joined the game.' });

        // On donne la liste des messages au client
        socket.emit('getMessages', messages);
        console.log(pseudo+' gets the messages array.');

        // On donne la liste des personnages au client
        socket.emit('getCharacters', characters);
        console.log(pseudo+' gets the characters array.');
    });

    // Quand on reçoit un nouveau personnage
    socket.on('addCharacter', function (character) {
        console.log(JSON.stringify(character, null, 2));
        // On l'ajoute au tableau des personnages
        characters.push(character);
        // On renvoie le nouveau tableau
        socket.emit('getCharacters', characters);

        console.log(characters);
    });

    socket.on('getCharacters', function(){
        // On donne la liste des personnages au client
        socket.emit('getCharacter', characters);
        console.log(pseudo+' gets the characters array.');
    });

    // Quand on reçoit un nouveau message
    socket.on('newMessage', function (mess) {
        // On l'ajoute au tableau messages
        messages.push(mess);
        // On envoie à tout les clients connectés le nouveau message
        socket.broadcast.emit('getNewMessage', mess);
    });
});

server.listen(8080);
