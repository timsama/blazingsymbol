// global variables to represent the model and view
var model = {width: 20, height: 13, pos: {x:0, y:0}, mousepos: {x:0, y:0}, radius: 4, range:1, selectedcharacter: null, goal: {x:14, y:5}};
var view = {enabled: "Yes", redraw: "No", displaypath: {x:[0], y:[0]}};

	
	/* INITIALIZATION FUNCTIONS */

	// "constructor" function for the page
	$(function() {
		// preload images
		preload();

		// create the map
		createTiles();		
		$("#map").append("<img id='mapimage' src='images/stormwatchmap.jpg'>");
		$("#map").append("<img id='cloudimage' class='cloudimage' src='images/clouds.png'>");
		
		// put the treasure chest on the map
		createTreasure();

		// create character(s) to move around the gameboard
		var test = new Character({id:"test", x:2, y:5, radius:3, range:1, selected:"No", img:"character princess girl.png"});

		// display title screen
		titleScreen();
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

		// preload short arrow heads
		preloadHTML = preloadHTML + imageHTML("left_arrow_short.png");
		preloadHTML = preloadHTML + imageHTML("right_arrow_short.png");
		preloadHTML = preloadHTML + imageHTML("up_arrow_short.png");
		preloadHTML = preloadHTML + imageHTML("down_arrow_short.png");

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
		return "<img src='images/" + src + "'/>";
	}

	// creates the tiles that outline locations on the map
	function createTiles(){
		// initialize the gameboard HTML string
		var gameboardString = "";
		
		// add tile images for each row and column value
		for(var j = 0; j < model.height; j++){		
			for(var i = 0; i < model.width; i++){
				// Add an image to the gameboard containing a tile
				gameboardString = gameboardString + '<div class="tint" id="tint' + i + '_' + j + '"><img src="images/grid.png" id="tile' + i + '_' + j + '" class="tile"/></div>';
			}
			
			// add a line break after each row of tiles
			gameboardString = gameboardString + '<br/>\n';
		}
		
		// add the generated HTML to the gameboard
		$("#gameboard").append(gameboardString);
		
		// add animation functions to each tile
		for(var j = 0; j < model.height; j++){
			for(var i = 0; i < model.width; i++){
				createTile({x:i, y:j});
			}
		}		
	}

	// create the animation options for a tile
	function createTile (param){
		$("#tile" + param.x + "_" + param.y).mouseover({x:param.x, y:param.y}, addtopath);
	}


	/* MAP MODIFICATION FUNCTIONS*/

	// highlights tiles for attacking and moving (originally, unlocking was attacking)
	function paintTiles(character, move){
		clearTiles();

		if(move == "Yes"){
			// paint available move tiles
			for(var i = -character.radius; i < character.radius + 1; i++){
				if((i + character.x >= 0) && (i + character.x < model.width)){
					for(var j = -character.radius; j < character.radius + 1; j++){
						if((j + character.y >= 0) && (j + character.y < model.height) && (Math.abs(i) + Math.abs(j) <= character.radius)){
							availTile({x:(i + character.x), y:(j + character.y)});
						}
					}			
				}
			}

			// paint attack tiles if attack range exists
			if(character.range > 0){
				for(var i = -(character.radius + character.range); i < (character.radius + character.range + 1); i++){
					if((i + character.x >= 0) && (i + character.x < model.width)){
						for(var j = -(character.radius + character.range); j < (character.radius + character.range + 1); j++){
							if((j + character.y >= 0) && (j + character.y < model.height) && (Math.abs(i) + Math.abs(j) == (character.radius + character.range))){
								attackTile({x:(i + character.x), y:(j + character.y)});
							}
						}			
					}
				}
			}
		} else {
			// paint attack tiles if attack range exists
			if(character.range > 0){
				for(var i = -(character.range); i < (character.range + 1); i++){
					if((i + character.x >= 0) && (i + character.x < model.width)){
						for(var j = -(character.range); j < (character.range + 1); j++){
							if((j + character.y >= 0) && (j + character.y < model.height) && (Math.abs(i) + Math.abs(j) == (character.range))){
								attackTile({x:(i + character.x), y:(j + character.y)});
							}
						}			
					}
				}
			}
		}

		// make sure the treasure is always "attackable" if it's in range
		if($("#tint" + model.goal.x + "_" + model.goal.y).hasClass("available")){
			$("#tint" + model.goal.x + "_" + model.goal.y).removeClass("available").addClass("attackable");
		}
	}

	// creates the treasure chest on the map
	function createTreasure(){
		// add the treasure chest
		$("#treasure").append("<img id='treasurechest' src='images/chest closed.png'>");

		// position the chest
		$("#treasurechest").css({position: "absolute", left: (8 + model.goal.x * 50) + "px", top: (8 + model.goal.y * 50) + "px"});
	}

	// shows the key on the map when over an orange tile
	function showKey(x, y){
		if(model.selectedcharacter.hasKey == "Yes"){
			// add the key and give it its css class
			$("#arrows").append('<img src="images/key.png" class="wiggling" id="key">')

			// position the key
			$("#key").css({position: "absolute", left: (x * 50) + "px", top: (y * 50) + "px"}).click(function(){return {x:x, y:y};}(), unlock);
		}
	}


	// clears all tiles' styles
	function clearTiles(param){
		$("[class*='tint']").removeClass().addClass("tint");
		$("[class*='tile']").removeClass("transparent");
	}

	// hides the key image
	function removeKey(){
		$("#key").remove();
	}

	// show a tile as available for movement
	function availTile(param){
		$("#tile" + param.x + "_" + param.y).addClass("transparent");
		$("#tint" + param.x + "_" + param.y).addClass("available");	
	}

	// show a tile as attackable for movement
	function attackTile(param){
		$("#tile" + param.x + "_" + param.y).addClass("transparent");
		$("#tint" + param.x + "_" + param.y).addClass("attackable");	
	}

	// tries to make the current tile the path destination
	function addtopath(event){
		// disable if view is not enabled
		if(view.enabled == "Yes" && model.selectedcharacter !== null){
			// draw an arrow only if the destination is valid
			if ($("#tint" + event.data.x + "_" + event.data.y).hasClass("available") && !(event.data.x == model.goal.x && event.data.y == model.goal.y)){		
				// calculate a path to the current tile
				findPath(model.selectedcharacter, event.data);

				// draw the path to the tile
				drawpath(model.selectedcharacter, view.displaypath);
			} else if ($("#tint" + event.data.x + "_" + event.data.y).hasClass("attackable")){		
				// draw the path to the last available tile
				drawpath(model.selectedcharacter, view.displaypath);

				// show the key to prompt the user to unlock
				showKey(event.data.x, event.data.y);
			}
		}
		
		// update the mouse position
		model.mousepos.x = event.data.x;
		model.mousepos.y = event.data.y;
	}

	// finds a path (if one exists) from the currently-selected character to another tile
	function findPath(character, dest){
		// disable if view is not enabled
		if(view.enabled == "Yes" && character.selected == "Yes"){	
			// set the starting point of the path
			view.displaypath.x = new Array();
			view.displaypath.y = new Array();
			
			// locate correct x coordinate
			for(var i = character.x; i < dest.x; i++){
				view.displaypath.x.push(i);
				view.displaypath.y.push(character.y);
			}
			for(var i = character.x; i > dest.x; i--){
				view.displaypath.x.push(i);
				view.displaypath.y.push(character.y);
			}
			
			// locate correct y coordinate
			for(var i = character.y; i < dest.y; i++){
				view.displaypath.x.push(dest.x);
				view.displaypath.y.push(i);
			}
			for(var i = character.y; i > dest.y; i--){
				view.displaypath.x.push(dest.x);
				view.displaypath.y.push(i);
			}
			
			// add the final coordinate
			view.displaypath.x.push(dest.x);
			view.displaypath.y.push(dest.y);
			
			// remove the first coordinate (is always 0,0 due to array initialization)
			view.displaypath.x.shift();
			view.displaypath.y.shift();
		}
	}

	// moves the currently-selected character to a new coordinate
	function move(param){
		// calculate the difference between the current grid position and the next coordinates in the path
		var x = param.data.xpath[param.data.i - 1] - model.selectedcharacter.x;
		var y = param.data.ypath[param.data.i - 1] - model.selectedcharacter.y;
		
		// update the model's position
		model.selectedcharacter.x += x;
		model.selectedcharacter.y += y;
		
		// animate the character to the new location
		$("#" + model.selectedcharacter.id).animate({ left: ("+=" + 50 * x), top: ("+=" + 50 * y) }, 150, "linear", function(){followPath(param);});
	}

	// follows a path of x and y coordinates
	function followPath(param){
		// check if start and finish are in the same place
		if((param.data.i == 0) && (view.enabled == "Yes") && (model.selectedcharacter.x == param.data.xpath[(param.data.xpath.length - 1)]) && (model.selectedcharacter.y == param.data.ypath[(param.data.ypath.length - 1)])){
			return;
		}
		
		// if the view is disabled, don't allow any new movements
		if((param.data.i == 0) && (view.enabled !== "Yes")){
			return;
		} else if(param.data.i < param.data.xpath.length){
			move({data: {xpath:param.data.xpath, ypath:param.data.ypath, i:(param.data.i + 1)}});
		} else {
			// re-enable the view, and set it up to draw a new arrow
			view.enabled = "Yes";
			view.redraw = "Yes";

			// deselect the model.selectedcharacter and clear the tile paint
			model.selectedcharacter.deselect();
			clearTiles();
			view.displaypath.x = new Array();
			view.displaypath.y = new Array();
		}
		
		// if we're following a new path, clear the arrows
		if((param.data.i == 0) && (view.enabled == "Yes")) {		
			// remove the arrow from the board, and keep it from being redrawn
			$("div[id='arrows']").empty();
			view.enabled = "No";
		}
	}

	// draws an arrow from a character to a location, following the given path
	function drawpath(character, path){
		// only draw a path if the view is enabled
		if(view.enabled !== "Yes"){
			return;
		}

		// if we have just drawn this path, don't do so again
		if((view.redraw !== "Yes") && (model.mousepos.x == path.x[(path.x.length - 1)]) && (model.mousepos.y == path.y[(path.y.length - 1)])){
			return;
		}
		
		// clear existing arrows out
		$("div[id='arrows']").empty();
		
		// check if the arrow is at least two tiles and the path is valid
		if((path.x.length > 1) && (path.y.length == path.x.length)){
			// draw the starting point
			drawstart({x:path.x[0], y:path.y[0]},{x:path.x[1], y:path.y[1]});
			
			for(var i = 1; (i < path.x.length) && (i < path.y.length); i++){
				if(i < (path.x.length - 1)){
					//draw a mid point
					drawmid({x:path.x[i-1], y:path.y[i-1]},{x:path.x[i], y:path.y[i]},{x:path.x[i+1], y:path.y[i+1]}, i);
				} else {
					//draw the end point
					drawend({x:path.x[i-1], y:path.y[i-1]},{x:path.x[i], y:path.y[i]});
					
					//update the current mouse position (used to prevent image shimmering from repeated mouseover events)
					model.mousepos.x = path.x[i];
					model.mousepos.y = path.y[i];
					
					//turn off redrawing
					view.redraw = "No";
				}
			}
		} else if((path.x.length == 1) && (path.y.length == path.x.length)){
			// draw the end point
			drawshort({x:model.selectedcharacter.x, y:model.selectedcharacter.y},{x:path.x[0], y:path.y[0]});
					
			//update the current mouse position (used to prevent image shimmering from repeated mouseover events)
			model.mousepos.x = path.x[i];
			model.mousepos.y = path.y[i];
			
			//turn off redrawing
			view.redraw = "No";
		}
	}

	// draws the start of an arrow showing the path
	function drawstart(here, next){
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
		$("#pathstart").mouseup({xpath:view.displaypath.x, ypath:view.displaypath.y, currentx: here.x, currenty: here.y, i:0}, followPath).mouseover({x:here.x, y:here.y}, addtopath);
	}

	// draws mid-sections of an arrow delineating the path
	function drawmid(prev, here, next, index){
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
		$("#arrow" + index).mouseup({xpath:view.displaypath.x, ypath:view.displaypath.y, currentx: here.x, currenty: here.y, i:0}, followPath).mouseover({x:here.x, y:here.y}, addtopath);
	}

	// draws an arrow at the end of the path
	function drawend(prev, here){
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
		$("#pathend").mouseup({xpath:view.displaypath.x, ypath:view.displaypath.y, currentx: here.x, currenty: here.y, i:0}, followPath).mouseover({x:here.x, y:here.y}, addtopath);
	}

	// draws a short arrow for immediately-adjacent tiles
	function drawshort(prev, here){
		// determine the direction of the arrow to draw and draw it
		if(prev.x < here.x){
			$("div[id='arrows']").append('<img src="images/right_arrow_short.png" class="midlayer" id="pathend">');
		} else if (prev.x > here.x){
			$("div[id='arrows']").append('<img src="images/left_arrow_short.png" class="midlayer" id="pathend">');
		} else if(prev.y < here.y){
			$("div[id='arrows']").append('<img src="images/down_arrow_short.png" class="midlayer" id="pathend">');
		} else if (prev.y > here.y){
			$("div[id='arrows']").append('<img src="images/up_arrow_short.png" class="midlayer" id="pathend">');
		}
		
		// move the arrow piece into place
		$("#pathend").css({position: "absolute", left: (8 + here.x * 50) + "px", top: (8 + here.y * 50) + "px"});
		
		// add click and mouseover functionality to prevent blocking by the arrow image
		$("#pathend").mouseup({xpath:view.displaypath.x, ypath:view.displaypath.y, currentx: here.x, currenty: here.y, i:0}, followPath).mouseover({x:here.x, y:here.y}, addtopath);
	}



	/* SCREEN DISPLAY FUNCTIONS */

	// shows the title screen at the start of the game
	function titleScreen(){
		// show the images that make up the title screen
		$("#messages").append("<img id='titleshadow' src='images/blackdot.png'/>");
		$("#messages").append("<img id='titleimg' src='images/title.png'/>");
		$("#messages").append("<img id='startmsg' src='images/click to start.png'/>");
		$("#messages").append("<img id='howtoplay' class='float' src='images/howtoplay.png'/>");
		$("#messages").append("<img id='credits' class='float' src='images/credits.png'/>");
		
		// make the title screen go away after clicking
		$("#titleshadow").click(clearTitle);
		$("#titleimg").click(clearTitle);
		$("#startmsg").click(clearTitle);

		// add links to credits and help pages, making the buttons float when moused-over
		$("#credits").click(goToCredits).mouseover(function(){$("#credits").addClass("float"); $("#howtoplay").removeClass("float"); floatup();}).mouseout(floatdown);
		$("#howtoplay").click(goToHelp).mouseover(function(){$("#howtoplay").addClass("float"); $("#credits").removeClass("float"); floatup();}).mouseout(floatdown);
	}

	// clears the title screen and allows gameplay to start
	function clearTitle(){
		$("#messages").empty();
		$("#messages").unbind("click");
	}

	// links to the help page
	function goToHelp(){
		window.location.href = "help.html";
	}

	// links to the credits page
	function goToCredits(){
		window.location.href = "credits.html";
	}

	// shows the win screen
	function youWin(){
		// stop the grid from reappearing
		$("[class*='tile']").animate({ opacity: 0 }, 700, "linear", function(){$("[class*='tile']").removeClass();});

		// display the you win message
		$("#messages").append("<img id='shadow' src='images/blackdot.png'/>");
		$("#shadow").animate({ opacity: 0.7 }, 1000, "linear");
		$("#messages").append("<img id='youwin' class='middletext' src='images/you win.png'/>");
		$("#youwin").animate({ opacity: 1, left: "-=25" }, 1000, "linear");
		$("#messages").append("<img id='star1' class='star' src='images/star.png'/>");
		$("#messages").append("<img id='star2' class='star' src='images/star.png'/>");
		$("#messages").append("<img id='star3' class='star' src='images/star.png'/>");
		$("#messages").append("<img id='star4' class='star' src='images/star.png'/>");
		$("#messages").append("<img id='star5' class='star' src='images/star.png'/>");

		// position and animate the stars in the you win message
		$("#star1").animate({ left: 300, top: 180}, 1500).addClass("wiggling");	
		$("#star2").animate({ left: 530, top: 270}, 1500).addClass("wiggling");
		$("#star3").animate({ left: 630, top: 184}, 1500).addClass("wiggling");
		$("#star4").animate({ left: 330, top: 260}, 1500).addClass("wiggling");
		$("#star5").animate({ left: 430, top: 200}, 1500).addClass("wiggling");

		// display a play again message
		setTimeout(playAgain, 3500);
	}

	// creates and animates the play again button
	function playAgain(){
		$("#messages").append("<img id='playagain' class='again float' src='images/playagain.png'/>");
		$("#playagain").animate({ opacity: 1 }, 1000, "linear").click(refreshPage).mouseover(floatup).mouseout(floatdown);
	}

	// whites out the screen and displays the game over messages
	function youLose(){
		// whites out elements on the screen, and calls disappear after 1.5 seconds
		$("#mapimage").animate({ opacity: 0 }, 1000, "linear", function(){setTimeout(disappear, 1500)});
		$("#cloudimage").animate({ opacity: 0 }, 700, "linear", function(){$("#cloudimage").removeClass();});
		$("#treasurechest").animate({ opacity: 0 }, 1000, "linear");
		$("[class*='tile']").animate({ opacity: 0 }, 700, "linear", function(){$("[class*='tile']").removeClass();});

		// fade in dropped key message
		$("#messages").append("<img id='keysnow' class='toptext' src='images/keysnow.png'/>");
		$("#keysnow").animate({ opacity: 1 }, 1500, "linear")
	}

	// makes the character fade out and calls messageFade after 1 second
	function disappear(){
		// fade out character
		$("#characters").animate({ opacity: 0 }, 1000, "linear", messageFade);
	}

	// fades out the key drop message and calls gameOver after 1.5 seconds
	function messageFade(){
		$("#messages").append("<img id='shadow' src='images/blackdot.png'/>");
		$("#keysnow").animate({ opacity: 0 }, 1500, "linear");
		$("#shadow").animate({ opacity: 1 }, 3000, "linear", gameOver);
	}

	// displays the game over message and calls tryAgain after 3.5 seconds
	function gameOver(){
		$("#messages").append("<img id='gameover' src='images/gameover.png'/>");
		$("#gameover").animate({ opacity: 1 }, 1000, "linear");
		setTimeout(tryAgain, 3500);
	}

	// creates and animates the try again button
	function tryAgain(){
		$("#messages").append("<img id='tryagain' class='again float' src='images/tryagain.png'/>");
		$("#tryagain").animate({ opacity: 1 }, 1000, "linear").click(refreshPage).mouseover(floatup).mouseout(floatdown);
	}

	// animation function for buttons to float up
	function floatup(){
		$("[class*='float']").animate({ top: "-=5"});
	}
	
	// animation function for buttons to float down
	function floatdown(){
		$("[class*='float']").animate({ top: "+=5"});
	}

	// refreshes the page, restarting the game
	function refreshPage(){
		location.reload();
	}



	/* GAME LOGIC FUNCTIONS */

	// attempts to use the key. Either wins or loses the game, depending on location
	function unlock(param){
		// move the character to the selected location
		followPath({data: {xpath:view.displaypath.x, ypath:view.displaypath.y, i:0}});

		// if the chest is here, open it!
		if(param.data.x == model.goal.x && param.data.y == model.goal.y){
			$("#treasurechest").attr("src", "images/chest open.png");
			clearTiles();
			$("#treasure").append("<img class='jewel' src='images/gem blue.png'/>");
			$(".jewel").animate({ opacity: 1, top: "-=50"}, 1500, youWin);
		} else {
			// initiate the game loss sequence
			youLose();

			$("#key").remove();
			model.selectedcharacter.hasKey = "No";
		}
	}