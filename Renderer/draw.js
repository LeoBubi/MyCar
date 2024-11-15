////////////////////////////////////////////////////
///// DRAW

function draw(){
	/* print FPS info */
	drawNow = Date.now();
	if (drawNow - FPSCheck >= 500){
		logFPS("FPS\n" + Math.floor(1000/(drawNow - drawCheck)));
		FPSCheck = drawNow;
	}
	drawCheck = drawNow;

	prapeareDrawing();
	drawShadowMaps();
	drawScene();
}

function prapeareDrawing(){
	/* set sky (background) color */
	gl.clearColor(skyColor[0], skyColor[1], skyColor[2], skyColor[3]);

	/* set scene lights */
	setSceneLights(contextShader, lampsCoords);
	setSceneLights(carShader, lampsCoords);

	/* pass sun direction to shaders */
	setSunDirection(contextShader);
	setSunDirection(carShader);

	/* set view matrix */
	cameras[currentCamera].update(car.utils.frame);
	viewMatrix = cameras[currentCamera].matrix();

	/* set headlights view matrix */
	cameras[2].update(car.utils.frame);
	rightHLViewMatrix = cameras[2].matrix();

	cameras[3].update(car.utils.frame);
	leftHLViewMatrix = cameras[3].matrix();

	/* pass camera's position to shaders */
	setCameraPosition(contextShader);
	setCameraPosition(carShader);

	/* initialize and setup matrix stack */
	stack = new MatrixStack();
	stack.loadIdentity();
	stack.multiply(viewMatrix.elements);
}



function drawShadowMaps(){
	gl.useProgram(shadowShader);
	gl.viewport(0, 0, OS_WIDTH, OS_HEIGHT);

	/*********************/

	gl.bindFramebuffer(gl.FRAMEBUFFER, rightFBO);

	gl.uniformMatrix4fv(shadowShader.u_MvMatrix_Loc, false, rightHLViewMatrix.elements);

	gl.clear(gl.DEPTH_BUFFER_BIT);

	drawObject_ShadowMap(shadowShader, Game.scene.groundObj);
	drawObject_ShadowMap(shadowShader, Game.scene.trackObj);
	for (var i in Game.scene.buildingsObj){
		drawObject_ShadowMap(shadowShader, Game.scene.buildingsObjTex[i]);
		drawObject_ShadowMap(shadowShader, Game.scene.buildingsObjTex[i].roof);
	}

	/*********************/

	gl.bindFramebuffer(gl.FRAMEBUFFER, leftFBO);

	gl.uniformMatrix4fv(shadowShader.u_MvMatrix_Loc, false, leftHLViewMatrix.elements);

	gl.clear(gl.DEPTH_BUFFER_BIT);

	drawObject_ShadowMap(shadowShader, Game.scene.groundObj);
	drawObject_ShadowMap(shadowShader, Game.scene.trackObj);
	for (var i in Game.scene.buildingsObj){
		drawObject_ShadowMap(shadowShader, Game.scene.buildingsObjTex[i]);
		drawObject_ShadowMap(shadowShader, Game.scene.buildingsObjTex[i].roof);
	}
}




function drawScene(){

	gl.viewport(0, 0, canvasWidth, canvasHeight);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);

	/* draw sky (background) */
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	/* draw car */
	gl.useProgram(carShader);

	stack.push();
	stack.multiply(car.utils.frame);
	drawCar();
	stack.pop();

	/* draw static elements (ground, track and buildings) */
	gl.useProgram(contextShader);

	drawStatic();
}



function drawCar(){
	/* draw car */
	stack.push();
	stack.multiply(carMatrix.elements);

	modMatrix.set(carMatrix.multiplied(car.utils.frame));
	normalMatrix.setInverseOf(modMatrix);
	normalMatrix.transpose();
	gl.uniformMatrix4fv(carShader.u_ModMatrix_Loc, false, modMatrix.elements);
	gl.uniformMatrix4fv(carShader.u_NormalMatrix_Loc, false, normalMatrix.elements);

	gl.uniformMatrix4fv(carShader.u_MvMatrix_Loc, false, stack.matrix);
	setLightRefl(carShader.u_DiffFactor_Loc, carShader.u_SpecFactor_Loc, 0.5, 0.5);
	drawObject(carShader, car.body, carBodyColor);
	setLightRefl(carShader.u_DiffFactor_Loc, carShader.u_SpecFactor_Loc, 0.3, 0.9);
	drawObject(carShader, car.glass, carGlassColor);

	gl.useProgram(carLightsShader);
	gl.uniformMatrix4fv(carLightsShader.u_MvMatrix_Loc, false, stack.matrix);
	drawObject(carLightsShader, car.tailLights, carTailLightsColor);
	drawObject(carLightsShader, car.frontLights, carFrontLightsColor);
	
	gl.useProgram(carShader);
	stack.pop();

	/* calculate wheels angle */
	now = Date.now();
	elapsed = now - timeCheck;
	timeCheck = now;
	wheelRotAngle = (wheelRotAngle - (car.utils.speed*2200)*(elapsed/1000)) % 360;

	rotatedWheelMatrix.setRotate(wheelRotAngle, 1, 0, 0);
	rotatedWheelMatrix.concat(wheelBaseMatrix);

	/* draw back wheels */
	setLightRefl(carShader.u_DiffFactor_Loc, carShader.u_SpecFactor_Loc, 0.2, 0.1);

	drawBackWheel(0.58, 0.46, 1.5);
	drawBackWheel(-0.58, 0.46, 1.5);

	/* draw front wheels */
	wheelSideAngle = car.utils.wheelsAngle * rad2deg;

	drawFrontWheel(0.58, 0.46, -1.5);
	drawFrontWheel(-0.58, 0.46, -1.5);

}



function drawStatic(){
	modMatrix.setIdentity();
	normalMatrix.setIdentity();

	/* pass shadow maps to shaders */
	gl.activeTexture(gl.TEXTURE6);
	gl.bindTexture(gl.TEXTURE_2D, rightFBO.colorTexture);
	gl.uniform1i(contextShader.u_ShadowMap_RightHL_Loc, 6);

	gl.activeTexture(gl.TEXTURE5);
	gl.bindTexture(gl.TEXTURE_2D, leftFBO.colorTexture);
	gl.uniform1i(contextShader.u_ShadowMap_LeftHL_Loc, 5);

	/* pass matricies to shaders */
	gl.uniformMatrix4fv(contextShader.u_ModMatrix_Loc, false, modMatrix.elements);
	gl.uniformMatrix4fv(contextShader.u_NormalMatrix_Loc, false, normalMatrix.elements);
	gl.uniformMatrix4fv(contextShader.u_MvMatrix_Loc, false, stack.matrix);
	gl.uniformMatrix4fv(contextShader.u_MvMatrix_RightHL_Loc, false, rightHLViewMatrix.elements);
	gl.uniformMatrix4fv(contextShader.u_MvMatrix_LeftHL_Loc, false, leftHLViewMatrix.elements);

	/* draw objects */
	setLightRefl(contextShader.u_DiffFactor_Loc, contextShader.u_SpecFactor_Loc, 0.7, 0.2);
	loadTexture(grassTexture, 0);
	drawTexObject(contextShader, Game.scene.groundObj, 0);

	setLightRefl(contextShader.u_DiffFactor_Loc, contextShader.u_SpecFactor_Loc, 0.5, 0.3);
	loadTexture(roadTexture, 0);
	loadTexture(normalTexture, 1);
	drawTexObject(contextShader, Game.scene.trackObj, 0, 1);

	setLightRefl(contextShader.u_DiffFactor_Loc, contextShader.u_SpecFactor_Loc, 0.4, 0.1);
	loadTexture(roofTexture, 0);
	for (var i in Game.scene.buildingsObj){
		loadTexture(facadeTexture[i], 1);
		drawTexObject(contextShader, Game.scene.buildingsObjTex[i], 1);
		drawTexObject(contextShader, Game.scene.buildingsObjTex[i].roof, 0);
	}
}