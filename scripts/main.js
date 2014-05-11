var battle;

$(function() {
	PreloadUI();
	battle = new Battle();
});

// adds HTML to preload every image used to prevent loading when images are needed
function PreloadUI(){
	var preloadHTML = "";

	// preload UI elements
	preloadHTML += imageHTML("your_turn.png");
	preloadHTML += imageHTML("enemy_turn.png");

	// load the images into the page
	$("#preload").append(preloadHTML);
}