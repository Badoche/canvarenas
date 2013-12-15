function Map(nom) {
        // Création de l'objet XmlHttpRequest
        var xhr = getXMLHttpRequest();
                
        // Chargement du fichier
        xhr.open("GET", './maps/' + nom + '.json', false);
        xhr.send(null);
        if(xhr.readyState != 4 || (xhr.status != 200 && xhr.status != 0)) // Code == 0 en local
                throw new Error("Impossible de charger la carte nommée \"" + nom + "\" (code HTTP : " + xhr.status + ").");
        var mapJsonData = xhr.responseText;
        
        // Analyse des données
        var mapData = JSON.parse(mapJsonData);
        this.tileset = new Tileset(mapData.tileset);
        this.terrain = mapData.terrain;
        this.playable = personnages;
        console.log('Constructeur map');
        console.log(personnages);
}

// Pour récupérer la taille (en tiles) de la carte
Map.prototype.getHauteur = function() {
        return this.terrain.length;
}
Map.prototype.getLargeur = function() {
        return this.terrain[0].length;
}

// Pour ajouter un personnage
Map.prototype.refresh = function() {
        socket.emit('getCharacters');

        socket.on('getCharacter', function (characters) {
                this.playable = characters;
                console.log('Map reload :');
                console.log(this.playable);
        });
}

Map.prototype.dessinerMap = function(context) {
        for(var i = 0, l = this.terrain.length ; i < l ; i++) {
                var ligne = this.terrain[i];
                var y = i * 32;
                for(var j = 0, k = ligne.length ; j < k ; j++) {
                        this.tileset.dessinerTile(ligne[j], context, j * 32, y);
                }
        }

        // Dessin des personnages
        for(var i = 0, l = this.playable.length ; i < l ; i++) {
                this.playable[i].dessinerPersonnage(context);
        }
}
