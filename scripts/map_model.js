// INVARIANT: Walls, obstacles, etc. have a cost of 255. If something is fast enough to go through them, then raise this amount
// constructor for a MapModel
function MapModel(mapstats){
	this.width = mapstats.width;
	this.height = mapstats.height;
	this.costMatrix = mapstats.costMatrix;
	this.EnumerateEdges();
	this.CharacterList = mapstats.CharacterList;
	this.SelectedCharacter = null;

	// initialize the map of obstacles that block movement
	var that = this;
	that.ObstacleMap = new Array(that.width);
	for(var i = 0; i < that.width; i++){
		that.ObstacleMap[i] = new Array(that.height);
		for(var j = 0; j < that.height; j++){
			that.ObstacleMap[i][j] = null;
		}
	}

	// set the model for each character in the list to this
	for(var key in that.CharacterList){
		var actor = that.CharacterList[key];
		actor.model = that;
		that.ObstacleMap[actor.x][actor.y] = actor;
	}

	// find the paths from the current starting point
	this.FindPaths();
	this.FindAttackPaths();
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

// sets the origin to find all paths from
MapModel.prototype.SetOrigin = function(param){
	// clear existing arrows from the view
	this.View.ClearArrows();
	
	// move this character's location in the obstacle map
	this.ObstacleMap[this.SelectedCharacter.x][this.SelectedCharacter.y] = null;
	this.ObstacleMap[param.data.x][param.data.y] = this.SelectedCharacter;
	
	// animate the character to their new location
	this.SelectedCharacter.MoveTo({x: param.data.x, y: param.data.y});
}

// selects or deselects a character for their turn
MapModel.prototype.SelectCharacter = function(character){
	// deselect and return if we're just deselecting
	if(character == null){
		this.SelectedCharacter = null;
		this.paths = null;
		this.attackpaths = null;
		this.View.PaintTiles();
		return;
	}

	// otherwise, select the passed-in character and paint their available tiles
	this.SelectedCharacter = character;
	this.FindPaths();
	this.FindAttackPaths();
	this.View.PaintTiles();
}

// enumerates all edges available on this map
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

// returns an associative array with the predecessor for each vertex within attack range
MapModel.prototype.FindAttackPaths = function(){
	// if there are no paths to use, or no characte to move, return
	if (this.paths == null || this.SelectedCharacter == null)
		return;

	var that = this;
	var retVal = new Array();

	// iterate through all vertices in the existing movement path, adding unused vertice within attack range
	// to the return set
	for(var index in that.paths){
		var source = that.paths[index];

		// add attack tiles in a "diamond" shape around the character
		for(var i = -that.SelectedCharacter.attackrange; i <= that.SelectedCharacter.attackrange; i++){ // e.g. ranges from -2 to 0 to 2
			var j = Math.abs(i) - that.SelectedCharacter.attackrange; // e.g. ranges from 0 to -2 to 0

			// if the target isn't already part of the set of movement tiles, then add it to the set of attack tiles
			if(typeof(that.paths[source.x + i + "-" + source.y + j]) == 'undefined'){
				retVal[(source.x + i) + "-" + (source.y + j)] = {x: source.x + i, y: source.y + j};
			}
			if(typeof(that.paths[source.x + i + "-" + source.y - j]) == 'undefined'){
				retVal[(source.x + i) + "-" + (source.y - j)] = {x: source.x + i, y: source.y - j};
			}
		}
	}

	// set the new attackpaths value to the set of attack tiles
	this.attackpaths = retVal;
}

// returns an associative array with the predecessor for each vertex within movement range
MapModel.prototype.FindPaths = function(){
	// if there is no character to move, return
	if (this.SelectedCharacter == null)
		return;

	// use Dijkstra's Algorithm to find which vertices are in range
	var PQ = new PriorityQueue();
	var retVal = new Array();
	var current = this.VertexList[this.SelectedCharacter.x][this.SelectedCharacter.y];
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
		if(current.cost <= that.SelectedCharacter.range){
			// check that the current vertex is not occupied by an enemy or NPC
			var obs = that.ObstacleMap[current.x][current.y];
			if(obs == null || obs.faction == "Friend" || obs.faction == "Ally"){
				// add/update each outgoing edge from this vertex
				$.each(current, function(index, value){
					Update(current, value, that.VertexList[value.x][value.y], PQ);
				});

				// add the current vertex to the list of valid vertices
				retVal[current.x + "-" + current.y] = current;
				retVal[current.x + "-" + current.y].key = current.x + "-" + current.y;
			}
		}
	}

	// set the starting point of the paths set
	retVal.start = {x: this.SelectedCharacter.x, y: this.SelectedCharacter.y};

	// set the new paths value to the array of vertices
	this.paths = retVal;
}

// add vertices to the priority queue if they have not already been, and update their edge costs
function Update(vertex_a, edge, vertex_b, PQ){
	// if predecessor is null, this is the first time this vertex has been added
	if (vertex_b.predecessor == null){
		vertex_b.predecessor = vertex_b;
		PQ.Enqueue(vertex_b);
	}

	// otherwise, just update if possible
	if (vertex_b.cost > vertex_a.cost + edge.cost){
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