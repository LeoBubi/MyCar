/*****************************************/
/*                                       */
/*   !!    setupData is in data.js   !!  */
/*                                       */
/*****************************************/



////////////////////////////////////////////////////
///// SETUP WEBGL
function setupWebGL(){
	canvas = document.getElementById("OUTPUT-CANVAS");
	gl = canvas.getContext("webgl");
	gl.enable(gl.DEPTH_TEST);
}



////////////////////////////////////////////////////
///// SETUP SCENE
function setupScene(){
	/* initialize objects to be rendered */
	// ground
	// track
	// buildings
	initializeObjects(cylinderFaces);

	/* array of cameras that will be used */
	cameras = [];
	cameras.push(new FollowFromUpCamera());
	cameras.push(new ChaseCamera());
	cameras.push(new RightLightCamera());
	cameras.push(new LeftLightCamera());

	lampsNumber = Game.scene.lamps.length;
}



////////////////////////////////////////////////////
///// SETUP FRAMEBUFFERS
function setupFramebuffers(){
	rightFBO = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, rightFBO);

	/* color texture */
	rightFBO.colorTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, rightFBO.colorTexture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, OS_WIDTH, OS_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, rightFBO.colorTexture, 0);

	/* framebuffer renderbuffer */
	rightFBO.depthRenderbuffer = gl.createRenderbuffer();
	gl.bindRenderbuffer(gl.RENDERBUFFER, rightFBO.depthRenderbuffer);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, OS_WIDTH, OS_HEIGHT);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rightFBO.depthRenderbuffer);

	var e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  	if (gl.FRAMEBUFFER_COMPLETE !== e) {
	    console.log('Frame buffer object is incomplete: ' + e.toString());
	    return false;
  	}

  	/************************************/

  	leftFBO = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, leftFBO);

	/* color texture */
	leftFBO.colorTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, leftFBO.colorTexture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, OS_WIDTH, OS_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, leftFBO.colorTexture, 0);

	/* framebuffer renderbuffer */
	leftFBO.depthRenderbuffer = gl.createRenderbuffer();
	gl.bindRenderbuffer(gl.RENDERBUFFER, leftFBO.depthRenderbuffer);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, OS_WIDTH, OS_HEIGHT);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, leftFBO.depthRenderbuffer);

	e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  	if (gl.FRAMEBUFFER_COMPLETE !== e) {
	    console.log('Frame buffer object is incomplete: ' + e.toString());
	    return false;
  	}
}



////////////////////////////////////////////////////
///// SETUP DRAWING
function setupDrawing(){
	/* create shaders */
	shadowShader = new ShadowShader(gl);
	contextShader = new ContextShader(gl);
	carShader = new CarShader(gl);
	carLightsShader = new CarLightsShader(gl);

	/* create matricies to be used later */
	modMatrix = new Matrix4();
	normalMatrix = new Matrix4();

	/* add listeners for the mouse/keyboard events */
	canvas.addEventListener("mousedown", on_mouseDown, false);
	canvas.addEventListener("mouseup", on_mouseUp, false);
	canvas.addEventListener("mousemove", on_mouseMove, false);
	canvas.addEventListener("keydown", on_keydown, false);
	canvas.addEventListener("keyup", on_keyup, false);




	/* set street lights */
	lampsCoords = [];
	for (let i = 0; i < lampsNumber; ++i){
		lampsCoords[3*i] = Game.scene.lamps[i].position[0];
		lampsCoords[3*i +1] = Game.scene.lamps[i].height;
		lampsCoords[3*i +2] = Game.scene.lamps[i].position[2];
	}


	/* set projection matrix & pass it to shaders */
	var projMatrix = new Matrix4();
	projMatrix.setPerspective(fov, ratio, nearPlane, farPlane);

	setProjMatrix(contextShader, projMatrix);
	setProjMatrix(carShader, projMatrix);
	setProjMatrix(carLightsShader, projMatrix);

	/* set HEADLIGHTS projection matrix & pass it to shaders */
	var lightProjMatrix = new Matrix4();
	lightProjMatrix.setPerspective(lightFov, lightRatio, nearPlane, farPlane);

	gl.useProgram(contextShader);
	gl.uniformMatrix4fv(contextShader.u_ProjMatrix_HL_Loc, false, lightProjMatrix.elements);

	gl.useProgram(shadowShader);
	gl.uniformMatrix4fv(shadowShader.u_ProjMatrix_Loc, false, lightProjMatrix.elements);
	
	/* set the camera currently in use */
	currentCamera = 0;



	/* set car matrix */
	carMatrix = new Matrix4();
	carMatrix.setRotate(90, 0, 1, 0);
	carMatrix.translate(-carSize[0]/2, 0.2, -carSize[2]/2);

	/* set wheel matricies */
	wheelRotAngle = 0;

	rotatedWheelMatrix = new Matrix4();
	wheelMatrix = new Matrix4();

	wheelBaseMatrix = new Matrix4();
	wheelBaseMatrix.setRotate(90, 0, 1, 0);
	wheelBaseMatrix.rotate(90, 1, 0, 0);
	wheelBaseMatrix.scale(0.5, 0.25, 0.5);
	wheelBaseMatrix.translate(0, -1, 0);

	/* set textures */
	grassTexture = setTexture("../common/textures/grass.jpg");
	roadTexture = setTexture("../common/textures/road.jpg");
	normalTexture = setTexture("../common/textures/asphalt_normal_map.jpg");
	roofTexture = setTexture("../common/textures/roof.jpg");
	facadeTexture = [];
	facadeTexture.push(setTexture("../common/textures/facade1.jpg"));
	facadeTexture.push(setTexture("../common/textures/facade2.jpg"));
	facadeTexture.push(setTexture("../common/textures/facade3.jpg"));
	facadeTexture.push(setTexture("../common/textures/facade4.jpg"));
	facadeTexture.push(setTexture("../common/textures/facade5.jpg"));
	facadeTexture.push(setTexture("../common/textures/facade6.jpg"));
	facadeTexture.push(setTexture("../common/textures/facade7.jpg"));

	/* set headlight texture */
	lightTexture = setPNGTexture("../common/textures/headlight.png");
	loadTexture(lightTexture, 7);
}