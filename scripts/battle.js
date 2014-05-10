function Battle(){
	var that = this;
	$.getJSON("http://localhost/workspace/BlazingSymbol/maps/stormwatchinn.json", {format: "json"})
		.done(function(data){
			that.map = new MapView(data)
			$("#preload").append(that.map.Preload());
			$("#map").append("<img id='mapimage' src='images/" + that.map.mapimage + "'>");
		})


	// create the cloud effect
	$("#map").append("<img id='cloudimage' class='cloudimage' src='images/clouds.png'>");
};

// returns a string of the HTML needed to create an image with the given source
function imageHTML(src){
	return "<img src='	images/" + src + "'/>";
}