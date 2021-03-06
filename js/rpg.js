map = new Map("../maps/premiere");

var joueur = new Personnage("template.png", 7, 14, DIRECTION.BAS, 5, TYPEID.PLAYER);
var joueur2 = new Personnage("loup-garou.png", 7, 13, DIRECTION.BAS, 3, TYPEID.CREATURE);
var joueur3 = new Personnage("loup-garou.png", 7, 10, DIRECTION.BAS, 3, TYPEID.CREATURE);
map.addPersonnage(joueur);
map.addPersonnage(joueur2);
map.addPersonnage(joueur3);

window.onload = function() {
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
	
	canvas.width  = screen.width;
    canvas.height = screen.height;
	
	setInterval(function() {
		map.dessinerMap(ctx);
	}, 40);
	
	// Gestion du clavier
	window.onkeydown = function(event) {
		// On récupère le code de la touche
		var e = event || window.event;
		var key = e.which || e.keyCode;
		
		switch(key) {
			case 38 : case 122 : case 119 : case 90 : case 87 : // Flèche haut, z, w, Z, W
				joueur.deplacer(DIRECTION.HAUT, map);
				break;
			case 40 : case 115 : case 83 : // Flèche bas, s, S
				joueur.deplacer(DIRECTION.BAS, map);
				break;
			case 37 : case 113 : case 97 : case 81 : case 65 : // Flèche gauche, q, a, Q, A
				joueur.deplacer(DIRECTION.GAUCHE, map);
				break;
			case 39 : case 100 : case 68 : // Flèche droite, d, D
				joueur.deplacer(DIRECTION.DROITE, map);
				break;
			case 67: // c = attack
				joueur.attack(joueur.direction, map);
				break;
			case 75:
				joueur.dealdamage(joueur, 1, map);
			break;			
			default : 
				//alert(key);
				// Si la touche ne nous sert pas, nous n'avons aucune raison de bloquer son comportement normal.
				return true;
		}
		
		return false;
	}
}
