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

	// handle end of turn until a UI class is created
	$("#gameboard").on("EndOfTurn", function(){
		// load UI images
		$("#messages").append("<img id='turn_shadow' src='images/blackdot.png'/>");
		$("#messages").append("<img id='enemy_turn' class='middletext' src='images/enemy_turn.png'/>");
		$("#messages").append("<img id='your_turn' class='middletext' src='images/your_turn.png'/>");

		// animate Enemy's Turn message
		$("#turn_shadow").animate({ opacity: 0.7 }, 500, "linear", function(){
			setTimeout(function(){$("#turn_shadow").animate({ opacity: 0 }, 1000, "linear");}, 1000);
		});
		$("#enemy_turn").animate({ opacity: 1}, 500, "linear", function(){
			setTimeout(function(){$("#enemy_turn").animate({ opacity: 0}, 1000, "linear");}, 1000);
		});

		// animate Your Turn message
		setTimeout(function(){
		$("#turn_shadow").animate({ opacity: 0.7 }, 500, "linear", function(){
			setTimeout(function(){$("#turn_shadow").animate({ opacity: 0 }, 1000, "linear");}, 1000);
		});
		$("#your_turn").animate({ opacity: 1}, 500, "linear", function(){
			setTimeout(function(){$("#your_turn").animate({ opacity: 0}, 1000, "linear");}, 1000);
		});}, 3000);

		setTimeout(function(){		
		// activate all characters for the next turn
		for(var key in that.map.MapModel.CharacterList){
			that.map.MapModel.CharacterList[key].NextTurn();
		}}, 5500);
	});
};

// returns a string of the HTML needed to create an image with the given source
function imageHTML(src){
	return "<img src='	images/" + src + "'/>";
}