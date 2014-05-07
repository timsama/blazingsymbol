// gives first in, first out behavior, except that lower cost items go to the front of the line
function PriorityQueue(){
	this.heap = new MinHeap();
};

// adds a value to the Priority Queue
PriorityQueue.prototype.Enqueue = function(x) {
	this.heap.Add(x);
};

// gives the next value in the Priority Queue
PriorityQueue.prototype.Dequeue = function() {
	return this.heap.DeleteMin();
};

// returns true if Priority Queue is empty
PriorityQueue.prototype.IsEmpty = function() {
	return this.heap.IsEmpty();
};

// represents a minimum heap
function MinHeap(){
	this.maxIndex = -1;
	this.arr = {};
};

// returns true if heap is empty
MinHeap.prototype.IsEmpty = function() {
	return this.maxIndex == -1;
};

// percolates values up through the heap
MinHeap.prototype.PercolateUp = function() {
	// if there is nothing to percolate, return
	if (this.maxIndex < 1)
		return;

	// get the parent of the item that has just been added
	var currentIndex = this.maxIndex;
	var parentIndex = Math.floor(currentIndex / 2);
	
	// keep percolating up until the parent's cost is less than the current item
	while(this.arr[parentIndex].cost > this.arr[currentIndex].cost){
		// compare this item to its sibling, keeping the smaller of the two
		if(typeof this.arr[parentIndex * 2 + 1] != 'undefined'){
			currentIndex = (this.arr[parentIndex * 2].cost <= this.arr[parentIndex * 2 + 1].cost) ? parentIndex * 2: parentIndex * 2 + 1;
		}

		// compare the smaller item to its parent; swap if parent is smaller
		if(this.arr[currentIndex].cost < this.arr[parentIndex].cost)
			this.Swap(currentIndex, parentIndex);

		// keep percolating up if needed
		currentIndex = parentIndex;
		parentIndex = Math.floor(currentIndex / 2);
	}
};

// percolates values down through the heap
MinHeap.prototype.PercolateDown = function() {
	var i = 0;

	while(i * 2 < this.maxIndex){
		// compare this item's children, keeping the smaller of the two
		var smallerIndex = i * 2;
		if(typeof this.arr[i * 2 + 1] != 'undefined'){
			smallerIndex = (this.arr[i * 2].cost <= this.arr[i * 2 + 1].cost) ? i * 2: i * 2 + 1;
		}

		// compare the smaller item to its parent; swap if parent is larger. If parent is smaller, we're done
		if(this.arr[smallerIndex].cost < this.arr[i].cost){
			this.Swap(smallerIndex, i);
			i = smallerIndex;
		} else {
			return;
		}
	}
};

// removes the minimum item and returns it
MinHeap.prototype.DeleteMin = function() {
	// save the min value to return
	var retVal = this.arr[0];

	// put the largest item at the top, then percolate it down
	this.Swap(0, this.maxIndex);
	this.maxIndex--;
	this.PercolateDown();

	// return the min value
	return retVal;
};

// adds a new item to the heap
MinHeap.prototype.Add = function(x){
	// put this item at the bottom of the heap, then percolate up
	this.maxIndex++;
	this.arr[this.maxIndex] = x;
	this.PercolateUp();
}

// swaps two array values
MinHeap.prototype.Swap = function(index1, index2) {
	var temp = this.arr[index1];
	this.arr[index1] = this.arr[index2];
	this.arr[index2] = temp;
};