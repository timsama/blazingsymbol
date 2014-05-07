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
		,[1,1,1,1,1,1,1,1,1,255,255,255,255]],
		origin_x: 13, origin_y: 10
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