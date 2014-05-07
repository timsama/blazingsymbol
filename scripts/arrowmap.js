	var map;

	// "constructor" function for the page
	$(function() {
		// preload images
		preload();

		map = new MapView({width: 20, height: 13, costMatrix:
			[[255,255,255,1,255,1,1,1,1,1,1,1,1]
			,[255,255,255,1,1,1,1,255,255,1,1,1,1]
			,[255,255,255,1,1,1,1,255,255,1,1,1,1]
			,[255,255,255,1,1,1,1,255,255,1,1,1,1]
			,[255,255,255,1,1,1,255,255,255,1,1,1,1]
			,[255,255,255,1,1,1,1,1,1,1,1,1,1]
			,[255,1,1,255,1,1,1,1,1,1,255,1,1]
			,[255,1,1,1,1,1,1,1,1,1,1,1,1]
			,[1,1,1,1,255,1,1,1,1,1,1,1,1]
			,[1,1,1,1,1,1,1,1,1,1,1,1,1]
			,[1,1,1,1,1,1,255,255,1,1,1,1,1]
			,[1,1,1,1,1,1,255,255,1,1,1,1,1]
			,[1,1,1,1,1,1,1,1,1,1,1,1,255]
			,[1,1,1,1,1,1,1,1,255,255,1,255,255]
			,[1,1,1,1,1,1,1,1,255,255,1,255,255]
			,[1,255,1,1,1,1,1,1,1,255,1,255,255]
			,[1,1,1,1,1,1,1,1,1,1,255,255,255]
			,[1,1,1,1,1,1,1,1,1,255,255,255,255]
			,[1,1,1,1,1,1,1,1,1,255,255,255,255]
			,[1,1,1,1,1,1,1,1,1,255,255,255,255]]
		});

		// create the map
		$("#map").append("<img id='mapimage' src='images/stormwatchmap.jpg'>");
		$("#map").append("<img id='cloudimage' class='cloudimage' src='images/clouds.png'>");
	});

	// adds HTML to preload every image used to prevent loading when images are needed
	function preload(){
		var preloadHTML = "";

		// preload arrow corners
		preloadHTML = preloadHTML + imageHTML("b_l_corner.png");
		preloadHTML = preloadHTML + imageHTML("b_r_corner.png");
		preloadHTML = preloadHTML + imageHTML("u_l_corner.png");
		preloadHTML = preloadHTML + imageHTML("u_r_corner.png");

		// preload arrow heads
		preloadHTML = preloadHTML + imageHTML("left_arrow.png");
		preloadHTML = preloadHTML + imageHTML("right_arrow.png");
		preloadHTML = preloadHTML + imageHTML("up_arrow.png");
		preloadHTML = preloadHTML + imageHTML("down_arrow.png");

		// preload arrow stubs
		preloadHTML = preloadHTML + imageHTML("left_stub.png");
		preloadHTML = preloadHTML + imageHTML("right_stub.png");
		preloadHTML = preloadHTML + imageHTML("up_stub.png");
		preloadHTML = preloadHTML + imageHTML("down_stub.png");

		// preload arrow lines
		preloadHTML = preloadHTML + imageHTML("horizontal_line.png");
		preloadHTML = preloadHTML + imageHTML("vertical_line.png");

		// preload sprites
		preloadHTML = preloadHTML + imageHTML("character princess girl.png");
		preloadHTML = preloadHTML + imageHTML("chest closed.png");
		preloadHTML = preloadHTML + imageHTML("chest open.png");
		preloadHTML = preloadHTML + imageHTML("key.png");
		preloadHTML = preloadHTML + imageHTML("gem blue.png");
		preloadHTML = preloadHTML + imageHTML("star.png");

		// preload UI elements
		preloadHTML = preloadHTML + imageHTML("gameover.png");
		preloadHTML = preloadHTML + imageHTML("grid.png");
		preloadHTML = preloadHTML + imageHTML("keysnow.png");
		preloadHTML = preloadHTML + imageHTML("playagain.png");
		preloadHTML = preloadHTML + imageHTML("tryagain.png");
		preloadHTML = preloadHTML + imageHTML("you win.png");
		preloadHTML = preloadHTML + imageHTML("title.png");	

		// load the images into the page
		$("#preload").append(preloadHTML);
	}

	// returns a string of the HTML needed to create an image with the given source
	function imageHTML(src){
		return "<img src='	images/" + src + "'/>";
	}

// constructor for an MapView
function MapView(mapstats){
	this.width = mapstats.width;
	this.height = mapstats.height;
	this.MapModel = new MapModel(mapstats);
	this.mapimage = mapstats.mapimage;

	// set the current starting point
	this.origin_x = 14;
	this.origin_y = 10;

	// set the current ending point
	this.end_x = 14;
	this.end_y = 10;

	// find the paths from the current starting point
	this.paths = this.MapModel.FindPaths({x: 14, y: 10}, this.range);

	// draw the tiles for the first time
	this.DrawTiles();
	this.PaintTiles();
};

// sets a new location to draw arrows from
MapView.prototype.SetOrigin = function(param){
	// check if the new origin is within the set of accessible tiles
	if(typeof(this.paths[param.data.x + "-" + param.data.y]) == 'undefined')
		return;

	// set the new origin
	this.origin_x = param.data.x;
	this.origin_y = param.data.y;
	this.paths = this.MapModel.FindPaths({x: param.data.x, y: param.data.y}, this.range);
	this.PaintTiles();
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
MapView.prototype.PaintTile = function(param){
	$("#tile" + param.x + "_" + param.y).addClass("transparent");
	$("#tint" + param.x + "_" + param.y).addClass("available");
};

// paints all tiles available to be moved to or attacked
MapView.prototype.PaintTiles = function(){
	// remove all existing tints
	$('.transparent').removeClass('transparent');
	$('.available').removeClass('available');
	$('.attackable').removeClass('attackable');

	// draw the accessible tiles
	for(var tile in this.paths){
		this.PaintTile(this.paths[tile]);
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
	if(typeof(this.paths[index]) == 'undefined')
		return;

	// clear existing arrows out
	$("div[id='arrows']").empty();

	// draw the arrowhead
	this.drawend(this.paths[index].predecessor, this.paths[index]);

	// draw the arrow body
	while (this.paths[index].predecessor != this.paths[index]){
		this.drawmid(this.paths[index].predecessor, this.paths[index], this.paths[prev], index);
		prev = index;
		index = this.paths[index].predecessor.key;
	}

	// draw the arrow beginning
	this.drawstart(this.paths[index], this.paths[prev]);
}

// static helper method for mouseover events to call to draw a path
function DrawPath(end){
	map.DrawPath(end);
}

// static helper method for mouseup events to set a new path starting point
function SetOrigin(param){
	map.SetOrigin(param);
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


// INVARIANT: Walls, obstacles, etc. have a cost of 255. If something is fast enough to go through them, then raise this amount
// constructor for a MapModel
function MapModel(mapstats){
	this.width = mapstats.width;
	this.height = mapstats.height;
	this.costMatrix = mapstats.costMatrix;
	this.EnumerateEdges();
	this.range = 7;
};

// returns the traversal cost of a single tile in the map
MapModel.prototype.GetCost = function(x, y){
	// make sure coordinate is in bounds
	if((x < 0) || (x >= this.width))
		return 255; // off the map; treat like a wall
	if((y < 0) || (y >= this.height))
		return 255; // off the map; treat like a wall

	// if in bounds, return the cost associated with this tile
	return this.costMatrix[x][y];
};

MapModel.prototype.EnumerateEdges = function() {
	// clear the existing edges from the vertex list
	this.VertexList = new Array(this.width);
	for (i = 0; i < this.width; i++){
		this.VertexList[i] = new Array(this.height);
		for(j = 0; j < this.height; j++){
			this.VertexList[i][j] = new Array();
		}
	}

	// iterate through all tile costs
	for(i = 0; i < this.width; i++){
		for(j = 0; j < this.height; j++){
			// get the weights going in all four directions
			var north = this.GetCost(i, j-1);
			var south = this.GetCost(i, j+1);
			var east = this.GetCost(i+1, j);
			var west = this.GetCost(i-1, j);

			// add to the vertex list if not an obstacle (i.e. weight 255)
			if (north < 255)
				this.VertexList[i][j].push(new Edge({x: i, y: j-1}, north));
			if (south < 255)
				this.VertexList[i][j].push(new Edge({x: i, y: j+1}, south));
			if (east < 255)
				this.VertexList[i][j].push(new Edge({x: i+1, y: j}, east));
			if (west < 255)
				this.VertexList[i][j].push(new Edge({x: i-1, y: j}, west));

			// set this vertex's own cost
			this.VertexList[i][j].x = i;
			this.VertexList[i][j].y = j;
			this.VertexList[i][j].cost = 99;
			this.VertexList[i][j].predecessor = null;
		}
	}
};

// returns an associative array with the predecessor for each vertex within range
MapModel.prototype.FindPaths = function(source, range){
	// use Dijkstra's Algorithm to find which vertices are in range
	var PQ = new PriorityQueue();
	var retVal = new Array();
	var current = this.VertexList[source.x][source.y];
	$.each(this.VertexList, function(key1, val1){
		$.each(val1, function(key2, val2){
			val2.cost = 200;
			val2.predecessor = null;
		})
	});

	current.cost = 0;
	var that = this;

	// initialize the priority queue
	PQ.Enqueue(current);

	// continue to run the Dijkstra's Algorithm until we have exceeded the range we can travel
	while(! PQ.IsEmpty()){
		// get the next vertex
		current = PQ.Dequeue();

		// only get a vertex's outgoing edges if it is within range itself
		if(current.cost <= that.range){
			$.each(current, function(index, value){
				Update(current, value, that.VertexList[value.x][value.y], PQ);
			});

			// add the current vertex to the list of valid vertices
			retVal[current.x + "-" + current.y] = current;
			retVal[current.x + "-" + current.y].key = current.x + "-" + current.y;
		}
	}

	// set the starting point of the paths set
	retVal.start = source;

	// return the array of vertices
	return retVal;
}

// add vertices to the priority queue if they have not already been, and update their edge costs
function Update(vertex_a, edge, vertex_b, PQ){
	// if predecessor is null, this is the first time this vertex has been added
	if (vertex_b.predecessor == null){
		vertex_b.predecessor = vertex_b;
		PQ.Enqueue(vertex_b);
	}

//	if(vertex_b.x == 12 && vertex_b.y == 10)
//		alert("At (" + vertex_b.x + "-" + vertex_b.y + "), Cost: " + vertex_b.cost + " > " + vertex_a.cost + " + " + edge.cost);

	// otherwise, just update if possible
	if (vertex_b.cost > vertex_a.cost + edge.cost){
		//alert("Vertex " + vertex_b.x + "-" + vertex_b.y + ", cost " + vertex_b.cost + " > " + vertex_a.cost + " + " + edge.cost);
		vertex_b.cost = vertex_a.cost + edge.cost;
		vertex_b.predecessor = vertex_a;
	}
}

// represents a directed edge between tiles
function Edge(dest, cost){
	this.x = dest.x;
	this.y = dest.y;
	this.cost = cost;
};