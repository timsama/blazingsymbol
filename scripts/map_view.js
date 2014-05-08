// constructor for an MapView
function MapView(mapstats){
	this.width = mapstats.width;
	this.height = mapstats.height;
	this.MapModel = new MapModel(mapstats);
	this.MapModel.View = this;
	this.mapimage = mapstats.mapimage;

	// draw the tiles for the first time
	this.DrawTiles();
	this.PaintTiles();
};

// sets a new location to draw arrows from
MapView.prototype.SetOrigin = function(param){
	// check if the new origin is within the set of accessible tiles
	if(this.MapModel.paths == null || typeof(this.MapModel.paths[param.data.x + "-" + param.data.y]) == 'undefined')
		return;

	// set the new origin
	this.MapModel.SetOrigin(param);
}

// creates the tiles that outline locations on the map
MapView.prototype.DrawTiles = function(){
	// initialize the gameboard HTML string
	var gameboardString = "";
	
	// add tile images for each row and column value
	for(var j = 0; j < this.height; j++){
		for(var i = 0; i < this.width; i++){
			// Add an image to the gameboard containing a tile
			gameboardString = gameboardString + '<div class="tint" id="tint' + i + '_' + j + '"><img src="images/grid.png" id="tile' + i + '_' + j + '" class="tile"/></div>';
		}
		
		// add a line break after each row of tiles
		gameboardString = gameboardString + '<br/>\n';
	}
	
	// add the generated HTML to the gameboard
	$("#gameboard").append(gameboardString);
	
	// add animation functions to each tile
	for(var j = 0; j < this.height; j++){
		for(var i = 0; i < this.width; i++){
			this.CreateTile({x:i, y:j});
		}
	}
};

// create the animation options for a tile
MapView.prototype.CreateTile = function(param){
	$("#tile" + param.x + "_" + param.y).mouseover({x: param.x, y: param.y}, DrawPath).mouseup({x: param.x, y: param.y}, SetOrigin);
};

// displays a tile as available to be moved to
MapView.prototype.PaintMoveTile = function(param){
	$("#tile" + param.x + "_" + param.y).addClass("transparent");
	$("#tint" + param.x + "_" + param.y).addClass("available");
};

// displays a tile as available to be attacked
MapView.prototype.PaintAttackTile = function(param){
	$("#tile" + param.x + "_" + param.y).addClass("transparent");
	$("#tint" + param.x + "_" + param.y).addClass("attackable");
};

// paints all tiles available to be moved to or attacked
MapView.prototype.PaintTiles = function(){
	// remove existing arrows
	this.ClearArrows();

	// remove all existing tints
	$('.transparent').removeClass('transparent');
	$('.available').removeClass('available');
	$('.attackable').removeClass('attackable');

	// draw the accessible tiles
	for(var tile in this.MapModel.paths){
		this.PaintMoveTile(this.MapModel.paths[tile]);
	}

	// draw the attackable tiles
	for(var tile in this.MapModel.attackpaths){
		this.PaintAttackTile(this.MapModel.attackpaths[tile]);
	}
};

// draws an arrow from a character to a location, following the given path
MapView.prototype.DrawPath = function(end){
	// if the arrow is already pointing here, don't redraw
	if(end.data.x == this.end_x && end.data.y == this.end_y)
		return;

	// otherwise, set the new endpoint to the input
	this.end_x = end.data.x;
	this.end_y = end.data.y;

	// if the destination is not in the paths set, don't draw anything new
	var index = end.data.x + "-" + end.data.y;
	var prev = index;
	if(this.MapModel.paths == null || typeof(this.MapModel.paths[index]) == 'undefined')
		return;

	// clear existing arrows out
	$("div[id='arrows']").empty();

	// draw the arrowhead
	this.drawend(this.MapModel.paths[index].predecessor, this.MapModel.paths[index]);

	// draw the arrow body
	while (this.MapModel.paths[index].predecessor != this.MapModel.paths[index]){
		this.drawmid(this.MapModel.paths[index].predecessor, this.MapModel.paths[index], this.MapModel.paths[prev], index);
		prev = index;
		index = this.MapModel.paths[index].predecessor.key;
	}

	// draw the arrow beginning
	this.drawstart(this.MapModel.paths[index], this.MapModel.paths[prev]);
}

// draws the start of an arrow showing the path
MapView.prototype.drawstart = function(here, next){
	// draw the appropriate-facing starting stub
	if(here.x < next.x){
		$("div[id='arrows']").append('<img src="images/right_stub.png" class="midlayer" id="pathstart">');
	} else if (here.x > next.x){
		$("div[id='arrows']").append('<img src="images/left_stub.png" class="midlayer" id="pathstart">');
	} else if(here.y < next.y){
		$("div[id='arrows']").append('<img src="images/down_stub.png" class="midlayer" id="pathstart">');
	} else if (here.y > next.y){
		$("div[id='arrows']").append('<img src="images/up_stub.png" class="midlayer" id="pathstart">');
	}
	
	// move the arrow piece into place
	$("#pathstart").css({position: "absolute", left: (8 + here.x * 50) + "px", top: (8 + here.y * 50) + "px"});
	
	// add click and mouseover functionality to prevent blocking by the arrow image
	//$("#pathstart").mouseup({xpath:view.displaypath.x, ypath:view.displaypath.y, currentx: here.x, currenty: here.y, i:0}, followPath).mouseover({x:here.x, y:here.y}, addtopath);
	$("#pathstart").mouseover({x:here.x, y:here.y}, DrawPath).mouseup({x:here.x, y:here.y}, SetOrigin);
}

// draws mid-sections of an arrow delineating the path
MapView.prototype.drawmid = function(prev, here, next, index){
	// determine the type of segment to draw and draw it
	if(here.x < next.x){
		// leaving to the right
		if(prev.x < here.x){
		// entering from the left
			$("div[id='arrows']").append('<img src="images/horizontal_line.png" class="midlayer" id="arrow' + index + '">');
		} else if (prev.y > here.y) {
		// entering from the bottom
			$("div[id='arrows']").append('<img src="images/u_l_corner.png" class="midlayer" id="arrow' + index + '">');
		} else if (prev.y < here.y) {
		// entering from the top
			$("div[id='arrows']").append('<img src="images/b_l_corner.png" class="midlayer" id="arrow' + index + '">');
		}
	} else if (here.x > next.x){
		// leaving to the left
		if(prev.x > here.x){
		// entering from the right
			$("div[id='arrows']").append('<img src="images/horizontal_line.png" class="midlayer" id="arrow' + index + '">');
		} else if (prev.y > here.y) {
		// entering from the bottom
			$("div[id='arrows']").append('<img src="images/u_r_corner.png" class="midlayer" id="arrow' + index + '">');
		} else if (prev.y < here.y) {
		// entering from the top
			$("div[id='arrows']").append('<img src="images/b_r_corner.png" class="midlayer" id="arrow' + index + '">');
		}
	} else if(here.y < next.y){
		// leaving downward
		if(prev.x < here.x){
		// entering from the left
			$("div[id='arrows']").append('<img src="images/u_r_corner.png" class="midlayer" id="arrow' + index + '">');
		} else if (prev.x > here.x) {
		// entering from the right
			$("div[id='arrows']").append('<img src="images/u_l_corner.png" class="midlayer" id="arrow' + index + '">');
		} else if (prev.y < here.y) {
		// entering from the top
			$("div[id='arrows']").append('<img src="images/vertical_line.png" class="midlayer" id="arrow' + index + '">');
		}
	} else if (here.y > next.y){
		// leaving upward
		if(prev.x < here.x){
		// entering from the left
			$("div[id='arrows']").append('<img src="images/b_r_corner.png" class="midlayer" id="arrow' + index + '">');
		} else if (prev.x > here.x) {
		// entering from the right
			$("div[id='arrows']").append('<img src="images/b_l_corner.png" class="midlayer" id="arrow' + index + '">');
		} else if (prev.y > here.y) {
		// entering from the bottom
			$("div[id='arrows']").append('<img src="images/vertical_line.png" class="midlayer" id="arrow' + index + '">');
		}
	}
	
	// move the arrow piece into place
	$("#arrow" + index).css({position: "absolute", left: (8 + here.x * 50) + "px", top: (8 + here.y * 50) + "px"});
	
	// add click and mouseover functionality to prevent blocking by the arrow image
	//$("#arrow" + index).mouseup({xpath:view.displaypath.x, ypath:view.displaypath.y, currentx: here.x, currenty: here.y, i:0}, followPath).mouseover({x:here.x, y:here.y}, addtopath);
	$("#arrow" + index).mouseover({x:here.x, y:here.y}, DrawPath).mouseup({x:here.x, y:here.y}, SetOrigin);
}

// draws an arrow at the end of the path
MapView.prototype.drawend = function(prev, here){
	// determine the direction of the arrow to draw and draw it
	if(prev.x < here.x){
		$("div[id='arrows']").append('<img src="images/right_arrow.png" class="midlayer" id="pathend">');
	} else if (prev.x > here.x){
		$("div[id='arrows']").append('<img src="images/left_arrow.png" class="midlayer" id="pathend">');
	} else if(prev.y < here.y){
		$("div[id='arrows']").append('<img src="images/down_arrow.png" class="midlayer" id="pathend">');
	} else if (prev.y > here.y){
		$("div[id='arrows']").append('<img src="images/up_arrow.png" class="midlayer" id="pathend">');
	}
	
	// move the arrow piece into place
	$("#pathend").css({position: "absolute", left: (8 + here.x * 50) + "px", top: (8 + here.y * 50) + "px"});
	
	// add click and mouseover functionality to prevent blocking by the arrow image
	//$("#pathend").mouseup({xpath:view.displaypath.x, ypath:view.displaypath.y, currentx: here.x, currenty: here.y, i:0}, followPath).mouseover({x:here.x, y:here.y}, addtopath);
	$("#pathend").mouseover({x:here.x, y:here.y}, DrawPath).mouseup({x:here.x, y:here.y}, SetOrigin);
}

// clears all currently-drawn arrows
MapView.prototype.ClearArrows = function(){
	$("div[id='arrows']").empty();
}

// static helper method for mouseover events to call to draw a path
function DrawPath(end){
	map.DrawPath(end);
}

// static helper method for mouseup events to set a new path starting point
function SetOrigin(param){
	map.SetOrigin(param);
}