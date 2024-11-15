function createCarBuffers(car){
	createObjectBuffers(car.body);
	createObjectBuffers(car.glass);
	createObjectBuffers(car.tailLights);
	createObjectBuffers(car.frontLights);
}



function drawWheel(program, wheelMatrix, color, lineColor, stack, mvMatrixLoc){
	stack.push();
	stack.multiply(wheelMatrix.elements);

	modMatrix.set(wheelMatrix.multiplied(car.utils.frame));
	normalMatrix.setInverseOf(modMatrix);
	normalMatrix.transpose();
	gl.uniformMatrix4fv(carShader.u_ModMatrix_Loc, false, modMatrix.elements);
	gl.uniformMatrix4fv(carShader.u_NormalMatrix_Loc, false, normalMatrix.elements);
	
	gl.uniformMatrix4fv(mvMatrixLoc, false, stack.matrix);
	stack.pop();
	drawObject(program, cylinder, color, lineColor);
}



function drawBackWheel(Tx, Ty, Tz){
	wheelMatrix.setTranslate(Tx, Ty, Tz);
	wheelMatrix.concat(rotatedWheelMatrix);
	drawWheel(carShader, wheelMatrix, wheelColor, wheelLineColor, stack, carShader.u_MvMatrix_Loc);
}



function drawFrontWheel(Tx, Ty, Tz){
	wheelMatrix.setTranslate(Tx, Ty, Tz);
	wheelMatrix.rotate(wheelSideAngle, 0, 1, 0);
	wheelMatrix.concat(rotatedWheelMatrix);
	drawWheel(carShader, wheelMatrix, wheelColor, wheelLineColor, stack, carShader.u_MvMatrix_Loc);
}