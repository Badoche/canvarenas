var DIRECTION = {
	"BAS"    : 0,
	"GAUCHE" : 1,
	"DROITE" : 2,
	"HAUT"   : 3
}

var TYPEID = {
	"PLAYER" : 0,
	"CREATURE" : 1
}

var DUREE_ANIMATION = 4;
var DUREE_DEPLACEMENT = 5;

function Personnage(url, x, y, direction, life , typeid) {
	this.x = x; // (en cases)
	this.y = y; // (en cases)
	this.life = life; // Nombre de pv
	this.direction = direction;// Direction du personnage
	this.etatAnimation = -1;// -1 = ne bouge pas
	this.typeid = typeid;
	this.attackStart = false; // Animation attack or not
	
	// Chargement de l'image dans l'attribut image
	this.image = new Image();
	this.image.referenceDuPerso = this;
	this.image.onload = function() {
		if(!this.complete) 
			throw "Erreur de chargement du sprite nommé \"" + url + "\".";
		
		// Taille du personnage
		switch(url)
		{
			case "loup-garou.png" :
			case "exemple.png" :
				this.referenceDuPerso.largeur = this.width / 4;
				this.referenceDuPerso.hauteur = this.height / 4;
			break;

			case "template.png":
				this.referenceDuPerso.largeur = this.width / 20;
				this.referenceDuPerso.hauteur = this.height / 4;
			break;
		}
	}
	this.image.src = "sprites/" + url;

	this.imageLife = new Image();
	this.imageLife.src = "sprites/heart.png";
}


Personnage.prototype.dessinerPersonnage = function(context) {
	var frame = 0; // Numéro de l'image à prendre pour l'animation
	var decalageX = 0, decalageY = 0; // Décalage à appliquer à la position du personnage
	if(this.etatAnimation >= DUREE_DEPLACEMENT) {
		// Si le déplacement a atteint ou dépassé le temps nécéssaire pour s'effectuer, on le termine
		this.etatAnimation = -1;
		// On stop l'attack si besoin
		if(this.attackStart == true)
			this.attackStart = false;
	} else if(this.etatAnimation >= 0) {
		// On calcule l'image (frame) de l'animation à afficher
		frame = Math.floor(this.etatAnimation / DUREE_ANIMATION);
		if(frame > 3) {
			frame %= 4;
		}
		
		// Nombre de pixels restant à parcourir entre les deux cases

		if(this.attackStart == true)
			var pixelsAParcourir = 152 - (40 * (this.etatAnimation / DUREE_DEPLACEMENT));
		else
			var pixelsAParcourir = 32 - (32 * (this.etatAnimation / DUREE_DEPLACEMENT));
		
		// À partir de ce nombre, on définit le décalage en x et y.
		if(this.direction == DIRECTION.HAUT) {
			decalageY = pixelsAParcourir;
		} else if(this.direction == DIRECTION.BAS) {
			decalageY = -pixelsAParcourir;
		} else if(this.direction == DIRECTION.GAUCHE) {
			decalageX = pixelsAParcourir;
		} else if(this.direction == DIRECTION.DROITE) {
			decalageX = -pixelsAParcourir;
		}
		
		// On incrémente d'une frame
		this.etatAnimation++;
	}
	/*
	 * Si aucune des deux conditions n'est vraie, c'est qu'on est immobile, 
	 * donc il nous suffit de garder les valeurs 0 pour les variables 
	 * frame, decalageX et decalageY
	 */
	
	context.drawImage(
		this.image, 
		this.largeur * frame, this.direction * this.hauteur, // Point d'origine du rectangle source à prendre dans notre image
		this.largeur, this.hauteur, // Taille du rectangle source (c'est la taille du personnage)
		// Point de destination (dépend de la taille du personnage)
		(this.x * 32) - (this.largeur / 2) + 16 + decalageX, (this.y * 32) - this.hauteur + 24 + decalageY,
		this.largeur, this.hauteur // Taille du rectangle destination (c'est la taille du personnage)
	);
}

//Gestion visuelle : vie du personnage
Personnage.prototype.setLife = function(context)
{
	// Pas de visu pour les créature
	if(this.typeid != TYPEID.PLAYER)
		return;

	for(i = 0; i < this.life; i++)
	{
		if(context != undefined)
		{
			context.drawImage(
				this.imageLife,
				16 * i,
				1
			);
		}
	}
}

Personnage.prototype.getCoordonneesAdjacentes = function(direction) {
	var coord = {'x' : this.x, 'y' : this.y};
	switch(direction) {
		case DIRECTION.BAS : 
			coord.y++;
			break;
		case DIRECTION.GAUCHE : 
			coord.x--;
			break;
		case DIRECTION.DROITE : 
			coord.x++;
			break;
		case DIRECTION.HAUT : 
			coord.y--;
			break;
	}
	return coord;
}

Personnage.prototype.deplacer = function(direction, map) {
	// On ne peut pas se déplacer si un mouvement est déjà en cours !
	if(this.etatAnimation >= 0) {
		return false;
	}

	// On change la direction du personnage
	this.direction = direction;
		
	// On vérifie que la case demandée est bien située dans la carte
	var prochaineCase = this.getCoordonneesAdjacentes(direction);
	if(prochaineCase.x < 0 || prochaineCase.y < 0 || prochaineCase.x >= map.getLargeur() || prochaineCase.y >= map.getHauteur()) {
		// On retourne un booléen indiquant que le déplacement ne s'est pas fait, 
		// Ça ne coute pas cher et ca peut toujours servir
		return false;
	}
	
	// Si une cible est présente sur la prochaine case, on change seulement la direction (gestion collision)
	if(!this.getHostileTarget(map))
	{
		// On commence l'animation
		this.etatAnimation = 1;
			
		// On effectue le déplacement
		this.x = prochaineCase.x;
		this.y = prochaineCase.y;
	}
		
	return true;
}

Personnage.prototype.attack = function(direction, map)
{
	// Pas d'attaque si en déplacement
	if(this.etatAnimation >= 0){
		return false;
	}

	// Check si une cible est disponible
	if(pTarget = this.getHostileTarget(map))
	{
		this.etatAnimation = 1;
		this.attackStart = true;
		// On applique les dégats
		this.dealdamage(pTarget, 1, map);
	}
}

Personnage.prototype.getHostileTarget = function(map)
{
	var prochaineCase = this.getCoordonneesAdjacentes(this.direction);

	//Check si une target est disponible sur la prochaine case
	for(var i = 0; i < map.personnages.length; i++)
	{
		if(map.personnages[i].x == prochaineCase.x && map.personnages[i].y == prochaineCase.y)
		{
			return map.personnages[i];
		}
	}
	return null;
}

Personnage.prototype.dealdamage = function(victim, dmg, map)
{
	// On soustrait la vie de la cible et on kill si besoin
	victim.life -= dmg;
	this.setLife();
	if(victim.life <= 0)
	{
		this.kill(victim , map);	
	}

}

Personnage.prototype.kill = function(victim, map)
{
	// On retire l'objet victim de la liste des personnages présent dans la map
	for(var i = 0; i < map.personnages.length; i++)
	{
		if(map.personnages[i] == victim)
		{
			map.personnages[i] = map.personnages[map.personnages.length - 1];
			map.personnages.pop();
		}
	}	
}