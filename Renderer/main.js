const rad2deg = 180 / Math.PI;

// setupWebGL
var canvas;
var gl;

// setupData
var canvasWidth;
var canvasHeight;
var canvasRatio;

var OS_WIDTH;
var OS_HEIGHT;
var OS_RATIO;

var cylinderFaces;
var skyColor;

var fov;
var ratio;
var nearPlane;
var farPlane;

var lightFov;
var lightRatio;

var groundColor;
var groundLineColor;
var trackColor;
var trackLineColor;
var buildingColor;
var buildingLineColor;

var carBodyColor;
var carGlassColor;
var carTailLightsColor;
var carFrontLightsColor;
var carLineColor;
var wheelColor;
var wheelLineColor;

var lampsNumber;
var lampIntAngle;
var lampExtAngle;

var lampColor;
var sunColor;
var ambientColor;

var lightsOn;

// setupScene
var car;
var cube;
var cylinder;

var cameras;

// setupFramebuffer
var rightFBO;
var leftFBO;

// setupDrawing
var shadowShader;
var contextShader;
var carShader;
var carLightsShader;

var modMatrix;
var normalMatrix;

var lampsCoords;

var carMatrix;
var wheelRotAngle;
var wheelBaseMatrix;

var grassTexture;
var roadTexture;
var normalTexture;
var roofTexture;
var facade1Texture;
var facade2Texture;
var facade3Texture;
var facade4Texture;
var facade5Texture;
var facade6Texture;
var facade7Texture;

var rightHLViewMatrix;
var leftHLViewMatrix;

// draw
var drawNow;

// drawScene

var currentCamera;

var viewMatrix;
var lightViewMatrix;
var stack;

// drawCar
var timeCheck;
var elapsed;
var now;

var rotatedWheelMatrix;
var wheelMatrix;
var wheelSideAngle;



/**************************************************/



function logInfo(){

	log(
		`
		Commands:
		W: move forward
		S: move backwards
		A: turn left
		D: turn right
		
		Cameras:
		1: follow from up
		2: chase
		3: right headlight
		4: left headlight

		Chase camera:
		R: reverse view
		arrows: change camera position
		mouse: change view direction

		Other options:
		N: night/day
		L: lights off/on
		`);
}



/**************************************************/



function display(){
	draw();
	window.requestAnimationFrame(display);
}



/**************************************************/



function main(){
	/* setup */
	logInfo();
	setupWebGL();
	setupData();
	setupScene();
	setupFramebuffers();
	setupDrawing();

	/* draw */
	timeCheck = Date.now();
	drawCheck = Date.now();
	FPSCheck = Date.now();
	display();
}








