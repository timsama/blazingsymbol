// INVARIANT: Walls, obstacles, etc. have a cost of 255. If something is fast enough to go through them, then raise this amount
// constructor for a MapModel
function MapModel(mapstats){
	this.width = mapstats.width;
	this.height = mapstats.height;
	this.costMatrix = mapstats.costMatrix;
	this.EnumerateEdges();

	// to be moved into Character eventually
	this.range = 7;
	this.attackrange = 1;
	this.origin_x = mapstats.origin_x;
	this.origin_y = mapstats.origin_y;
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
	this.origin_x = param.data.x;
	this.origin_y = param.data.y;
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
MapModel.prototype.FindAttackPaths = function(paths){
	var that = this;
	var retVal = new Array();

	// iterate through all vertices in the existing movement path, adding unused vertice within attack range
	// to the return set
	for(var index in paths){
		var source = paths[index];

		// handle attacks to the northwest
		for(var i = -that.attackrange; i <= that.attackrange; i++){ // e.g. ranges from -2 to 0 to 2
			var j = Math.abs(i) - that.attackrange; // e.g. ranges from 0 to -2 to 0

			// if the target isn't already part of the set of movement tiles, then add it to the set of attack tiles
			if(typeof(paths[source.x + i + "-" + source.y + j]) == 'undefined'){
				retVal[(source.x + i) + "-" + (source.y + j)] = {x: source.x + i, y: source.y + j};
			}
			if(typeof(paths[source.x + i + "-" + source.y - j]) == 'undefined'){
				retVal[(source.x + i) + "-" + (source.y - j)] = {x: source.x + i, y: source.y - j};
			}
		}
	}

	// return the set of attack tiles
	return retVal;
}

// returns an associative array with the predecessor for each vertex within movement range
MapModel.prototype.FindPaths = function(){
	// use Dijkstra's Algorithm to find which vertices are in range
	var PQ = new PriorityQueue();
	var retVal = new Array();
	var current = this.VertexList[this.origin_x][this.origin_y];
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
	retVal.start = {x: this.origin_x, y: this.origin_y};

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