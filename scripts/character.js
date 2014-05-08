// instantiates a Character class object
function Character(stats){
	this.id = stats.id;
	this.x = stats.x;
	this.y = stats.y;
	this.range = stats.range;
	this.attackrange = stats.attackrange;
	this.img = stats.img;
	this.selected = false;
	this.faction = stats.faction;
	
	// draw the character on the page
	this.element = $('<img id="' + this.id + '" src="images/' + this.img + '" class="character">');
	$("#characters").append(this.element);
	
	// position the character on the page
	this.element.css({left: (8 + this.x * 50) + "px", top: (8 + this.y * 50) + "px"});

	// add this character's onclick event
	this.element.click(function(){this.Select();}.bind(this));
}

// moves the Character to a specified grid location
Character.prototype.MoveTo = function(param){
	var paths = this.model.paths;
	var index = param.x + "-" + param.y;
	var anim_path = new Array();

	// add the destination
	anim_path.push(paths[index]);

	// add the stops on the way to the destination
	while (paths[index].predecessor != paths[index]){
		anim_path.push(paths[index]);
		index = paths[index].predecessor.key;
	}
	var i = anim_path.length;
	
	// animate the character to the new position
	this.MoveStep(anim_path, i-1);
}

// moves the character a single step towards the destination
Character.prototype.MoveStep = function(arr, i){
	// if the index is less than zero, return
	if(i < 0){
		// find the new paths from this location
		this.model.FindPaths();
		this.model.FindAttackPaths();

		// repaint the view
		this.model.View.PaintTiles();
		return;
	}

	// set movement variables
	var dx = arr[i].x - this.x;
	var dy = arr[i].y - this.y;
	
	// set the new position
	this.x = arr[i].x;
	this.y = arr[i].y;
	
	// animate the character to the new position
	var that = this;
	this.element.animate({ left: ("+=" + 50 * dx), top: ("+=" + 50 * dy) }, 100, "linear", function(){that.MoveStep(arr, i-1)});

}

// selects this character and sets up the map to show available moves
Character.prototype.Select = function(){
	// if this character isn't a friend, it can't be selected
	if(this.faction != "Friend")
		return;

	// toggle this character's selection status, and update the model to show it
	if(this.selected){
		this.Deselect();
	} else {
		this.selected = true;
		this.model.SelectCharacter(this);
	}
}

// deselects this character and clears the map of tiles and arrows
Character.prototype.Deselect = function(){
	this.selected = false;
	this.model.SelectCharacter(null);
}