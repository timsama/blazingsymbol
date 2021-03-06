// instantiates a Character class object
function Character(stats){
	this.id = stats.id;
	this.x = stats.x;
	this.y = stats.y;
	this.radius = stats.radius;
	this.range = stats.range;
	this.selected = "No";
	this.img = stats.img;
	this.hasKey = "Yes";
	
	// draw the character on the page
	this.element = $('<img id="' + this.id + '" src="images/' + this.img + '" class="character">');
	$("#characters").append(this.element);
	
	// position the character on the page
	this.element.css({left: (8 + this.x * 50) + "px", top: (8 + this.y * 50) + "px"});

	// add this character's onclick event
	this.element.click(function(){this.select();}.bind(this));
}

// moves the Character to a specified grid location
Character.prototype.moveTo = function(param){
	// set movement variables
	var dx = param.x - this.x;
	var dy = param.y - this.y;
	
	// set the new position
	this.x = param.x;
	this.y = param.y;
	
	// animate the character to the new position
	this.element.animate({ left: ("+=" + 50 * dx), top: ("+=" + 50 * dy) }, 150, "linear");
}

// selects this character and sets up the map to show available moves
Character.prototype.select = function(){
	if(this.selected == "Yes"){
		this.deselect();
		clearTiles();
		removeKey();
	} else {
		this.selected = "Yes";
		model.selectedcharacter = this;
		paintTiles(this, "Yes");
	}
}

// deselects this character and clears the map of tiles and arrows
Character.prototype.deselect = function(){
	this.selected = "No";
	model.selectedcharacter = null;
	$("#arrows").empty();
}