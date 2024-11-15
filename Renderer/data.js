////////////////////////////////////////////////////
///// SETUP DATA
function setupData(){
	/* retrieve canvas measures */
	canvasWidth = canvas.width;
	canvasHeight = canvas.height;
	canvasRatio = canvasWidth / canvasHeight;

	/* set off screen measures */
	OS_WIDTH = 1024;
	OS_HEIGHT = 1024;
	OS_RATIO = OS_WIDTH / OS_HEIGHT;

	/* cylinder shape quality */
	cylinderFaces = 30;

	/*sky (background) color*/
	skyColor = [0.34, 0.5, 0.74, 1.0];

	/* view parameters */
	fov = 45;	// degrees
	ratio = canvasRatio;
	nearPlane = 1;
	farPlane = 500;

	/* headlights view parameters */
	lightFov = 25;
	lightRatio = OS_RATIO;

	/* objects color */
	groundColor = [0.3, 0.7, 0.2, 1.0];
	groundLineColor = [0, 0, 0, 1.0];
	
	trackColor = [0.9, 0.8, 0.7, 1.0];
	trackLineColor = [0, 0, 0, 1.0];

	buildingColor = [0.8, 0.8, 0.8, 1.0];
	buildingLineColor = [0.2, 0.2, 0.2, 1.0];


	/* CAR COLOR */

	carBodyColor = [0.8, 0.8, 0.8, 1.0];
	carGlassColor = [0.0, 0.6, 0.9, 1.0];
	carTailLightsColor = [1.0, 0.25, 0.15, 1.0];
	carFrontLightsColor = [1.0, 0.9, 0.0, 1.0];
	carLineColor = [0.1, 0.1, 0.1, 1.0];

	wheelColor = [0.2, 0.2, 0.2, 1.0];
	wheelLineColor = [0.5, 0.5, 0.5, 1.0];


	/* street lamps */
	// lampsNumber = Game.scene.lamps.length; -> initialized in setupScene
	lampIntAngle = 50.0;
	lampExtAngle = 70.0;

	/* lights colors */
	lampColor = [0.8, 0.6, 0.25];
	sunColor = [0.4, 0.4, 0.4];
	ambientColor = [0.2, 0.2, 0.2];

	lightsOn = 1.0;
}