// Main function
$(window).load(function(){
	// create a new priority queue
	var PQ = new PriorityQueue();
	var node;

	// add nodes in reverse order
	$('#output').append("<h3>Input</h3><br>");
	for(var i = 25; i > 0; i--){
		node = {cost: i};
		$(function(){
			$('#output').append((node.cost + ", "));
			PQ.Enqueue(node);}
		);
	}

	// nodes should come out in order from 1 to 25
	$('#output').append("<h3>Output</h3><br>");
	var i = 1;
	while(! PQ.IsEmpty()){
		$(function(){
			var current = PQ.Dequeue().cost;
			if(current != i)
				$('#error').append((current + " != " + i));
			$('#output').append((current + ", "));
			i++;
		});
	}
});