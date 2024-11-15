////////////////////////////////////////////////////
///// EVENT LISTENERS

var dragging = false;
var lastX = -1;
var lastY = -1;
var factor = 1/100;
var neg = true;
var night = false;
var lights = true;

function on_mouseDown(e){
	lastX = e.clientX;
	lastY = e.clientY;
	dragging = true;
}
function on_mouseUp(e){
	dragging = false;
}

function on_mouseMove(e){
	var x = e.clientX;
	var y = e.clientY;
	if (dragging) {
		var dx = factor * (x - lastX);
		var dy = factor * (y - lastY);
		if (neg) dx = -dx;
		cameras[1].chdir(dx, dy);
	}
	lastX = x;
	lastY = y;
}

function on_keyup(e){
	car.utils.control_keys[e.key] = false;
}
function on_keydown(e){
	car.utils.control_keys[e.key] = true;
	
	if 		(e.key == "1") update_camera(0);
	else if (e.key == "2") update_camera(1);
	else if (e.key == "3") update_camera(2);
	else if (e.key == "4") update_camera(3);

	else if (e.key == "ArrowUp")
		cameras[1].move(0.0, 0.1, 0.0);

	else if (e.key == "ArrowDown")
		cameras[1].move(0.0, -0.1);

	else if (e.key == "ArrowLeft"){
		if (neg) cameras[1].move(-0.1, 0.0);
		else cameras[1].move(0.1, 0.0);
	}

	else if (e.key == "ArrowRight")
		if (neg) cameras[1].move(0.1, 0.0);
		else cameras[1].move(-0.1, 0.0);

	else if (e.key == "r"){
		cameras[1].rearView();
		neg = !neg;
	}


	else if (e.key == "n"){
		night = !night;
		if (night) {
			skyColor = [0.05, 0.1, 0.2, 1.0];
			sunColor = [0.0, 0.0, 0.0];
		}
		else {
			skyColor = [0.34, 0.5, 0.74, 1.0];
			sunColor = [0.4, 0.4, 0.4];
		}
	}

	else if (e.key == "l"){
		lights = !lights;
		if (lights)
			lightsOn = 1.0;
		else
			lightsOn = 0.0;
	}
}