var battle;

$(function() {
	PreloadUI();
	battle = new Battle();
});

// adds HTML to preload every image used to prevent loading when images are needed
function PreloadUI(){
	var preloadHTML = "";

	// preload UI elements
	preloadHTML += imageHTML("gameover.png");
	preloadHTML += imageHTML("grid.png");
	preloadHTML += imageHTML("keysnow.png");
	preloadHTML += imageHTML("playagain.png");
	preloadHTML += imageHTML("tryagain.png");
	preloadHTML += imageHTML("you win.png");
	preloadHTML += imageHTML("title.png");	

	// load the images into the page
	$("#preload").append(preloadHTML);
}